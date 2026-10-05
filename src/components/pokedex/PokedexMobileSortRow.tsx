import { NO_POKEDEX_FILTERS, type PokedexFilters } from "@/lib/pokedex-filters";
import { PokedexSortMenu } from "@/components/pokedex/PokedexSortMenu";

interface PokedexMobileSortRowProps {
  /** Active filters, or `null` for the loading skeleton (a disabled sort button). */
  filters: PokedexFilters | null;
}

/** Mobile-only row above the chips: the sort button on the right. Slice 07 adds "Filters" on its left. */
export function PokedexMobileSortRow({ filters }: PokedexMobileSortRowProps) {
  return (
    <div className="mb-[10px] flex items-center justify-end md:hidden">
      <PokedexSortMenu filters={filters ?? NO_POKEDEX_FILTERS} compact disabled={filters === null} />
    </div>
  );
}
