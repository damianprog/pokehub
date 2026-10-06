import type { Metadata } from "next";
import { auth } from "@/auth";
import {
  getPokedexMatchCount,
  getPokedexPage,
  getPokemonCount,
  POKEDEX_PAGE_SIZE,
} from "@/lib/pokemon";
import { hasPokedexFilters, parsePokedexFilters } from "@/lib/pokedex-filters";
import {
  getRatingSummaries,
  getUserWishlistCount,
  getViewerPokemonFlags,
  NO_VIEWER_FLAGS,
} from "@/lib/user-pokemon";
import { PokedexHeader } from "@/components/pokedex/PokedexHeader";
import { PokedexSearch } from "@/components/pokedex/PokedexSearch";
import { PokedexFilterPanel } from "@/components/pokedex/PokedexFilterPanel";
import { PokedexMobileSortRow } from "@/components/pokedex/PokedexMobileSortRow";
import { PokedexActiveFilters } from "@/components/pokedex/PokedexActiveFilters";
import { PokedexGrid } from "@/components/pokedex/PokedexGrid";
import { PokedexCard } from "@/components/pokedex/PokedexCard";
import { PokedexLoadMore } from "@/components/pokedex/PokedexLoadMore";
import { PokedexEmptyState } from "@/components/pokedex/PokedexEmptyState";
import { PokedexWishlistProvider } from "@/components/pokedex/PokedexWishlistProvider";

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
  searchParams: Promise<{
    count?: string;
    q?: string;
    type?: string;
    gen?: string;
    rarity?: string;
    status?: string;
    sort?: string;
  }>;
}) {
  const [params, session] = await Promise.all([searchParams, auth()]);
  const viewerId = session?.user?.id ?? null;
  const count = parseCount(params.count);
  // "My status" only exists for signed-in viewers — logged out, the param is
  // dropped here, so it gets no chip and no link carries it forward.
  const parsed = parsePokedexFilters(params);
  const filters = viewerId ? parsed : { ...parsed, status: null };
  const isNarrowed = filters.search !== "" || hasPokedexFilters(filters);

  // The header always shows the unfiltered total; `matches` is what "Load
  // more", the count line and the no-results state go by (the same number
  // when nothing narrows the list, so it's only counted separately then).
  const [total, matchCount, pokemons, wishlistCount] = await Promise.all([
    getPokemonCount(),
    isNarrowed ? getPokedexMatchCount(filters, viewerId) : null,
    getPokedexPage(count, filters, viewerId),
    viewerId ? getUserWishlistCount(viewerId) : 0,
  ]);
  const matches = matchCount ?? total;
  const ids = pokemons.map((pokemon) => pokemon.id);
  const [ratings, viewerFlags] = await Promise.all([
    getRatingSummaries(ids),
    viewerId ? getViewerPokemonFlags(viewerId, ids) : null,
  ]);

  return (
    <div className="group/pokedex">
      <PokedexHeader total={total} search={<PokedexSearch query={filters.search} />} />
      <PokedexFilterPanel filters={filters} signedIn={viewerId !== null} />
      <PokedexMobileSortRow
        filters={filters}
        sheet={{ signedIn: viewerId !== null, total, matches }}
      />
      <PokedexActiveFilters filters={filters} total={total} matches={matches} />

      {/* Dims while a search or filter change is loading — pending controls set `data-pending`. */}
      <div className="transition-opacity duration-150 group-has-[[data-pending]]/pokedex:opacity-60">
        {matches === 0 ? (
          <PokedexEmptyState search={filters.search} filtered={hasPokedexFilters(filters)} />
        ) : (
          <PokedexWishlistProvider initialCount={wishlistCount}>
            <PokedexGrid>
              {pokemons.map((pokemon) => (
                <PokedexCard
                  key={pokemon.id}
                  pokemon={pokemon}
                  rating={ratings.get(pokemon.id)}
                  viewer={viewerFlags ? (viewerFlags.get(pokemon.id) ?? NO_VIEWER_FLAGS) : null}
                />
              ))}
            </PokedexGrid>
          </PokedexWishlistProvider>
        )}

        {matches > count && <PokedexLoadMore count={count} filters={filters} />}
      </div>
    </div>
  );
}
