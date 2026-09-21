/**
 * Static sort row for `/p/[slug]/reviews` — "Newest" shown active, "Highest
 * rated" and "Lowest rated" inert. Real sorting is a later slice (see
 * rating-review/rating-07-all-reviews-page-shell-spec.md §7); this ships the
 * visual shell first, matching how `RateRow` and `PokemonActions` shipped
 * static before becoming interactive.
 */
export function ReviewSortChips() {
  const inactiveClass =
    "inline-flex h-[30px] items-center rounded-[8px] px-[12px] text-[12.5px] font-semibold text-[#8b919e] md:h-[32px] md:px-[14px] md:text-[13px]";

  return (
    <div className="mb-[16px] flex items-center gap-[6px]">
      <span className="mr-[6px] hidden text-[12.5px] text-[#7b818c] md:inline">Sort</span>
      <span className="inline-flex h-[30px] items-center rounded-[8px] bg-white/[0.09] px-[12px] text-[12.5px] font-bold text-white md:h-[32px] md:px-[14px] md:text-[13px]">
        Newest
      </span>
      <span className={inactiveClass}>Highest rated</span>
      <span className={inactiveClass}>Lowest rated</span>
    </div>
  );
}
