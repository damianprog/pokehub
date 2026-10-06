import { NO_POKEDEX_FILTERS, type PokedexFilters } from "@/lib/pokedex-filters";
import { PokedexSortMenu } from "@/components/pokedex/PokedexSortMenu";
import { PokedexFiltersSheet } from "@/components/pokedex/PokedexFiltersSheet";
import {
  FILTERS_BUTTON_CLASS,
  PokedexFiltersButtonContent,
} from "@/components/pokedex/PokedexFiltersButtonContent";

interface PokedexMobileSortRowProps {
  /** Active filters, or `null` for the loading skeleton (disabled Filters and sort buttons). */
  filters: PokedexFilters | null;
  /** What the Filters sheet needs besides `filters`; `null` for the skeleton. */
  sheet: { signedIn: boolean; total: number; matches: number } | null;
}

/** Mobile-only row above the chips: the Filters sheet button on the left, the sort button on the right. */
export function PokedexMobileSortRow({ filters, sheet }: PokedexMobileSortRowProps) {
  return (
    <div className="mb-[10px] flex items-center justify-between gap-[8px] md:hidden">
      {filters && sheet ? (
        <PokedexFiltersSheet filters={filters} {...sheet} />
      ) : (
        <button type="button" disabled className={FILTERS_BUTTON_CLASS}>
          <PokedexFiltersButtonContent count={0} />
        </button>
      )}
      <PokedexSortMenu filters={filters ?? NO_POKEDEX_FILTERS} compact disabled={filters === null} />
    </div>
  );
}
