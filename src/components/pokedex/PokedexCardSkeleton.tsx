const SHIMMER =
  "animate-skeleton bg-[linear-gradient(90deg,#1b1e25_0%,#252932_50%,#1b1e25_100%)] bg-[length:200%_100%]";

interface PokedexCardSkeletonProps {
  className?: string;
}

export function PokedexCardSkeleton({ className = "" }: PokedexCardSkeletonProps) {
  return (
    <div
      className={`rounded-[13px] border border-white/[0.06] bg-[#15181e] p-[10px] md:rounded-[14px] md:p-[12px] ${className}`}
    >
      <div className={`mb-[10px] aspect-square rounded-[10px] md:mb-[12px] md:rounded-[11px] ${SHIMMER}`} />
      <div className={`mb-[7px] h-[9px] w-[34%] rounded-[5px] md:mb-[8px] md:h-[10px] ${SHIMMER}`} />
      <div className={`mb-[10px] h-[13px] w-[72%] rounded-[6px] md:mb-[11px] md:h-[14px] ${SHIMMER}`} />
      <div className="mb-[10px] flex gap-[4px] md:mb-[12px] md:gap-[5px]">
        <div className="h-[18px] w-[40px] rounded-[5px] bg-[#1d2027] md:h-[20px] md:w-[44px] md:rounded-[6px]" />
        <div className="h-[18px] w-[46px] rounded-[5px] bg-[#1d2027] md:h-[20px] md:w-[52px] md:rounded-[6px]" />
      </div>
      <div className={`h-[11px] w-[66%] rounded-[5px] md:h-[12px] md:w-[64%] ${SHIMMER}`} />
    </div>
  );
}
