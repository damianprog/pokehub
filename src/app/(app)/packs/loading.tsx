import { PacksHeader } from "@/components/packs/PacksHeader";
import { PackStageCard } from "@/components/packs/PackStageCard";

const SHIMMER =
  "animate-skeleton bg-[linear-gradient(90deg,#171a20_0%,#21252d_50%,#171a20_100%)] bg-[length:200%_100%]";

// The real header is static text, so it renders as-is; only the stage is a placeholder.
export default function PacksLoading() {
  return (
    <div>
      <PacksHeader />
      <PackStageCard>
        <div className="flex w-full flex-col items-center gap-[20px] md:gap-[24px]">
          <div className={`h-[188px] w-[134px] rounded-[8px] md:h-[252px] md:w-[180px] md:rounded-[10px] ${SHIMMER}`} />
          <div className={`h-[50px] w-full rounded-[13px] md:h-[52px] md:w-[220px] md:rounded-[14px] ${SHIMMER}`} />
        </div>
      </PackStageCard>
    </div>
  );
}
