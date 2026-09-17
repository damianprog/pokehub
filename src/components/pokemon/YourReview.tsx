import { ReviewCard } from "@/components/pokemon/ReviewCard";
import { YourReviewMenu } from "@/components/pokemon/YourReviewMenu";

interface YourReviewProps {
  pokemonId: number;
  slug: string;
  pokemonName: string;
  username: string;
  /** `/u/[username]`, or null if the viewer somehow has no username set. */
  profileHref: string | null;
  avatarImage?: string | null;
  /** Half-star units, or null if the user cleared their rating but kept the written review (see rating-04 §2). */
  rating: number | null;
  reviewText: string;
  reviewedAt: Date;
}

/**
 * The signed-in user's own review, pinned above `TopReviews`. Only rendered
 * by the caller once `reviewText` is set — a bare rating with no text is
 * already visible on the "Rate it" row, so it doesn't get a card here (see
 * rating-review/rating-04-your-review-block-spec.md §2).
 */
export function YourReview({
  pokemonId,
  slug,
  pokemonName,
  username,
  profileHref,
  avatarImage,
  rating,
  reviewText,
  reviewedAt,
}: YourReviewProps) {
  return (
    <div className="mb-[18px] leading-[normal]">
      <div className="mb-[14px] flex items-center justify-between">
        <h2 className="font-heading text-[17px] font-bold md:text-[19px]">Your review</h2>
        <span className="text-[12px] text-[#7b818c]">Only you can edit this</span>
      </div>
      <ReviewCard
        username={username}
        profileHref={profileHref}
        avatarImage={avatarImage}
        rating={rating}
        reviewText={reviewText}
        reviewedAt={reviewedAt}
        variant="pinned"
        menu={
          <YourReviewMenu pokemonId={pokemonId} slug={slug} pokemonName={pokemonName} rating={rating} />
        }
      />
    </div>
  );
}
