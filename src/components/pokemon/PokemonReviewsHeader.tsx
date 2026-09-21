import Image from "next/image";
import { TYPE_GRADIENTS, FALLBACK_GRADIENT } from "@/lib/type-gradients";
import { TYPE_BADGE_COLORS, FALLBACK_BADGE_COLOR } from "@/lib/type-badge-colors";
import { WriteReviewButton } from "@/components/pokemon/WriteReviewButton";

interface PokemonReviewsHeaderProps {
  id: number;
  name: string;
  types: string[];
  artworkUrl: string;
  totalReviewCount: number;
  average: number;
  isAuthenticated: boolean;
}

/**
 * The compact identity block at the top of `/p/[slug]/reviews` — a small
 * per-type-gradient thumbnail, dex number, name, and type badges, plus the
 * "Reviews" heading and review/rating count line. Distinct from
 * `PokemonHeader` (the detail page's full-size stacked treatment) since this
 * is a horizontal, scaled-down row — see
 * rating-review/rating-07-all-reviews-page-shell-spec.md §4.
 *
 * The desktop "Write review" button lives here, inline at the end of the
 * row; the mobile one is a separate full-width instance rendered by the page
 * below the community rating card, matching the design's different layout
 * position at that breakpoint.
 */
export function PokemonReviewsHeader({
  id,
  name,
  types,
  artworkUrl,
  totalReviewCount,
  average,
  isAuthenticated,
}: PokemonReviewsHeaderProps) {
  const dexNumber = `#${String(id).padStart(3, "0")}`;
  const { bg } = TYPE_GRADIENTS[types[0]?.toLowerCase()] ?? FALLBACK_GRADIENT;
  const countLine =
    totalReviewCount === 0
      ? "No reviews yet"
      : `${totalReviewCount.toLocaleString()} review${totalReviewCount === 1 ? "" : "s"} · ${average.toFixed(1)} average`;

  return (
    <div className="mb-[16px] flex items-center gap-[13px] leading-[normal] md:gap-[20px]">
      <div
        className="relative size-[60px] shrink-0 overflow-hidden rounded-[13px] md:size-[84px] md:rounded-[16px]"
        style={{ background: bg }}
      >
        <Image src={artworkUrl} alt={name} fill className="object-contain p-[4px] md:p-[5px]" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-[4px] flex flex-wrap items-center gap-[7px] md:mb-[5px] md:gap-[10px]">
          <span className="font-heading text-[12px] text-[#7b818c] md:text-[13px]">{dexNumber}</span>
          <span className="font-heading text-[15px] font-bold md:text-[18px]">{name}</span>
          {types.map((type) => {
            const meta = TYPE_BADGE_COLORS[type.toLowerCase()];
            const { bg: badgeBg, color } = meta ?? FALLBACK_BADGE_COLOR;
            const label = meta?.label ?? type;

            return (
              <span
                key={type}
                className="inline-flex h-[20px] items-center justify-center rounded-[6px] px-[9px] text-[10.5px] font-bold tracking-[0.04em] uppercase md:h-[22px] md:px-[10px] md:text-[11px]"
                style={{ background: badgeBg, color }}
              >
                {label}
              </span>
            );
          })}
        </div>
        <h1 className="font-heading text-[28px] leading-[1.05] font-bold tracking-[-0.025em] md:text-[38px] md:tracking-[-0.03em]">
          Reviews
        </h1>
        <div className="mt-[2px] text-[13px] text-[#8b919e] md:mt-[6px] md:text-[13.5px]">{countLine}</div>
      </div>
      <WriteReviewButton
        isAuthenticated={isAuthenticated}
        className="hidden h-[44px] shrink-0 items-center rounded-[12px] px-[22px] text-[14.5px] shadow-[0_8px_24px_rgba(196,79,224,0.32)] md:inline-flex"
      />
    </div>
  );
}
