import { cache } from "react";
import { prisma } from "@/lib/prisma";

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

export const getPokemonCount = cache(() => prisma.pokemon.count());

/** The first `count` Pokémon in dex order, with only the fields a Pokédex card renders. */
export const getPokedexPage = cache((count: number) =>
  prisma.pokemon.findMany({
    orderBy: { id: "asc" },
    take: count,
    select: { id: true, slug: true, name: true, types: true, artworkUrl: true },
  }),
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
