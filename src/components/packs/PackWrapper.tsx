import Image from "next/image";
import type { PackStyle } from "@/lib/pack-styles";

const SPRITE_BASE =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork";

const SEAL =
  "absolute inset-x-0 h-[13px] bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.2)_0_2px,rgba(0,0,0,0.18)_2px_5px)]";

interface PackWrapperProps {
  packStyle: PackStyle;
  /** "opening" wobbles the pack; "error" dims it and drops the glow. */
  state?: "idle" | "opening" | "error";
}

/**
 * The foil booster wrapper (Claude Design, revision of 2026-10-08). The three
 * Pokémon in the window are fixed decoration, not the pack's contents. Drawn
 * at the desktop size and zoomed down on mobile, matching the design's 134px
 * mobile wrapper.
 */
export function PackWrapper({ packStyle, state = "idle" }: PackWrapperProps) {
  return (
    <div
      aria-hidden
      className={`relative h-[252px] w-[180px] flex-none overflow-hidden rounded-[10px] max-md:[zoom:0.744] ${state === "opening" ? "animate-pack-shake motion-reduce:animate-none" : ""} ${state === "error" ? "opacity-55" : ""}`}
      style={{
        background: packStyle.background,
        border: `1px solid ${packStyle.border}`,
        boxShadow: state === "error" ? "none" : packStyle.glow,
      }}
    >
      <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_28%,rgba(255,255,255,0.11)_44%,transparent_58%),linear-gradient(180deg,rgba(255,255,255,0.07),transparent_45%)]" />
      <div className={`${SEAL} top-0 border-b border-black/35`} />
      <div className={`${SEAL} bottom-0 border-t border-black/35`} />

      <div className="absolute inset-x-0 top-[24px] flex items-center justify-center gap-[6px]">
        <span className="font-heading flex size-[18px] items-center justify-center rounded-[5px] bg-[linear-gradient(135deg,var(--brand-from),var(--brand-to))] text-[10px] font-extrabold text-brand-ink">
          P
        </span>
        <span className="font-heading text-[13px] font-bold tracking-[-0.01em] text-[#f3f4f6]">
          PokeHub
        </span>
      </div>

      <div className="absolute inset-x-[14px] top-[50px] h-[118px] overflow-hidden rounded-[14px] border border-white/16 bg-[radial-gradient(ellipse_at_50%_62%,rgba(255,255,255,0.42),rgba(255,255,255,0.08)_72%)]">
        <Image
          src={`${SPRITE_BASE}/94.png`}
          alt=""
          loading="eager"
          width={74}
          height={74}
          className="absolute bottom-[4px] left-[26%] z-1 size-[74px] -translate-x-1/2 -rotate-[14deg] object-contain drop-shadow-[0_3px_5px_rgba(0,0,0,0.4)]"
        />
        <Image
          src={`${SPRITE_BASE}/149.png`}
          alt=""
          loading="eager"
          width={74}
          height={74}
          className="absolute bottom-[4px] left-[74%] z-3 size-[74px] -translate-x-1/2 rotate-[14deg] object-contain drop-shadow-[0_3px_5px_rgba(0,0,0,0.4)]"
        />
        <Image
          src={`${SPRITE_BASE}/25.png`}
          alt=""
          loading="eager"
          width={88}
          height={88}
          className="absolute -bottom-[2px] left-1/2 z-2 size-[88px] -translate-x-1/2 object-contain drop-shadow-[0_3px_5px_rgba(0,0,0,0.4)]"
        />
        <div className="absolute inset-0 z-3 bg-[linear-gradient(115deg,transparent_35%,rgba(255,255,255,0.18)_50%,transparent_65%)]" />
      </div>

      <div className="absolute inset-x-0 bottom-[24px] text-center">
        <div
          className="text-[10.5px] font-extrabold tracking-[0.14em]"
          style={{ color: packStyle.accent }}
        >
          {packStyle.tag}
        </div>
        <div className="mt-[3px] text-[9.5px] font-semibold tracking-[0.1em] text-white/50">
          3 CARDS
        </div>
      </div>
    </div>
  );
}
