import { cache } from "react";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

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
function pokedexSearchWhere(search: string | undefined): Prisma.PokemonWhereInput {
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

/** The first `count` Pokémon matching `search` (or all, without one) in dex order, with only the fields a Pokédex card renders. */
export const getPokedexPage = cache((count: number, search?: string) =>
  prisma.pokemon.findMany({
    where: pokedexSearchWhere(search),
    orderBy: { id: "asc" },
    take: count,
    select: { id: true, slug: true, name: true, types: true, artworkUrl: true },
  }),
);

/** How many Pokémon match `search` — drives "Load more" and the no-results state. */
export const getPokedexMatchCount = cache((search?: string) =>
  prisma.pokemon.count({ where: pokedexSearchWhere(search) }),
);

export type PokedexEntry = Awaited<ReturnType<typeof getPokedexPage>>[number];

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
