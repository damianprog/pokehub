// No server imports — shared by the `/pokedex` page and its client
// components, so every control parses and builds Pokédex URLs identically.

import { normalizePokedexSearch } from "@/lib/pokedex-search";

/** Every type key, in the filter panel's chip order. Also the canonical order of `type` in the URL. */
export const POKEDEX_TYPES = [
  "normal",
  "fire",
  "water",
  "electric",
  "grass",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
] as const;

export const POKEDEX_GENERATIONS = [
  { gen: 1, region: "Kanto" },
  { gen: 2, region: "Johto" },
  { gen: 3, region: "Hoenn" },
  { gen: 4, region: "Sinnoh" },
  { gen: 5, region: "Unova" },
  { gen: 6, region: "Kalos" },
  { gen: 7, region: "Alola" },
  { gen: 8, region: "Galar" },
  { gen: 9, region: "Paldea" },
] as const;

/** Rarity tiers in menu order: URL key, the `Pokemon.rarity` enum value it maps to, and the menu labels. */
export const POKEDEX_RARITIES = [
  { key: "common", tier: "COMMON", label: "Common", sub: null },
  { key: "uncommon", tier: "UNCOMMON", label: "Uncommon", sub: "Final-stage starters, pseudo-legendaries, fan favorites" },
  { key: "rare", tier: "RARE", label: "Rare", sub: "Legendary" },
  { key: "ultra-rare", tier: "ULTRA_RARE", label: "Ultra rare", sub: "Mythical" },
] as const;

export type PokedexRarity = (typeof POKEDEX_RARITIES)[number];

export interface PokedexFilters {
  /** Normalized search term; `""` means no search. */
  search: string;
  /** Selected type keys, deduped and in `POKEDEX_TYPES` order. */
  types: string[];
  /** Selected generation, or `null` for all. */
  gen: number | null;
  /** Selected rarity tier, or `null` for all. */
  rarity: PokedexRarity | null;
}

export const NO_POKEDEX_FILTERS: PokedexFilters = { search: "", types: [], gen: null, rarity: null };

/** Comma-separated type keys → valid keys in canonical order; unknown keys and duplicates are dropped. */
function parseTypes(value: string | undefined): string[] {
  const requested = new Set((value ?? "").toLowerCase().split(","));
  return POKEDEX_TYPES.filter((type) => requested.has(type));
}

function parseGen(value: string | undefined): number | null {
  const gen = Number(value);
  return POKEDEX_GENERATIONS.some((option) => option.gen === gen) ? gen : null;
}

function parseRarity(value: string | undefined): PokedexRarity | null {
  return POKEDEX_RARITIES.find((rarity) => rarity.key === value) ?? null;
}

export function parsePokedexFilters(params: {
  q?: string;
  type?: string;
  gen?: string;
  rarity?: string;
}): PokedexFilters {
  return {
    search: normalizePokedexSearch(params.q),
    types: parseTypes(params.type),
    gen: parseGen(params.gen),
    rarity: parseRarity(params.rarity),
  };
}

/** Whether a type, generation or rarity filter is active (the search term doesn't count). */
export function hasPokedexFilters({ types, gen, rarity }: PokedexFilters): boolean {
  return types.length > 0 || gen !== null || rarity !== null;
}

/** `/pokedex` URL for `params`, or the bare path when there are none. */
export function pokedexUrl(params: URLSearchParams): string {
  // URLSearchParams encodes the comma; keep `type=fire,dragon` readable.
  const qs = params.toString().replace(/%2C/g, ",");
  return qs ? `/pokedex?${qs}` : "/pokedex";
}

/** `/pokedex` URL for `filters` — omits empty params, and `count` unless given. */
export function pokedexHref(filters: PokedexFilters, count?: number): string {
  const params = new URLSearchParams();
  if (filters.search) params.set("q", filters.search);
  if (filters.types.length > 0) params.set("type", filters.types.join(","));
  if (filters.gen !== null) params.set("gen", String(filters.gen));
  if (filters.rarity !== null) params.set("rarity", filters.rarity.key);
  if (count !== undefined) params.set("count", String(count));
  return pokedexUrl(params);
}

/** `filters` with `type` toggled on or off, kept in canonical order. */
export function toggleType(filters: PokedexFilters, type: string): PokedexFilters {
  const selected = filters.types.includes(type)
    ? filters.types.filter((t) => t !== type)
    : [...filters.types, type];
  return { ...filters, types: POKEDEX_TYPES.filter((t) => selected.includes(t)) };
}
