import Link from "next/link";
import { REVIEW_SORT_OPTIONS, type ReviewSortOption } from "@/lib/user-pokemon";

const SORT_LABELS: Record<ReviewSortOption, string> = {
  newest: "Newest",
  highest: "Highest rated",
  lowest: "Lowest rated",
};

interface ReviewSortChipsProps {
  slug: string;
  activeSort: ReviewSortOption;
}

/**
 * Sort row for `/p/[slug]/reviews`: the active chip is a plain span, the
 * other two are real links to `?sort=...` — a normal Next.js navigation
 * re-runs the page with the new value, so no client state is needed (see
 * rating-review/rating-08-sort-control-spec.md §2-§3). `scroll={false}`
 * keeps the page from jumping back to the top, since this row sits well
 * below the fold.
 */
export function ReviewSortChips({ slug, activeSort }: ReviewSortChipsProps) {
  const inactiveClass =
    "inline-flex h-[30px] items-center rounded-[8px] px-[12px] text-[12.5px] font-semibold text-[#8b919e] md:h-[32px] md:px-[14px] md:text-[13px]";

  return (
    <div className="mb-[16px] flex items-center gap-[6px]">
      <span className="mr-[6px] hidden text-[12.5px] text-[#7b818c] md:inline">Sort</span>
      {REVIEW_SORT_OPTIONS.map((option) =>
        option === activeSort ? (
          <span
            key={option}
            className="inline-flex h-[30px] items-center rounded-[8px] bg-white/[0.09] px-[12px] text-[12.5px] font-bold text-white md:h-[32px] md:px-[14px] md:text-[13px]"
          >
            {SORT_LABELS[option]}
          </span>
        ) : (
          <Link
            key={option}
            href={option === "newest" ? `/p/${slug}/reviews` : `/p/${slug}/reviews?sort=${option}`}
            scroll={false}
            className={inactiveClass}
          >
            {SORT_LABELS[option]}
          </Link>
        ),
      )}
    </div>
  );
}
