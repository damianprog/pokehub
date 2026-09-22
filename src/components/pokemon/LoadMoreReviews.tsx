import Link from "next/link";
import { REVIEWS_PAGE_SIZE, type ReviewSortOption } from "@/lib/user-pokemon";

interface LoadMoreReviewsProps {
  slug: string;
  sort: ReviewSortOption;
  count: number;
}

/**
 * Grows `/p/[slug]/reviews`'s non-pinned review list by one page size per
 * click, carrying the active `sort` forward (when non-default) alongside
 * the grown `count` — a real link, no client component, same "URL is the
 * whole state" pattern as `ReviewSortChips`
 * (rating-09-load-more-pagination-spec.md §7). `scroll={false}` keeps the
 * page from jumping back to the top, since this control sits at the bottom
 * of a potentially long list.
 */
export function LoadMoreReviews({ slug, sort, count }: LoadMoreReviewsProps) {
  const params = new URLSearchParams();
  if (sort !== "newest") params.set("sort", sort);
  params.set("count", String(count + REVIEWS_PAGE_SIZE));

  return (
    <div className="mt-[16px] flex justify-center">
      <Link
        href={`/p/${slug}/reviews?${params.toString()}`}
        scroll={false}
        className="inline-flex h-[40px] items-center rounded-[10px] border border-white/[0.1] bg-white/[0.04] px-[22px] text-[13px] font-semibold text-[#e8eaed] hover:bg-white/[0.07] md:h-[42px] md:px-[26px] md:text-[13.5px]"
      >
        Load more
      </Link>
    </div>
  );
}
