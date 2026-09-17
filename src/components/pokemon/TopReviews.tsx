import Image from "next/image";
import type { TopReviewItem } from "@/lib/user-pokemon";
import { formatRatingValue, toFillPercent } from "@/lib/rating";
import { TopReviewsEmptyState } from "@/components/pokemon/TopReviewsEmptyState";

interface TopReviewsProps {
  pokemonName: string;
  totalReviewCount: number;
  reviews: TopReviewItem[];
  isAuthenticated: boolean;
}

export function TopReviews({ pokemonName, totalReviewCount, reviews, isAuthenticated }: TopReviewsProps) {
  return (
    <div className="leading-[normal]">
      <div className="mb-[14px] flex items-center justify-between">
        <h2 className="font-heading text-[17px] font-bold md:text-[19px]">Top reviews</h2>
        <span className="cursor-pointer text-[12.5px] text-[#7b818c] md:text-[13px]">
          View all {totalReviewCount.toLocaleString()} →
        </span>
      </div>
      {reviews.length === 0 ? (
        <TopReviewsEmptyState pokemonName={pokemonName} isAuthenticated={isAuthenticated} />
      ) : (
        reviews.map((review) => {
          const letter = review.username.charAt(0).toUpperCase();
          const starFillPct = review.rating !== null ? toFillPercent(review.rating) : 0;
          const date = review.reviewedAt.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          });

          return (
            <article
              key={review.id}
              className="mb-[12px] rounded-[14px] border border-white/[0.06] bg-[#15181e] p-[16px] md:mb-[13px] md:p-[18px]"
            >
              <div className="mb-[11px] flex items-center gap-[11px]">
                <div className="flex size-[30px] flex-none items-center justify-center overflow-hidden rounded-full bg-[linear-gradient(135deg,#6a5acd,var(--brand-to))] text-[11px] font-extrabold text-white md:size-[34px] md:text-[12px]">
                  {review.avatarImage ? (
                    <Image
                      src={review.avatarImage}
                      alt=""
                      width={34}
                      height={34}
                      className="size-full object-cover"
                    />
                  ) : (
                    letter
                  )}
                </div>
                <div className="flex-1">
                  <span className="text-[13.5px] font-bold md:text-[14px]">{review.username}</span>{" "}
                  <span className="text-[12px] text-[#7b818c]">
                    {review.isOwn ? `· you · ${date}` : `· ${date}`}
                  </span>
                </div>
                {review.rating !== null ? (
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
                      {formatRatingValue(review.rating)}
                    </span>
                  </>
                ) : (
                  <span className="text-[12px] text-[#7b818c]">Not yet rated</span>
                )}
              </div>
              <p className="text-[13.5px] leading-[1.55] text-[#cdd2da] md:text-[14.5px]">
                {review.reviewText}
              </p>
            </article>
          );
        })
      )}
    </div>
  );
}
