import type { ReviewSortOption, TopReviewItem } from "@/lib/user-pokemon";
import { ReviewCard } from "@/components/pokemon/ReviewCard";
import { YourReviewMenu } from "@/components/pokemon/YourReviewMenu";
import { TopReviewsEmptyState } from "@/components/pokemon/TopReviewsEmptyState";
import { LoadMoreReviews } from "@/components/pokemon/LoadMoreReviews";

interface PokemonReviewsListProps {
  pokemonId: number;
  slug: string;
  pokemonName: string;
  ownReview: TopReviewItem | null;
  reviews: TopReviewItem[];
  isAuthenticated: boolean;
  hasMore: boolean;
  sort: ReviewSortOption;
  count: number;
}

/**
 * The full review list on `/p/[slug]/reviews` — the viewer's own review (if
 * any) pinned first with its Edit/Delete menu, everyone else following in
 * the order `getAllReviews` already returned them, or the shared empty state
 * when there's nothing to show at all. See
 * rating-review/rating-07-all-reviews-page-shell-spec.md §6, §8.
 *
 * Unlike `YourReview` on the detail page (which has its own "Your review"
 * heading and so doesn't need the card to say so itself), the pinned card
 * here has no surrounding heading — it's just the first row in a flat list —
 * so it passes `showYouLabel` to get the "· you" meta text the design shows.
 */
export function PokemonReviewsList({
  pokemonId,
  slug,
  pokemonName,
  ownReview,
  reviews,
  isAuthenticated,
  hasMore,
  sort,
  count,
}: PokemonReviewsListProps) {
  if (!ownReview && reviews.length === 0) {
    return <TopReviewsEmptyState pokemonName={pokemonName} isAuthenticated={isAuthenticated} />;
  }

  return (
    <div className="flex flex-col gap-[12px] md:gap-[13px]">
      {ownReview && (
        <ReviewCard
          username={ownReview.username}
          profileHref={ownReview.profileHref}
          avatarImage={ownReview.avatarImage}
          rating={ownReview.rating}
          reviewText={ownReview.reviewText}
          reviewedAt={ownReview.reviewedAt}
          variant="pinned"
          showYouLabel
          menu={
            <YourReviewMenu
              pokemonId={pokemonId}
              slug={slug}
              pokemonName={pokemonName}
              rating={ownReview.rating}
            />
          }
        />
      )}
      {reviews.map((review) => (
        <ReviewCard
          key={review.id}
          username={review.username}
          profileHref={review.profileHref}
          avatarImage={review.avatarImage}
          rating={review.rating}
          reviewText={review.reviewText}
          reviewedAt={review.reviewedAt}
        />
      ))}
      {hasMore && <LoadMoreReviews slug={slug} sort={sort} count={count} />}
    </div>
  );
}
