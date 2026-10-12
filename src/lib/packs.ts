import type { Prisma, Rarity } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { DEV_UNLOCK_ALL } from "@/lib/dev";
import { rollPack, type RandomSource, type RolledSlot, type TierPools } from "@/lib/pack-roll";
import { startOfUtcDay } from "@/lib/utc-day";

/** One revealed card: everything the reveal and "already opened" views render. */
export interface PackSlot {
  position: number;
  pokemonId: number;
  slug: string;
  name: string;
  /** The shiny artwork for a shiny pull, otherwise the regular one. */
  artworkUrl: string;
  rarity: Rarity;
  isShiny: boolean;
  /** True when this pull caught the Pokémon for the first time. */
  isNew: boolean;
}

export interface OpenedPack {
  id: string;
  /** ISO timestamp — serializable across the RSC → client boundary. */
  openedAt: string;
  slots: PackSlot[];
}

export class DailyPackAlreadyOpenedError extends Error {
  constructor() {
    super("Today's daily pack has already been opened");
    this.name = "DailyPackAlreadyOpenedError";
  }
}

type Tx = Prisma.TransactionClient;

const CARD_FIELDS = {
  id: true,
  slug: true,
  name: true,
  artworkUrl: true,
  shinyArtworkUrl: true,
} as const;

interface CardFields {
  id: number;
  slug: string;
  name: string;
  artworkUrl: string;
  shinyArtworkUrl: string | null;
}

type RollLike = Pick<PackSlot, "position" | "pokemonId" | "rarity" | "isShiny">;

function uniquePokemonIds(rolls: RollLike[]): number[] {
  return [...new Set(rolls.map((roll) => roll.pokemonId))];
}

/**
 * Only the first slot holding a given Pokémon can be "New" — a second copy in
 * the same pack is a duplicate of the first.
 */
function toSlots(
  rolls: RollLike[],
  cards: CardFields[],
  isFirstCatch: (pokemonId: number) => boolean,
): PackSlot[] {
  const seen = new Set<number>();
  return rolls.map((roll) => {
    const card = cards.find((c) => c.id === roll.pokemonId)!;
    const isNew = !seen.has(roll.pokemonId) && isFirstCatch(roll.pokemonId);
    seen.add(roll.pokemonId);
    // Built field by field: the read path's rows also carry the nested
    // `pokemon` relation, which mustn't ride along to the client.
    return {
      position: roll.position,
      pokemonId: roll.pokemonId,
      rarity: roll.rarity,
      isShiny: roll.isShiny,
      slug: card.slug,
      name: card.name,
      artworkUrl: roll.isShiny ? (card.shinyArtworkUrl ?? card.artworkUrl) : card.artworkUrl,
      isNew,
    };
  });
}

/**
 * The claim is the concurrency guard: a conditional UPDATE takes the user
 * row's lock, so a second open (another tab, a double submit) blocks here
 * until the first commits, then matches no row. Checking first and writing
 * later would let both through.
 */
async function claimDailyPack(tx: Tx, userId: string, now: Date): Promise<void> {
  const claimed = await tx.user.updateMany({
    where: DEV_UNLOCK_ALL
      ? { id: userId }
      : {
          id: userId,
          OR: [{ lastDailyAt: null }, { lastDailyAt: { lt: startOfUtcDay(now) } }],
        },
    data: { lastDailyAt: now },
  });
  if (claimed.count === 0) throw new DailyPackAlreadyOpenedError();
}

async function loadTierPools(tx: Tx): Promise<TierPools> {
  const all = await tx.pokemon.findMany({ select: { id: true, rarity: true } });
  const pools: TierPools = { COMMON: [], UNCOMMON: [], RARE: [], ULTRA_RARE: [] };
  for (const pokemon of all) pools[pokemon.rarity].push(pokemon.id);
  return pools;
}

async function createDailyPack(tx: Tx, userId: string, rolls: RolledSlot[], now: Date): Promise<string> {
  const pack = await tx.pack.create({
    data: {
      userId,
      type: "DAILY",
      source: "DAILY_FREE",
      openedAt: now,
      rolls: { create: rolls },
    },
    select: { id: true },
  });
  return pack.id;
}

/**
 * A row can already exist from rating/favoriting/wishlisting with `isCaught`
 * false, so "first catch" is read, not inferred from create.
 */
async function findCaughtPokemonIds(tx: Tx, userId: string, pokemonIds: number[]): Promise<Set<number>> {
  const existing = await tx.userPokemon.findMany({
    where: { userId, pokemonId: { in: pokemonIds }, isCaught: true },
    select: { pokemonId: true },
  });
  return new Set(existing.map((row) => row.pokemonId));
}

