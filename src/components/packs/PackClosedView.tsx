import { DAILY_PACK_STYLE } from "@/lib/pack-styles";
import { PackWrapper } from "@/components/packs/PackWrapper";
import { PackErrorNotice } from "@/components/packs/PackErrorNotice";

const PRIMARY_BUTTON =
  "font-heading flex w-full items-center justify-center rounded-[13px] bg-[linear-gradient(135deg,var(--brand-from),var(--brand-to))] text-brand-ink md:inline-flex md:w-auto";

interface PackClosedViewProps {
  phase: "idle" | "opening" | "error";
  onOpen: () => void;
}

/** Today's daily pack, not opened yet: the foil wrapper and its open button. */
export function PackClosedView({ phase, onOpen }: PackClosedViewProps) {
  return (
    <div className="flex w-full flex-col items-center text-center">
      <div
        className="mb-[4px] text-[10.5px] font-extrabold tracking-[0.1em] md:mb-[6px] md:text-[11.5px]"
        style={{ color: DAILY_PACK_STYLE.accent }}
      >
        FREE TODAY
      </div>
      <div className="font-heading mb-[18px] text-[19px] font-bold md:mb-[22px] md:text-[22px] md:tracking-[-0.01em]">
        Daily pack
      </div>

      <div className="mb-[20px] md:mb-[26px]">
        <PackWrapper packStyle={DAILY_PACK_STYLE} state={phase} />
      </div>

      {phase === "error" && <PackErrorNotice />}

      {phase === "opening" ? (
        <button
          type="button"
          disabled
          className={`${PRIMARY_BUTTON} h-[50px] cursor-progress gap-[10px] text-[16px] font-bold opacity-70 md:h-[52px] md:gap-[11px] md:rounded-[14px] md:px-[34px] md:text-[17px]`}
        >
          <span className="size-[16px] animate-spin rounded-full border-[2.5px] border-brand-ink/30 border-t-brand-ink md:size-[17px]" />
          Opening…
        </button>
      ) : (
        <button
          type="button"
          onClick={onOpen}
          className={`${PRIMARY_BUTTON} font-bold ${
            phase === "error"
              ? "h-[48px] text-[16px] shadow-[0_8px_28px_rgba(63,217,138,0.35)] md:px-[32px]"
              : "h-[50px] text-[16px] shadow-[0_8px_24px_rgba(63,217,138,0.35)] md:h-[52px] md:rounded-[14px] md:px-[38px] md:text-[17px] md:shadow-[0_8px_28px_rgba(63,217,138,0.4)]"
          }`}
        >
          {phase === "error" ? "Try again" : "Open daily pack"}
        </button>
      )}

      {phase !== "error" && (
        <div className="mt-[11px] text-[12.5px] text-[#7b818c] md:mt-[14px] md:text-[13px]">
          {phase === "opening" ? "Shuffling your cards" : "One free pack a day · resets at midnight UTC"}
        </div>
      )}
    </div>
  );
}
