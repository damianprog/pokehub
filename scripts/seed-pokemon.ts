/**
 * scripts/seed-pokemon.ts
 *
 * Idempotent PokeAPI -> Neon seeder for the `Pokemon` reference table.
 *
 * Run (recommended, loads .env for you):
 *   npx prisma db seed
 * Or directly:
 *   npx tsx --env-file=.env scripts/seed-pokemon.ts
 *
 * Safe to re-run: existing rows are skipped (createMany skipDuplicates).
 */

import { PrismaClient, Prisma } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// -------------------------------------------------------------------------
// Prisma 7 client for SCRIPT/CLI context.
//
// App runtime uses PrismaNeon (serverless driver, pooled DATABASE_URL).
// A one-off seed is NOT runtime — it's the same category as a migration,
// so we use the node-pg adapter against DIRECT_URL (unpooled, bypasses
// PgBouncer). No WebSocket-in-Node fuss, clean for a bulk insert.
//
// Requires:  npm i -D @prisma/adapter-pg pg
// -------------------------------------------------------------------------
const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(
    "DIRECT_URL/DATABASE_URL not set. Run via `npx prisma db seed` or " +
      "`npx tsx --env-file=.env scripts/seed-pokemon.ts`.",
  );
}
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

// -------------------------------------------------------------------------
// Config
// -------------------------------------------------------------------------
const POKEAPI = "https://pokeapi.co/api/v2";
const CONCURRENCY = 12; // polite parallelism against PokeAPI
const RETRIES = 3;
const CHUNK_SIZE = 300; // rows per createMany call

const SPRITES =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";
const artworkUrl = (id: number) =>
  `${SPRITES}/other/official-artwork/${id}.png`;
const shinyArtworkUrl = (id: number) =>
  `${SPRITES}/other/official-artwork/shiny/${id}.png`;
const spriteUrl = (id: number) => `${SPRITES}/${id}.png`;

/**
 * Rarity mapping (project-overview.md §4.1):
 *   ULTRA_RARE = is_mythical
 *   RARE       = is_legendary
 *   UNCOMMON   = curated list below
 *   COMMON     = everything else
 *
 * Curated by slug (slugs are stable). Intentionally a small starter set:
 * starter finals, pseudo-legendaries, and a few fan favourites. Edit freely
 * — but see the skipDuplicates caveat at the bottom: re-running will NOT
 * update rarity on rows that already exist.
 */
const UNCOMMON_SLUGS = new Set<string>([
  // starter final evolutions (gen 1-9)
  "venusaur",
  "charizard",
  "blastoise",
  "meganium",
  "typhlosion",
  "feraligatr",
  "sceptile",
  "blaziken",
  "swampert",
  "torterra",
  "infernape",
  "empoleon",
  "serperior",
  "emboar",
  "samurott",
  "chesnaught",
  "delphox",
  "greninja",
  "decidueye",
  "incineroar",
  "primarina",
  "rillaboom",
  "cinderace",
  "inteleon",
  "meowscarada",
  "skeledirge",
  "quaquaval",
  // pseudo-legendaries
  "dragonite",
  "tyranitar",
  "salamence",
  "metagross",
  "garchomp",
  "hydreigon",
  "goodra",
  "kommo-o",
  "dragapult",
  "baxcalibur",
  // fan favourites
  "pikachu",
  "eevee",
  "gengar",
  "lucario",
  "snorlax",
  "gyarados",
  "lapras",
  "arcanine",
  "mimikyu",
  "sylveon",
  "umbreon",
  "espeon",
]);

type RarityValue = "COMMON" | "UNCOMMON" | "RARE" | "ULTRA_RARE";

function computeRarity(
  slug: string,
  isLegendary: boolean,
  isMythical: boolean,
): RarityValue {
  if (isMythical) return "ULTRA_RARE";
  if (isLegendary) return "RARE";
  if (UNCOMMON_SLUGS.has(slug)) return "UNCOMMON";
  return "COMMON";
}

// -------------------------------------------------------------------------
// Pure helpers (unit-test friendly)
// -------------------------------------------------------------------------
const ROMAN: Record<string, number> = {
  i: 1,
  v: 5,
  x: 10,
  l: 50,
  c: 100,
  d: 500,
  m: 1000,
};
function romanToInt(roman: string): number {
  let total = 0;
  for (let i = 0; i < roman.length; i++) {
    const cur = ROMAN[roman[i]] ?? 0;
    const next = ROMAN[roman[i + 1]] ?? 0;
    total += next > cur ? -cur : cur;
  }
  return total;
}
/** "generation-viii" -> 8 */
function generationFromName(name: string): number {
  return romanToInt(name.replace("generation-", ""));
}

