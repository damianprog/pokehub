import Link from "next/link";
import { pokedexHref, toggleType, type PokedexFilters } from "@/lib/pokedex-filters";
import { TYPE_BADGE_COLORS } from "@/lib/type-badge-colors";
import { PokedexFilterChip } from "@/components/pokedex/PokedexFilterChip";
import { PokedexLinkPending } from "@/components/pokedex/PokedexLinkPending";

interface PokedexActiveFiltersProps {
  /** Active filters, or `null` for the loading skeleton (no chips, count as a skeleton bar). */
  filters: PokedexFilters | null;
  total: number | null;
  matches: number | null;
}

const CHIP_TEXT = "#e8eaed";

function buildChips(filters: PokedexFilters) {
  const chips = filters.types.map((type) => ({
    label: TYPE_BADGE_COLORS[type]?.label ?? type,
    color: TYPE_BADGE_COLORS[type]?.color ?? CHIP_TEXT,
    removeHref: pokedexHref(toggleType(filters, type)),
  }));
  if (filters.gen !== null) {
    chips.push({
      label: `Gen ${filters.gen}`,
      color: CHIP_TEXT,
      removeHref: pokedexHref({ ...filters, gen: null }),
    });
  }
  if (filters.rarity !== null) {
    chips.push({
      label: filters.rarity.label,
      color: CHIP_TEXT,
      removeHref: pokedexHref({ ...filters, rarity: null }),
    });
  }
  if (filters.search) {
    chips.push({
      label: `“${filters.search}”`,
      color: CHIP_TEXT,
      removeHref: pokedexHref({ ...filters, search: "" }),
    });
  }
  return chips;
}

/**
 * Removable chips for every active filter (types, generation, search), "Clear
 * all" and the "Showing N of 1,025" count. Desktop: one row, count on the
 * right. Mobile: chips scroll sideways edge to edge, count on its own line.
 */
export function PokedexActiveFilters({ filters, total, matches }: PokedexActiveFiltersProps) {
  const chips = filters ? buildChips(filters) : [];
  const isFiltered = chips.length > 0;

  return (
    <div className="mb-[12px] md:mb-[18px] md:flex md:min-h-[32px] md:flex-wrap md:items-center md:gap-[8px]">
      {isFiltered && (
        <div className="-mx-4 mb-[10px] flex items-center gap-[7px] overflow-x-auto px-4 sm:-mx-[26px] sm:px-[26px] md:contents">
          {chips.map((chip) => (
            <PokedexFilterChip key={chip.label} {...chip} />
          ))}
          <Link
            href="/pokedex"
            scroll={false}
            className="flex-none px-[4px] text-[12.5px] font-semibold text-[var(--brand-to)] hover:text-[#d88ef0] md:ml-[4px] md:px-0 md:text-[13px]"
          >
            Clear all
            <PokedexLinkPending />
          </Link>
        </div>
      )}

      <div className="hidden flex-1 md:block" />

      <div className="text-[12.5px] text-[#8b919e] md:text-[13px]">
        {total === null || matches === null ? (
          <span className="animate-skeleton inline-block h-[12px] w-[120px] rounded-[5px] bg-[linear-gradient(90deg,#1b1e25_0%,#252932_50%,#1b1e25_100%)] bg-[length:200%_100%] align-middle" />
        ) : (
          <>
            Showing{" "}
            <span className="font-bold text-[#e8eaed]">
              {isFiltered ? matches.toLocaleString("en-US") : "all"}
            </span>{" "}
            {isFiltered ? `of ${total.toLocaleString("en-US")}` : total.toLocaleString("en-US")}
          </>
        )}
      </div>
    </div>
  );
}
