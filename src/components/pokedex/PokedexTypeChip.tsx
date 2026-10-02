import Link from "next/link";
import { TYPE_BADGE_COLORS, FALLBACK_BADGE_COLOR } from "@/lib/type-badge-colors";
import { PokedexLinkPending } from "@/components/pokedex/PokedexLinkPending";

interface PokedexTypeChipProps {
  type: string;
  selected: boolean;
  /** Where toggling this chip goes, or `null` for the inert loading-skeleton version. */
  href: string | null;
}

const CHIP_CLASS =
  "inline-flex h-[30px] items-center gap-[6px] rounded-[8px] border px-[11px] text-[11px] font-bold tracking-[0.04em] uppercase select-none";

/** One toggleable type in the filter panel's Type row. */
export function PokedexTypeChip({ type, selected, href }: PokedexTypeChipProps) {
  const badge = TYPE_BADGE_COLORS[type];
  const colors = badge ?? FALLBACK_BADGE_COLOR;
  const style = {
    // Selected: the badge fill at double strength, a border in the type's color.
    background: selected ? colors.bg.replace("0.18)", "0.38)") : colors.bg,
    borderColor: selected ? colors.color : "transparent",
    color: selected ? "#fff" : colors.color,
  };

  const content = (
    <>
      <span aria-hidden className="size-[7px] rounded-full" style={{ background: colors.color }} />
      {badge?.label ?? type}
    </>
  );

  if (href === null) {
    return (
      <span className={CHIP_CLASS} style={style}>
        {content}
      </span>
    );
  }

  return (
    <Link
      href={href}
      scroll={false}
      className={`${CHIP_CLASS} hover:brightness-125`}
      style={style}
    >
      {content}
      {selected && <span className="sr-only">(selected)</span>}
      <PokedexLinkPending />
    </Link>
  );
}
