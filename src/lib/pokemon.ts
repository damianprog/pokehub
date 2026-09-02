import { cache } from "react";
import { prisma } from "@/lib/prisma";

export const getPokemon = cache((slug: string) =>
  prisma.pokemon.findUnique({ where: { slug } }),
);

export const getPokemonsByIds = cache(async (ids: number[]) => {
  const pokemons = await prisma.pokemon.findMany({ where: { id: { in: ids } } });
  const byId = new Map(pokemons.map((pokemon) => [pokemon.id, pokemon]));
  return ids.map((id) => byId.get(id)).filter((pokemon) => pokemon !== undefined);
});

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
