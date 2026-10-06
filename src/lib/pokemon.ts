import { cache } from "react";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import type { PokedexFilters, PokedexStatus } from "@/lib/pokedex-filters";
import { getRatingSummaries, type RatingSummary } from "@/lib/user-pokemon";

export const getPokemon = cache((slug: string) =>
  prisma.pokemon.findUnique({ where: { slug } }),
);

// Not wrapped in React `cache()` — it compares arguments by identity, so a
// fresh `ids` array on every call would never hit the cache.
export async function getPokemonsByIds(ids: number[]) {
  const pokemons = await prisma.pokemon.findMany({ where: { id: { in: ids } } });
  const byId = new Map(pokemons.map((pokemon) => [pokemon.id, pokemon]));
  return ids.map((id) => byId.get(id)).filter((pokemon) => pokemon !== undefined);
}

export const POKEDEX_PAGE_SIZE = 24;

// Longest dex number we'll try to match — keeps a long digit string from
// overflowing the Int `id` column.
const MAX_DEX_DIGITS = 5;

export const getPokemonCount = cache(() => prisma.pokemon.count());

/**
 * The Pokédex search: name contains the term (case-insensitive), OR slug
 * contains it with spaces as hyphens (so "mr mime" / "flabebe" find names
 * with punctuation or accents), OR — for a whole number, with an optional "#"
 * and leading zeros — the dex number equals it exactly.
 */
function pokedexSearchWhere(search: string): Prisma.PokemonWhereInput {
  if (!search) return {};

  // Prisma's `contains` becomes `LIKE '%…%'` without escaping the term, so a
  // literal "%" or "_" would otherwise act as a wildcard and match everything.
  const term = search.replace(/[\\%_]/g, "\\$&");

  const conditions: Prisma.PokemonWhereInput[] = [
    { name: { contains: term, mode: "insensitive" } },
    { slug: { contains: term.toLowerCase().replace(/\s+/g, "-") } },
  ];

  const dexMatch = search.match(new RegExp(`^#?(\\d{1,${MAX_DEX_DIGITS}})$`));
  if (dexMatch) conditions.push({ id: Number(dexMatch[1]) });

  return { OR: conditions };
}

/**
 * The viewer's "My status" condition. Rated and Not rated share the inner
 * condition and differ in the quantifier (`some` vs `none`), so "Not rated"
 * also matches Pokémon the viewer has no row for at all.
 */
function pokedexStatusWhere(
  status: PokedexStatus,
  viewerId: string,
): Prisma.PokemonWhereInput {
  switch (status.key) {
    case "rated":
      return { userPokemons: { some: { userId: viewerId, rating: { not: null } } } };
    case "not-rated":
      return { userPokemons: { none: { userId: viewerId, rating: { not: null } } } };
    case "favorites":
      return { userPokemons: { some: { userId: viewerId, isFavorite: true } } };
    case "wishlist":
      return { userPokemons: { some: { userId: viewerId, isWishlist: true } } };
  }
}

/**
 * Search AND type (any of the selected) AND generation AND rarity AND the
 * viewer's status. Without a viewer the status condition is skipped, so a
 * logged-out `status` param can't narrow anything.
 */
function pokedexWhere(
  { search, types, gen, rarity, status }: PokedexFilters,
  viewerId: string | null,
): Prisma.PokemonWhereInput {
  return {
    AND: [
      pokedexSearchWhere(search),
      types.length > 0 ? { types: { hasSome: types } } : {},
      gen !== null ? { generation: gen } : {},
      rarity !== null ? { rarity: rarity.tier } : {},
      status !== null && viewerId !== null ? pokedexStatusWhere(status, viewerId) : {},
    ],
  };
}

/** Only the fields a Pokédex card renders. */
const POKEDEX_CARD_SELECT = {
  id: true,
  slug: true,
  name: true,
  types: true,
  artworkUrl: true,
} as const satisfies Prisma.PokemonSelect;

export type PokedexEntry = Prisma.PokemonGetPayload<{ select: typeof POKEDEX_CARD_SELECT }>;

type RatingSortKey = "highest-rated" | "most-rated";

/** Rated-Pokémon comparators per rating sort; the dex-number tiebreak is applied by the caller. */
const RATING_COMPARATORS: Record<RatingSortKey, (a: RatingSummary, b: RatingSummary) => number> = {
  "highest-rated": (a, b) =>
    b.averageHalfUnits - a.averageHalfUnits || b.totalRatings - a.totalRatings,
  "most-rated": (a, b) =>
    b.totalRatings - a.totalRatings || b.averageHalfUnits - a.averageHalfUnits,
};

/**
 * A rating-sorted page. Prisma can't order Pokémon by an aggregate over their
 * ratings, so this reads every rated Pokémon's stats plus the ids matching the
 * filters (both bounded by the ~1,025-row catalogue), orders them here, and
 * fetches the rows for the first `count`. Unrated Pokémon follow in dex order.
 */
async function getRatingSortedPage(
  count: number,
  where: Prisma.PokemonWhereInput,
  sortKey: RatingSortKey,
): Promise<PokedexEntry[]> {
  const [stats, matching] = await Promise.all([
    getRatingSummaries(),
    prisma.pokemon.findMany({ where, orderBy: { id: "asc" }, select: { id: true } }),
  ]);

  const compare = RATING_COMPARATORS[sortKey];
  const ids = matching.map((pokemon) => pokemon.id);
  // `!` is safe: the filter just above keeps only ids present in `stats`.
  const rated = ids
    .filter((id) => stats.has(id))
    .sort((a, b) => compare(stats.get(a)!, stats.get(b)!) || a - b);
  const unrated = ids.filter((id) => !stats.has(id));
  const pageIds = [...rated, ...unrated].slice(0, count);

  const rows = await prisma.pokemon.findMany({
    where: { id: { in: pageIds } },
    select: POKEDEX_CARD_SELECT,
  });
  const byId = new Map(rows.map((row) => [row.id, row]));
  return pageIds.map((id) => byId.get(id)).filter((row) => row !== undefined);
}

// The two Pokédex reads below take a `filters` object, so they aren't wrapped
// in React `cache()` (it compares by identity) — the page calls each once.

/** The first `count` Pokémon matching `filters`, in the order `filters.sort` asks for. Dex number breaks every tie. */
export function getPokedexPage(
  count: number,
  filters: PokedexFilters,
  viewerId: string | null,
): Promise<PokedexEntry[]> {
  const where = pokedexWhere(filters, viewerId);
  const sortKey = filters.sort.key;

  if (sortKey === "highest-rated" || sortKey === "most-rated") {
    return getRatingSortedPage(count, where, sortKey);
  }

  return prisma.pokemon.findMany({
    where,
    orderBy: sortKey === "name" ? [{ name: "asc" }, { id: "asc" }] : { id: "asc" },
    take: count,
    select: POKEDEX_CARD_SELECT,
  });
}

/** How many Pokémon match `filters` — drives "Load more", the count line and the no-results state. */
export function getPokedexMatchCount(filters: PokedexFilters, viewerId: string | null) {
  return prisma.pokemon.count({ where: pokedexWhere(filters, viewerId) });
}

// Not wrapped in React `cache()` — each call should roll a fresh random pick,
// not be memoized/deduped within a request like the helpers above.
export async function getRandomPokemon() {
  const count = await prisma.pokemon.count();
  if (count === 0) return null;
  const [pokemon] = await prisma.pokemon.findMany({
    take: 1,
    skip: Math.floor(Math.random() * count),
    select: { slug: true },
  });
  return pokemon ?? null;
}
