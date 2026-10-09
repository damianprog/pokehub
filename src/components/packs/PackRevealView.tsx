"use client";

import { useState } from "react";
import type { OpenedPack } from "@/lib/packs";
import { PackCardRow } from "@/components/packs/PackCardRow";
import { PackCountdown } from "@/components/packs/PackCountdown";

interface PackRevealViewProps {
  pack: OpenedPack;
  resetAt: number;
  serverNow: number;
}

/** Right after opening: the cards come in one by one, with a client-side replay. */
export function PackRevealView({ pack, resetAt, serverNow }: PackRevealViewProps) {
  // Bumping the key remounts the row, which restarts its CSS animations.
  const [replays, setReplays] = useState(0);
  const newCount = pack.slots.filter((slot) => slot.isNew).length;
  const duplicateCount = pack.slots.length - newCount;

  return (
    <div className="w-full">
      <div className="mb-[16px] text-center md:mb-[24px] md:text-left">
        <div className="mb-[4px] text-[10.5px] font-extrabold tracking-[0.1em] text-[#8ff0b8] md:mb-[5px] md:text-[11.5px]">
          DAILY PACK
        </div>
        <div className="font-heading text-[18px] font-bold md:text-[20px]">Here&apos;s what you got</div>
      </div>

      <PackCardRow key={replays} slots={pack.slots} animated />

      <div className="mt-[18px] text-center md:mt-[24px]">
        <div className="mb-[12px] text-[13.5px] text-[#cdd2da] md:mb-[14px] md:text-[14px]">
          {newCount > 0 && <span className="font-bold text-white">{newCount} new</span>}
          {newCount > 0 && duplicateCount > 0 && " · "}
          {duplicateCount > 0 && `${duplicateCount} duplicate${duplicateCount === 1 ? "" : "s"}`}
        </div>
        <div className="flex flex-col items-center gap-[10px] md:flex-row md:justify-center md:gap-[14px]">
          <button
            type="button"
            onClick={() => setReplays((count) => count + 1)}
            className="flex h-[44px] w-full items-center justify-center rounded-[12px] border border-white/12 bg-white/5 text-[14px] font-bold text-foreground md:h-[42px] md:w-auto md:rounded-[11px] md:px-[22px]"
          >
            Replay animation
          </button>
          <span className="text-[12.5px] text-[#7b818c] md:text-[13px]">
            Next pack in <PackCountdown resetAt={resetAt} serverNow={serverNow} />
          </span>
        </div>
      </div>
    </div>
  );
}
