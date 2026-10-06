import { TYPE_BADGE_COLORS, FALLBACK_BADGE_COLOR } from "@/lib/type-badge-colors";

interface PokedexSheetTypeChipProps {
  type: string;
  selected: boolean;
  onToggle: () => void;
}

/** One toggleable type in the mobile filters sheet. Same colors as the desktop panel's `PokedexTypeChip`, but a button that edits the draft. */
export function PokedexSheetTypeChip({ type, selected, onToggle }: PokedexSheetTypeChipProps) {
  const badge = TYPE_BADGE_COLORS[type];
  const colors = badge ?? FALLBACK_BADGE_COLOR;

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onToggle}
      className="inline-flex h-[34px] items-center gap-[6px] rounded-[9px] border px-[11px] text-[11px] font-bold tracking-[0.04em] uppercase select-none"
      style={{
        // Selected: the badge fill at double strength, a border in the type's color.
        background: selected ? colors.bg.replace("0.18)", "0.38)") : colors.bg,
        borderColor: selected ? colors.color : "transparent",
        color: selected ? "#fff" : colors.color,
      }}
    >
      <span aria-hidden className="size-[7px] rounded-full" style={{ background: colors.color }} />
      {badge?.label ?? type}
    </button>
  );
}
