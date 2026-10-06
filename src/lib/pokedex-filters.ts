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

/** "My status" options in menu order: URL key and label. Signed-in only — the page drops it for logged-out visitors. */
export const POKEDEX_STATUSES = [
  { key: "rated", label: "Rated" },
  { key: "not-rated", label: "Not rated" },
  { key: "favorites", label: "Favorites" },
  { key: "wishlist", label: "Wishlist" },
] as const;

export type PokedexStatus = (typeof POKEDEX_STATUSES)[number];

/** Sort options in menu order. The first (dex number) is the default and never appears in the URL. */
export const POKEDEX_SORTS = [
  { key: "dex", label: "Dex number" },
  { key: "name", label: "Name A–Z" },
  { key: "highest-rated", label: "Highest rated" },
  { key: "most-rated", label: "Most rated" },
] as const;

export type PokedexSort = (typeof POKEDEX_SORTS)[number];

export const DEFAULT_POKEDEX_SORT: PokedexSort = POKEDEX_SORTS[0];

export interface PokedexFilters {
  /** Normalized search term; `""` means no search. */
  search: string;
  /** Selected type keys, deduped and in `POKEDEX_TYPES` order. */
  types: string[];
  /** Selected generation, or `null` for all. */
  gen: number | null;
  /** Selected rarity tier, or `null` for all. */
  rarity: PokedexRarity | null;
  /** The viewer's relationship filter, or `null` for any status. */
  status: PokedexStatus | null;
  /** Result order. Not a filter — it never narrows the list. */
  sort: PokedexSort;
}

export const NO_POKEDEX_FILTERS: PokedexFilters = {
  search: "",
  types: [],
  gen: null,
  rarity: null,
  status: null,
  sort: DEFAULT_POKEDEX_SORT,
};

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

function parseStatus(value: string | undefined): PokedexStatus | null {
  return POKEDEX_STATUSES.find((status) => status.key === value) ?? null;
}

function parseSort(value: string | undefined): PokedexSort {
  return POKEDEX_SORTS.find((sort) => sort.key === value) ?? DEFAULT_POKEDEX_SORT;
}

export function parsePokedexFilters(params: {
  q?: string;
  type?: string;
  gen?: string;
  rarity?: string;
  status?: string;
  sort?: string;
}): PokedexFilters {
  return {
    search: normalizePokedexSearch(params.q),
    types: parseTypes(params.type),
    gen: parseGen(params.gen),
    rarity: parseRarity(params.rarity),
    status: parseStatus(params.status),
    sort: parseSort(params.sort),
  };
}

/** Whether a type, generation, rarity or status filter is active (the search term doesn't count). */
export function hasPokedexFilters({ types, gen, rarity, status }: PokedexFilters): boolean {
  return types.length > 0 || gen !== null || rarity !== null || status !== null;
}

/** How many filters are active — one per type, plus generation, rarity and status. The mobile Filters badge. */
export function countPokedexFilters({ types, gen, rarity, status }: PokedexFilters): number {
  return types.length + [gen, rarity, status].filter((value) => value !== null).length;
}

/** `filters` with every type, generation, rarity and status cleared — search and sort kept. */
export function resetPokedexFilters(filters: PokedexFilters): PokedexFilters {
  return { ...filters, types: [], gen: null, rarity: null, status: null };
}

// URLSearchParams encodes the comma; keep `type=fire,dragon` readable.
function encodePokedexParams(params: URLSearchParams): string {
  return params.toString().replace(/%2C/g, ",");
}

/** `/pokedex` URL for `params`, or the bare path when there are none. */
export function pokedexUrl(params: URLSearchParams): string {
  const qs = encodePokedexParams(params);
  return qs ? `/pokedex?${qs}` : "/pokedex";
}

/** `/pokedex` URL for `filters` — omits empty params, and `count` unless given. */
export function pokedexHref(filters: PokedexFilters, count?: number): string {
  const qs = pokedexQuery(filters, count);
  return qs ? `/pokedex?${qs}` : "/pokedex";
}

/**
 * Query string (no leading `?`) for `filters`, `""` when there's nothing to
 * set. Shared by `pokedexHref` and the count endpoint's URL, so both carry
 * identical params.
 */
export function pokedexQuery(filters: PokedexFilters, count?: number): string {
  const params = new URLSearchParams();
  if (filters.search) params.set("q", filters.search);
  if (filters.types.length > 0) params.set("type", filters.types.join(","));
  if (filters.gen !== null) params.set("gen", String(filters.gen));
  if (filters.rarity !== null) params.set("rarity", filters.rarity.key);
  if (filters.status !== null) params.set("status", filters.status.key);
  if (filters.sort.key !== DEFAULT_POKEDEX_SORT.key) params.set("sort", filters.sort.key);
  if (count !== undefined) params.set("count", String(count));
  return encodePokedexParams(params);
}

/** `filters` with `type` toggled on or off, kept in canonical order. */
export function toggleType(filters: PokedexFilters, type: string): PokedexFilters {
  const selected = filters.types.includes(type)
    ? filters.types.filter((t) => t !== type)
    : [...filters.types, type];
  return { ...filters, types: POKEDEX_TYPES.filter((t) => selected.includes(t)) };
}
