import type { Metadata } from "next";
import {
  getPokedexMatchCount,
  getPokedexPage,
  getPokemonCount,
  POKEDEX_PAGE_SIZE,
} from "@/lib/pokemon";
import { hasPokedexFilters, parsePokedexFilters } from "@/lib/pokedex-filters";
import { getRatingSummaries } from "@/lib/user-pokemon";
import { PokedexHeader } from "@/components/pokedex/PokedexHeader";
import { PokedexSearch } from "@/components/pokedex/PokedexSearch";
import { PokedexFilterPanel } from "@/components/pokedex/PokedexFilterPanel";
import { PokedexActiveFilters } from "@/components/pokedex/PokedexActiveFilters";
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
  searchParams: Promise<{ count?: string; q?: string; type?: string; gen?: string; rarity?: string }>;
}) {
  const params = await searchParams;
  const count = parseCount(params.count);
  const filters = parsePokedexFilters(params);
  const isNarrowed = filters.search !== "" || hasPokedexFilters(filters);

  // The header always shows the unfiltered total; `matches` is what "Load
  // more", the count line and the no-results state go by (the same number
  // when nothing narrows the list, so it's only counted separately then).
  const [total, matchCount, pokemons] = await Promise.all([
    getPokemonCount(),
    isNarrowed ? getPokedexMatchCount(filters) : null,
    getPokedexPage(count, filters),
  ]);
  const matches = matchCount ?? total;
  const ratings = await getRatingSummaries(pokemons.map((pokemon) => pokemon.id));

  return (
    <div className="group/pokedex">
      <PokedexHeader total={total} search={<PokedexSearch query={filters.search} />} />
      <PokedexFilterPanel filters={filters} />
      <PokedexActiveFilters filters={filters} total={total} matches={matches} />

      {/* Dims while a search or filter change is loading — pending controls set `data-pending`. */}
      <div className="transition-opacity duration-150 group-has-[[data-pending]]/pokedex:opacity-60">
        {matches === 0 ? (
          <PokedexEmptyState search={filters.search} filtered={hasPokedexFilters(filters)} />
        ) : (
          <PokedexGrid>
            {pokemons.map((pokemon) => (
              <PokedexCard key={pokemon.id} pokemon={pokemon} rating={ratings.get(pokemon.id)} />
            ))}
          </PokedexGrid>
        )}

        {matches > count && <PokedexLoadMore count={count} filters={filters} />}
      </div>
    </div>
  );
}
