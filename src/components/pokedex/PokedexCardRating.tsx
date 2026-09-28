interface PokedexCardRatingProps {
  average: string;
  fillPercent: number;
  totalRatings: number;
}

function formatShortCount(count: number): string {
  return count >= 1000 ? `${(count / 1000).toFixed(1)}k` : String(count);
}

/** Community average + count line at the bottom of a Pokédex card — full count on desktop, shortened ("1.2k") on mobile. */
export function PokedexCardRating({ average, fillPercent, totalRatings }: PokedexCardRatingProps) {
  return (
    <div className="flex items-center gap-[5px] whitespace-nowrap md:gap-[6px]">
      <span
        className="relative inline-block text-[11px] leading-none tracking-[1px] md:text-[12px] md:tracking-[1.5px]"
        style={{ fontFamily: "Arial" }}
      >
        <span className="text-[#363b45]">★★★★★</span>
        <span
          className="absolute top-0 left-0 overflow-hidden whitespace-nowrap text-[#e6b450]"
          style={{ width: `${fillPercent}%` }}
        >
          ★★★★★
        </span>
      </span>
      <span className="font-heading text-[12.5px] font-bold text-[#e6b450] md:text-[13px]">
        {average}
      </span>
      <span className="text-[11px] text-[#7b818c] md:hidden">{formatShortCount(totalRatings)}</span>
      <span className="hidden text-[11.5px] text-[#7b818c] md:inline">
        {totalRatings.toLocaleString("en-US")}
      </span>
    </div>
  );
}
