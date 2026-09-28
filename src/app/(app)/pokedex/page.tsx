import type { Metadata } from "next";
import {
  getPokedexMatchCount,
  getPokedexPage,
  getPokemonCount,
  POKEDEX_PAGE_SIZE,
} from "@/lib/pokemon";
import { normalizePokedexSearch } from "@/lib/pokedex-search";
import { getRatingSummaries } from "@/lib/user-pokemon";
import { PokedexHeader } from "@/components/pokedex/PokedexHeader";
import { PokedexSearch } from "@/components/pokedex/PokedexSearch";
import { PokedexGrid } from "@/components/pokedex/PokedexGrid";
import { PokedexCard } from "@/components/pokedex/PokedexCard";
import { PokedexLoadMore } from "@/components/pokedex/PokedexLoadMore";
import { PokedexEmptyState } from "@/components/pokedex/PokedexEmptyState";

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
  searchParams: Promise<{ count?: string; q?: string }>;
}) {
  const params = await searchParams;
  const count = parseCount(params.count);
  const search = normalizePokedexSearch(params.q);

  // The header always shows the unfiltered total; `matchCount` is what
  // "Load more" and the no-results state go by (the same number without a search).
  const [total, matchCount, pokemons] = await Promise.all([
    getPokemonCount(),
    search ? getPokedexMatchCount(search) : null,
    getPokedexPage(count, search),
  ]);
  const matches = matchCount ?? total;
  const ratings = await getRatingSummaries(pokemons.map((pokemon) => pokemon.id));

  return (
    <div className="group/pokedex">
      <PokedexHeader total={total} search={<PokedexSearch query={search} />} />

      {/* Dims while a new search is loading — `PokedexSearch` sets `data-pending`. */}
      <div className="transition-opacity duration-150 group-has-[[data-pending]]/pokedex:opacity-60">
        {search && matches === 0 ? (
          <PokedexEmptyState search={search} />
        ) : (
          <PokedexGrid>
            {pokemons.map((pokemon) => (
              <PokedexCard key={pokemon.id} pokemon={pokemon} rating={ratings.get(pokemon.id)} />
            ))}
          </PokedexGrid>
        )}

        {matches > count && <PokedexLoadMore count={count} search={search} />}
      </div>
    </div>
  );
}