interface RawStat {
  base_stat: number;
  stat: { name: string };
}
function mapBaseStats(stats: RawStat[]) {
  const m: Record<string, number> = {};
  for (const s of stats) m[s.stat.name] = s.base_stat;
  return {
    hp: m["hp"],
    attack: m["attack"],
    defense: m["defense"],
    spAttack: m["special-attack"],
    spDefense: m["special-defense"],
    speed: m["speed"],
  };
}

interface FlavorEntry {
  flavor_text: string;
  language: { name: string };
}
function cleanFlavorText(entries: FlavorEntry[]): string | null {
  const en = entries.find((e) => e.language.name === "en");
  if (!en) return null;
  return en.flavor_text
    .replace(/[\f\n\r\u00ad]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function displayName(species: any): string {
  const en = species.names?.find((n: any) => n.language.name === "en");
  if (en?.name) return en.name;
  // fallback: capitalize the slug
  return species.name.charAt(0).toUpperCase() + species.name.slice(1);
}

// -------------------------------------------------------------------------
// Fetch with retry
// -------------------------------------------------------------------------
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchJson<T = any>(url: string): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= RETRIES; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`${res.status} ${res.statusText} @ ${url}`);
      return (await res.json()) as T;
    } catch (err) {
      lastErr = err;
      if (attempt < RETRIES) await sleep(300 * attempt); // backoff
    }
  }
  throw lastErr;
}

// -------------------------------------------------------------------------
// Bounded-concurrency map (simple worker pool)
// -------------------------------------------------------------------------
async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, idx: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const idx = cursor++;
      results[idx] = await fn(items[idx], idx);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, worker),
  );
  return results;
}

// -------------------------------------------------------------------------
// Main
// -------------------------------------------------------------------------
async function main() {
  console.time("seed");

  // 1. List of all species (one request, ~1025 entries)
  const list = await fetchJson<{ results: { name: string; url: string }[] }>(
    `${POKEAPI}/pokemon-species?limit=10000`,
  );
  const refs = list.results;
  console.log(`Found ${refs.length} species. Fetching details (x2 each)...`);

  const failures: string[] = [];

  // 2. For each species: fetch species + its default-variety pokemon, map row
  const maybeRows = await mapWithConcurrency(
    refs,
    CONCURRENCY,
    async (ref): Promise<Prisma.PokemonCreateManyInput | null> => {
      try {
        const species = await fetchJson<any>(ref.url);
        const variety =
          species.varieties.find((v: any) => v.is_default) ??
          species.varieties[0];
        const pokemon = await fetchJson<any>(variety.pokemon.url);

        const id: number = species.id; // pokedex number = our PK

        return {
          id,
          slug: species.name,
          name: displayName(species),
          types: pokemon.types.map((t: any) => t.type.name),
          generation: generationFromName(species.generation.name),
          isLegendary: species.is_legendary,
          isMythical: species.is_mythical,
          rarity: computeRarity(
            species.name,
            species.is_legendary,
            species.is_mythical,
          ),
          artworkUrl: artworkUrl(id),
          spriteUrl: spriteUrl(id),
          shinyArtworkUrl: shinyArtworkUrl(id),
          height: pokemon.height, // decimeters
          weight: pokemon.weight, // hectograms
          baseStats: mapBaseStats(pokemon.stats),
          flavorText: cleanFlavorText(species.flavor_text_entries),
        };
      } catch (err) {
        failures.push(`${ref.name} (${(err as Error).message})`);
        return null;
      }
    },
  );

  const rows = maybeRows.filter(
    (r): r is Prisma.PokemonCreateManyInput => r !== null,
  );
  console.log(
    `Mapped ${rows.length} rows. Writing in chunks of ${CHUNK_SIZE}...`,
  );

  // 3. Chunked, idempotent insert
  let inserted = 0;
  for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
    const chunk = rows.slice(i, i + CHUNK_SIZE);
    const res = await prisma.pokemon.createMany({
      data: chunk,
      skipDuplicates: true,
    });
    inserted += res.count;
  }

  console.log(`Inserted ${inserted} new Pokémon (existing rows skipped).`);
  if (failures.length) {
    console.warn(`${failures.length} failures:`, failures.slice(0, 20));
  }
  console.timeEnd("seed");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
