// No server imports — shared by the `/pokedex` page and the client-side
// search input, so both normalize `q` identically.

export const POKEDEX_SEARCH_MAX_LENGTH = 50;

/** Trimmed and length-capped search term; `""` means no search. */
export function normalizePokedexSearch(value: string | undefined): string {
  return (value ?? "").trim().slice(0, POKEDEX_SEARCH_MAX_LENGTH);
}
