import Image from "next/image";
import { formatRatingValue, toFillPercent } from "@/lib/rating";
import { YourReviewMenu } from "@/components/pokemon/YourReviewMenu";

interface YourReviewProps {
  pokemonId: number;
  slug: string;
  pokemonName: string;
  username: string;
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
  avatarImage,
  rating,
  reviewText,
  reviewedAt,
}: YourReviewProps) {
  const starFillPct = rating !== null ? toFillPercent(rating) : 0;
  const letter = username.charAt(0).toUpperCase();
  const date = reviewedAt.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="mb-[18px] leading-[normal]">
      <div className="mb-[14px] flex items-center justify-between">
        <h2 className="font-heading text-[17px] font-bold md:text-[19px]">Your review</h2>
        <span className="text-[12px] text-[#7b818c]">Only you can edit this</span>
      </div>
      <article className="relative rounded-[14px] border border-[rgba(196,79,224,0.22)] bg-[#15181e] p-[16px] shadow-[inset_3px_0_0_0_rgba(196,79,224,0.55)] md:p-[18px]">
        <div className="mb-[11px] flex items-center gap-[11px]">
          <div className="flex size-[30px] flex-none items-center justify-center overflow-hidden rounded-full bg-[linear-gradient(135deg,#6a5acd,var(--brand-to))] text-[11px] font-extrabold text-white md:size-[34px] md:text-[12px]">
            {avatarImage ? (
              <Image src={avatarImage} alt="" width={34} height={34} className="size-full object-cover" />
            ) : (
              letter
            )}
          </div>
          <div className="flex-1">
            <span className="text-[13.5px] font-bold md:text-[14px]">{username}</span>{" "}
            <span className="text-[12px] text-[#7b818c]">· {date}</span>
          </div>
          {rating !== null ? (
            <>
              <span
                className="relative inline-block text-[12.5px] leading-none tracking-[2px] md:text-[14px]"
                style={{ fontFamily: "Arial" }}
              >
                <span style={{ color: "#363b45" }}>★★★★★</span>
                <span
                  className="absolute top-0 left-0 overflow-hidden whitespace-nowrap"
                  style={{ color: "#e6b450", width: `${starFillPct}%` }}
                >
                  ★★★★★
                </span>
              </span>
              <span className="font-heading text-[13px] font-bold text-[#e6b450]">
                {formatRatingValue(rating)}
              </span>
            </>
          ) : (
            <span className="text-[12px] text-[#7b818c]">Not yet rated</span>
          )}
          <YourReviewMenu pokemonId={pokemonId} slug={slug} pokemonName={pokemonName} rating={rating} />
        </div>
        <p className="text-[13.5px] leading-[1.6] whitespace-pre-line text-[#cdd2da] md:text-[14.5px]">
          {reviewText}
        </p>
      </article>
    </div>
  );
}
