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
    <div className="mb-[22px] flex items-center gap-[14px] rounded-[14px] border border-white/[0.06] bg-[#13161b] px-[20px] py-[16px] leading-[normal]">
      <span className="text-[13px] font-semibold text-[#9aa0ab]">Rate it</span>
      <span
        className="cursor-pointer text-[24px] text-[#4a4f5a]"
        style={{ letterSpacing: "5px", fontFamily: "Arial" }}
      >
        ★★★★★
      </span>
      <div className="flex-1" />
      <div className="flex gap-[24px] text-[12.5px] text-[#7b818c]">
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
