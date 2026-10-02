import Link from "next/link";
import { POKEDEX_PAGE_SIZE } from "@/lib/pokemon";
import { pokedexHref, type PokedexFilters } from "@/lib/pokedex-filters";

interface PokedexLoadMoreProps {
  count: number;
  /** The active search and filters, carried forward so "Load more" grows the results, not the full list. */
  filters: PokedexFilters;
}

/**
 * Grows `/pokedex`'s grid by one page per click via the `count` search param
 * — the same growing-window, URL-is-the-state pattern as `LoadMoreReviews`
 * (rating-09 §2, §7), kept as a sibling rather than a shared component since
 * the two differ in sizing and mobile layout, not just href.
 */
export function PokedexLoadMore({ count, filters }: PokedexLoadMoreProps) {
  return (
    <div className="mt-[16px] flex justify-center md:mt-[26px]">
      <Link
        href={pokedexHref(filters, count + POKEDEX_PAGE_SIZE)}
        scroll={false}
        className="flex h-[44px] w-full items-center justify-center rounded-[12px] border border-white/[0.1] bg-white/[0.04] px-[26px] text-[14px] font-semibold text-[#cdd2da] hover:bg-white/[0.08] md:inline-flex md:w-auto"
      >
        Load more
      </Link>
    </div>
  );
}
