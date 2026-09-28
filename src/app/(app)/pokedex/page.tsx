import type { Metadata } from "next";
import { getPokedexPage, getPokemonCount, POKEDEX_PAGE_SIZE } from "@/lib/pokemon";
import { getRatingSummaries } from "@/lib/user-pokemon";
import { PokedexHeader } from "@/components/pokedex/PokedexHeader";
import { PokedexGrid } from "@/components/pokedex/PokedexGrid";
import { PokedexCard } from "@/components/pokedex/PokedexCard";
import { PokedexLoadMore } from "@/components/pokedex/PokedexLoadMore";

export const metadata: Metadata = { title: "Pokédex — PokeHub" };

// Well above the ~1,025 rows, but small enough that Prisma's `take` never overflows.
const MAX_COUNT = 5000;

function parseCount(value: string | undefined): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? Math.min(parsed, MAX_COUNT) : POKEDEX_PAGE_SIZE;
}

export default async function PokedexPage({
  searchParams,
}: {
  searchParams: Promise<{ count?: string }>;
}) {
  const count = parseCount((await searchParams).count);

  const [total, pokemons] = await Promise.all([getPokemonCount(), getPokedexPage(count)]);
  const ratings = await getRatingSummaries(pokemons.map((pokemon) => pokemon.id));

  return (
    <div>
      <PokedexHeader total={total} />

      <PokedexGrid>
        {pokemons.map((pokemon) => (
          <PokedexCard key={pokemon.id} pokemon={pokemon} rating={ratings.get(pokemon.id)} />
        ))}
      </PokedexGrid>

      {total > count && <PokedexLoadMore count={count} />}
    </div>
  );
}
