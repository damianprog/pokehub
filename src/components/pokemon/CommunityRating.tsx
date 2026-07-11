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
    <div className="mb-[12px] flex items-center gap-[16px] rounded-[16px] border border-white/[0.06] bg-[#15181e] p-[18px] leading-[normal] md:mb-[14px] md:gap-[30px] md:p-[22px]">
      <div className="flex-none text-center">
        <div className="font-heading text-[40px] leading-none font-bold text-[#e6b450] md:text-[54px]">
          {average.toFixed(1)}
        </div>
        <div
          className="relative mt-[5px] inline-block text-[14px] leading-none tracking-[2px] md:mt-[6px] md:text-[17px] md:tracking-[3px]"
          style={{ fontFamily: "Arial" }}
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
      <div className="flex flex-1 flex-col gap-[5px] md:gap-[6px]">
        {distribution.map(({ stars, count }) => {
          const barWidthPct = totalRatings === 0 ? 0 : (count / totalRatings) * 100;

          return (
            <div key={stars} className="flex items-center gap-[8px] md:gap-[10px]">
              <span className="w-[20px] text-right text-[10.5px] text-[#7b818c] md:w-[26px] md:text-[11px]">
                {stars}★
              </span>
              <div className="h-[6px] flex-1 rounded-[4px] bg-white/[0.05] md:h-[8px] md:rounded-[5px]">
                <div
                  className="h-[6px] rounded-[4px] md:h-[8px] md:rounded-[5px]"
                  style={{ width: `${barWidthPct}%`, background: BAR_COLORS[stars] }}
                />
              </div>
              <span className="w-[38px] text-[10.5px] text-[#7b818c] md:w-[42px] md:text-[11px]">
                {count.toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