/** Adds every copy of one Pokémon from this pack, leaving rating and review untouched. */
async function addPullsToCollection(
  tx: Tx,
  userId: string,
  pokemonId: number,
  pulls: RolledSlot[],
  firstCaughtAt: Date | undefined,
): Promise<void> {
  const shinies = pulls.filter((roll) => roll.isShiny).length;
  // `count` is every copy, shiny included; `shinyCount` is the shiny subset (§4.4).
  await tx.userPokemon.upsert({
    where: { userId_pokemonId: { userId, pokemonId } },
    create: { userId, pokemonId, isCaught: true, count: pulls.length, shinyCount: shinies, firstCaughtAt },
    update: {
      isCaught: true,
      count: { increment: pulls.length },
      shinyCount: { increment: shinies },
      firstCaughtAt,
    },
  });
}

/**
 * Opens today's free daily pack (project-overview §4, §10.3) in one
 * transaction: claim the day, roll three slots, write the pack and its rolls,
 * and add the pulls to the collection. Throws `DailyPackAlreadyOpenedError`
 * when today's pack was already claimed. Pity and feed events come in later
 * slices (packs overview §3).
 */
export async function openDailyPack(
  userId: string,
  random: RandomSource = Math.random,
): Promise<OpenedPack> {
  // One timestamp for the claim, the pack and any first catches, so the
  // "New" label can be re-derived later from `firstCaughtAt === openedAt`.
  const now = new Date();

  return prisma.$transaction(async (tx) => {
    await claimDailyPack(tx, userId, now);

    const rolls = rollPack(await loadTierPools(tx), random);
    const pokemonIds = uniquePokemonIds(rolls);
    const packId = await createDailyPack(tx, userId, rolls, now);

    const alreadyCaught = await findCaughtPokemonIds(tx, userId, pokemonIds);
    for (const pokemonId of pokemonIds) {
      const pulls = rolls.filter((roll) => roll.pokemonId === pokemonId);
      await addPullsToCollection(tx, userId, pokemonId, pulls, alreadyCaught.has(pokemonId) ? undefined : now);
    }

    const cards = await tx.pokemon.findMany({ where: { id: { in: pokemonIds } }, select: CARD_FIELDS });

    return {
      id: packId,
      openedAt: now.toISOString(),
      slots: toSlots(rolls, cards, (pokemonId) => !alreadyCaught.has(pokemonId)),
    };
  });
}

async function hasOpenedDailyPackSince(userId: string, startOfToday: Date): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { lastDailyAt: true } });
  return !!user?.lastDailyAt && user.lastDailyAt >= startOfToday;
}

function findDailyPackSince(userId: string, startOfToday: Date) {
  return prisma.pack.findFirst({
    where: { userId, source: "DAILY_FREE", openedAt: { gte: startOfToday } },
    orderBy: { openedAt: "desc" },
    select: {
      id: true,
      openedAt: true,
      rolls: {
        orderBy: { position: "asc" },
        select: { position: true, pokemonId: true, rarity: true, isShiny: true, pokemon: { select: CARD_FIELDS } },
      },
    },
  });
}

/**
 * Pokémon first caught by the pack opened at `openedAt`. `openDailyPack`
 * writes both from the same timestamp, so equality means this pack is where
 * the Pokémon was first caught.
 */
async function findCaughtInPack(userId: string, pokemonIds: number[], openedAt: Date): Promise<Set<number>> {
  const collection = await prisma.userPokemon.findMany({
    where: { userId, pokemonId: { in: pokemonIds }, firstCaughtAt: openedAt },
    select: { pokemonId: true },
  });
  return new Set(collection.map((row) => row.pokemonId));
}

/**
 * Today's (UTC) daily pack for the user, or `null` when it hasn't been opened
 * yet. `lastDailyAt` decides, the same field the claim in `openDailyPack`
 * checks, so the page and the claim can never disagree about "opened today".
 */
export async function getTodaysDailyPack(userId: string): Promise<OpenedPack | null> {
  const startOfToday = startOfUtcDay(new Date());
  if (!(await hasOpenedDailyPackSince(userId, startOfToday))) return null;

  const pack = await findDailyPackSince(userId, startOfToday);
  if (!pack) return null;

  const caughtHere = await findCaughtInPack(userId, uniquePokemonIds(pack.rolls), pack.openedAt);

  return {
    id: pack.id,
    openedAt: pack.openedAt.toISOString(),
    slots: toSlots(
      pack.rolls,
      pack.rolls.map((roll) => roll.pokemon),
      (pokemonId) => caughtHere.has(pokemonId),
    ),
  };
}
