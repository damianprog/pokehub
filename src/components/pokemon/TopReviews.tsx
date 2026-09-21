import Link from "next/link";
import type { TopReviewItem } from "@/lib/user-pokemon";
import { ReviewCard } from "@/components/pokemon/ReviewCard";
import { TopReviewsEmptyState } from "@/components/pokemon/TopReviewsEmptyState";

interface TopReviewsProps {
  slug: string;
  pokemonName: string;
  totalReviewCount: number;
  reviews: TopReviewItem[];
  isAuthenticated: boolean;
}

export function TopReviews({
  slug,
  pokemonName,
  totalReviewCount,
  reviews,
  isAuthenticated,
}: TopReviewsProps) {
  return (
    <div className="leading-[normal]">
      <div className="mb-[14px] flex items-center justify-between">
        <h2 className="font-heading text-[17px] font-bold md:text-[19px]">Top reviews</h2>
        <Link
          href={`/p/${slug}/reviews`}
          className="text-[12.5px] text-[#7b818c] hover:text-[#9aa0ab] md:text-[13px]"
        >
          View all {totalReviewCount.toLocaleString()} →
        </Link>
      </div>
      {reviews.length === 0 ? (
        <TopReviewsEmptyState pokemonName={pokemonName} isAuthenticated={isAuthenticated} />
      ) : (
        reviews.map((review) => (
          <ReviewCard
            key={review.id}
            username={review.username}
            profileHref={review.profileHref}
            avatarImage={review.avatarImage}
            rating={review.rating}
            reviewText={review.reviewText}
            reviewedAt={review.reviewedAt}
            showYouLabel={review.isOwn}
            className="mb-[12px] md:mb-[13px]"
          />
        ))
      )}
    </div>
  );
}
