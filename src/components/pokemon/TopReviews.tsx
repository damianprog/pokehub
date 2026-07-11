interface ReviewItem {
  id: string;
  username: string;
  followerCount: number;
  avatarInitial: string;
  avatarGradientFrom: string;
  avatarGradientTo: string;
  rating: number;
  text: string;
  helpfulCount: number;
}

interface TopReviewsProps {
  totalReviewCount: number;
  reviews: ReviewItem[];
}

function formatFollowerCount(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return count.toLocaleString();
}

export function TopReviews({ totalReviewCount, reviews }: TopReviewsProps) {
  return (
    <div className="leading-[normal]">
      <div className="mb-[14px] flex items-center justify-between">
        <h2 className="font-heading text-[17px] font-bold md:text-[19px]">Top Reviews</h2>
        <span className="cursor-pointer text-[12.5px] text-[#7b818c] md:text-[13px]">
          View all {totalReviewCount.toLocaleString()} →
        </span>
      </div>
      {reviews.map((review) => {
        const starFillPct = Math.min(100, Math.max(0, (review.rating / 5) * 100));

        return (
          <article
            key={review.id}
            className="mb-[12px] rounded-[14px] border border-white/[0.06] bg-[#15181e] p-[16px] md:mb-[13px] md:p-[18px]"
          >
            <div className="mb-[11px] flex items-center gap-[11px]">
              <div
                className="flex size-[30px] flex-none cursor-pointer items-center justify-center rounded-full text-[11px] font-extrabold text-white md:size-[34px] md:text-[12px]"
                style={{
                  background: `linear-gradient(135deg, ${review.avatarGradientFrom}, ${review.avatarGradientTo})`,
                }}
              >
                {review.avatarInitial}
              </div>
              <div className="flex-1">
                <span className="text-[13.5px] font-bold md:text-[14px]">{review.username}</span>{" "}
                <span className="hidden text-[12px] text-[#7b818c] md:inline">
                  · {formatFollowerCount(review.followerCount)} followers
                </span>
              </div>
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
            </div>
            <p className="mb-[10px] text-[13.5px] leading-[1.55] text-[#cdd2da] md:text-[14.5px]">
              &quot;{review.text}&quot;
            </p>
            <div className="text-[12px] text-[#7b818c] md:text-[12.5px]">
              ♥ {review.helpfulCount.toLocaleString()} found this helpful
            </div>
          </article>
        );
      })}
    </div>
  );
}
