interface RatingDistributionEntry {
  stars: 1 | 2 | 3 | 4 | 5;
  count: number;
}

interface CommunityRatingProps {
  average: number;
  totalRatings: number;
  distribution: RatingDistributionEntry[];
}

const BAR_COLORS: Record<number, string> = {
  5: "#e6b450",
  4: "#e6b450",
  3: "#b89540",
  2: "#8a7030",
  1: "#6a5826",
};

export function CommunityRating({
  average,
  totalRatings,
  distribution,
}: CommunityRatingProps) {
  const starFillPct = Math.min(100, Math.max(0, (average / 5) * 100));

  return (
    <div className="mb-[14px] flex items-center gap-[30px] rounded-[16px] border border-white/[0.06] bg-[#15181e] p-[22px]">
      <div className="flex-none text-center">
        <div className="font-heading text-[54px] leading-none font-bold text-[#e6b450]">
          {average.toFixed(1)}
        </div>
        <div
          className="relative mt-[6px] inline-block leading-none"
          style={{ fontSize: "17px", letterSpacing: "3px", fontFamily: "Arial" }}
        >
          <span style={{ color: "#363b45" }}>★★★★★</span>
          <span
            className="absolute top-0 left-0 overflow-hidden whitespace-nowrap"
            style={{ color: "#e6b450", width: `${starFillPct}%` }}
          >
            ★★★★★
          </span>
        </div>
        <div className="mt-[7px] text-[12px] text-[#7b818c]">
          {totalRatings.toLocaleString()} ratings
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-[6px]">
        {distribution.map(({ stars, count }) => {
          const barWidthPct = totalRatings === 0 ? 0 : (count / totalRatings) * 100;

          return (
            <div key={stars} className="flex items-center gap-[10px]">
              <span className="w-[26px] text-right text-[11px] text-[#7b818c]">
                {stars}★
              </span>
              <div className="h-[8px] flex-1 rounded-[5px] bg-white/[0.05]">
                <div
                  className="h-[8px] rounded-[5px]"
                  style={{ width: `${barWidthPct}%`, background: BAR_COLORS[stars] }}
                />
              </div>
              <span className="w-[42px] text-[11px] text-[#7b818c]">
                {count.toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
