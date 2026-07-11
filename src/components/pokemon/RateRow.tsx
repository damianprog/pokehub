interface RateRowProps {
  rank: number;
  typeLabel: string;
  listCount: number;
  likeCount: number;
}

export function RateRow({
  rank,
  typeLabel,
  listCount,
  likeCount,
}: RateRowProps) {
  return (
    <div className="mb-[22px] flex items-center gap-[14px] rounded-[14px] border border-white/[0.06] bg-[#13161b] px-[16px] py-[14px] leading-[normal] md:px-[20px] md:py-[16px]">
      <span className="text-[13px] font-semibold text-[#9aa0ab]">Rate it</span>
      <span
        className="ml-auto cursor-pointer text-[22px] tracking-[4px] text-[#4a4f5a] md:ml-0 md:text-[24px] md:tracking-[5px]"
        style={{ fontFamily: "Arial" }}
      >
        ★★★★★
      </span>
      <div className="hidden gap-[24px] text-[12.5px] text-[#7b818c] md:ml-auto md:flex">
        <span>
          Ranked <span className="font-bold text-[#ff9a6b]">#{rank}</span> of{" "}
          {typeLabel}
        </span>
        <span>
          In{" "}
          <span className="font-bold text-[#e8eaed]">
            {listCount.toLocaleString()}
          </span>{" "}
          lists
        </span>
        <span>
          <span className="font-bold text-[#e8eaed]">
            {likeCount.toLocaleString()}
          </span>{" "}
          likes
        </span>
      </div>
    </div>
  );
}
