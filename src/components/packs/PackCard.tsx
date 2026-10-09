import Image from "next/image";
import Link from "next/link";
import type { PackSlot } from "@/lib/packs";
import { RARITY_CARD_COLORS, RARITY_LABELS } from "@/lib/rarity-colors";

const SHINY_BACKGROUND = "radial-gradient(circle at 50% 70%,#ffd07a,#2fbf78 78%)";

/**
 * A pulled Pokémon as a tier card (Claude Design "Card tiers"). A shiny swaps
 * the tier look for the gold-mint finish but keeps its tier on the label.
 */
export function PackCard({ slot }: { slot: PackSlot }) {
  const tier = RARITY_CARD_COLORS[slot.rarity];
  const label = RARITY_LABELS[slot.rarity];

  return (
    <Link
      href={`/p/${slot.slug}`}
      className={`relative block h-[132px] overflow-hidden rounded-[12px] md:h-[242px] md:rounded-[16px] ${slot.isShiny ? "animate-shiny-pulse motion-reduce:animate-none" : ""}`}
      style={
        slot.isShiny
          ? { background: SHINY_BACKGROUND }
          : {
              background: `radial-gradient(circle at 50% 68%, ${tier.gradient})`,
              border: `1px solid ${tier.border}`,
              boxShadow: tier.shadow,
            }
      }
    >
      {slot.isShiny ? (
        <>
          <div className="pointer-events-none absolute inset-0 z-2 animate-shimmer bg-[linear-gradient(115deg,transparent_38%,rgba(255,255,255,0.55)_50%,transparent_62%)] bg-[length:300%_100%] motion-reduce:animate-none" />
          <span className="absolute top-[6px] left-[7px] z-3 text-[8px] font-extrabold tracking-[0.06em] text-white md:hidden">
            ✦ SHINY
          </span>
          <span className="absolute top-[6px] right-[8px] z-3 animate-twinkle text-[10px] text-white motion-reduce:animate-none md:top-[10px] md:right-[12px] md:text-[15px]">
            ✦
          </span>
          <span className="absolute top-[34px] right-[34px] z-3 hidden animate-twinkle text-[9px] text-white [animation-delay:0.6s] motion-reduce:animate-none md:block">
            ✦
          </span>
          <span className="absolute top-[52%] left-[14px] z-3 hidden animate-twinkle text-[11px] text-white [animation-delay:1.1s] motion-reduce:animate-none md:block">
            ✦
          </span>
        </>
      ) : (
        <div className="absolute inset-0 hidden bg-[repeating-linear-gradient(45deg,rgba(255,255,255,0.04)_0_2px,transparent_2px_11px)] md:block" />
      )}

      <Image
        src={slot.artworkUrl}
        alt={slot.isShiny ? `Shiny ${slot.name}` : slot.name}
        width={180}
        height={180}
        loading="eager"
        className="absolute bottom-[30px] left-1/2 z-1 h-[55%] w-[80%] -translate-x-1/2 object-contain drop-shadow-[0_6px_10px_rgba(0,0,0,0.45)] md:bottom-[44px] md:h-[52%] md:w-[78%] md:drop-shadow-[0_8px_16px_rgba(0,0,0,0.45)]"
      />

      <span className="absolute bottom-[15px] left-[8px] z-3 max-w-[calc(100%-16px)] truncate text-[12px] font-bold text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.3)] md:bottom-[22px] md:left-[14px] md:max-w-[calc(100%-28px)] md:text-[16px]">
        {slot.name}
      </span>
      <span
        className="absolute bottom-[4px] left-[8px] z-3 text-[8px] font-extrabold tracking-[0.06em] md:bottom-[6px] md:left-[14px] md:text-[11px] md:font-bold md:tracking-[0.08em]"
        style={{ color: slot.isShiny ? "#fff" : tier.caption }}
      >
        <span className="hidden md:inline">{slot.isShiny ? `✦ SHINY · ${label}` : label}</span>
        <span className="md:hidden">{label}</span>
      </span>
    </Link>
  );
}
