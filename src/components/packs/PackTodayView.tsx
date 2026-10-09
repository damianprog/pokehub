import Image from "next/image";
import type { OpenedPack } from "@/lib/packs";
import { PackCardRow } from "@/components/packs/PackCardRow";
import { PackCountdown } from "@/components/packs/PackCountdown";
import { PackOpenedAt } from "@/components/packs/PackOpenedAt";

const SNORLAX_ARTWORK =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/143.png";

interface PackTodayViewProps {
  pack: OpenedPack;
  resetAt: number;
  serverNow: number;
}

/** Coming back later the same UTC day: today's cards, still, and the time to the next free pack. */
export function PackTodayView({ pack, resetAt, serverNow }: PackTodayViewProps) {
  return (
    <div className="w-full">
      <div className="mb-[16px] text-center md:mb-[24px] md:text-left">
        <div className="mb-[4px] text-[10.5px] font-extrabold tracking-[0.1em] text-[#8ff0b8] md:mb-[5px] md:text-[11.5px]">
          TODAY&apos;S DAILY PACK
        </div>
        <div className="font-heading min-h-[1.5em] text-[18px] font-bold md:text-[20px]">
          Opened at <PackOpenedAt openedAt={pack.openedAt} />
        </div>
      </div>

      <PackCardRow slots={pack.slots} animated={false} />

      <div className="mt-[18px] flex flex-col items-center gap-[2px] rounded-[13px] border border-white/[0.06] bg-white/[0.03] p-[14px] md:mt-[26px] md:flex-row md:justify-center md:gap-[14px] md:rounded-[14px] md:px-[16px] md:py-[8px]">
        <div className="relative mb-[4px] h-[54px] w-[64px] flex-none md:mb-0 md:h-[64px] md:w-[76px]">
          <Image
            src={SNORLAX_ARTWORK}
            alt=""
            width={76}
            height={64}
            className="size-full object-contain md:drop-shadow-[0_6px_10px_rgba(0,0,0,0.4)]"
          />
          <span
            aria-hidden
            className="font-heading absolute -top-[2px] -right-[8px] hidden text-[13px] font-bold text-[#9aa0ab] md:block"
          >
            z<span className="text-[10px]">z</span>
          </span>
        </div>
        <span className="text-[12.5px] text-[#9aa0ab] md:text-[14px]">Next free pack in</span>
        <span className="font-heading text-[26px] font-bold tracking-[-0.02em] text-[#f3f4f6] md:text-[28px]">
          <PackCountdown resetAt={resetAt} serverNow={serverNow} />
        </span>
        <span className="hidden text-[12.5px] text-[#7b818c] md:inline">resets at midnight UTC</span>
      </div>
    </div>
  );
}
