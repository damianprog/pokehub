import { TYPE_BADGE_COLORS, FALLBACK_BADGE_COLOR } from "@/lib/type-badge-colors";

interface FavoriteTypesProps {
  types: { type: string; percentage: number }[];
  avgRating: number;
  collectionCaught: number;
  collectionTotal: number;
}

export function FavoriteTypes({
  types,
  avgRating,
  collectionCaught,
  collectionTotal,
}: FavoriteTypesProps) {
  return (
    <div className="rounded-[14px] border border-white/[0.06] bg-[#15181e] p-[18px]">
      <div className="font-heading mb-[14px] text-[12px] font-semibold tracking-[0.06em] text-[#7b818c] uppercase">
        Favorite types
      </div>
      <div className="flex flex-col gap-[11px]">
        {types.map(({ type, percentage }) => {
          const meta = TYPE_BADGE_COLORS[type];
          const { color } = meta ?? FALLBACK_BADGE_COLOR;
          const label = meta?.label ?? type;

          return (
            <div key={type}>
              <div className="mb-[5px] flex justify-between text-[12.5px]">
                <span className="font-semibold" style={{ color }}>
                  {label}
                </span>
                <span className="text-[#7b818c]">{percentage}%</span>
              </div>
              <div className="h-[6px] rounded-[4px] bg-white/[0.06]">
                <div
                  className="h-[6px] rounded-[4px]"
                  style={{ width: `${percentage}%`, background: color }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-[16px] border-t border-white/[0.06] pt-[14px] text-[13px] leading-[1.8] text-[#9aa0ab]">
        <span className="font-bold text-foreground">Avg. rating</span> · {avgRating}
        <br />
        <span className="font-bold text-foreground">Collection</span> ·{" "}
        {collectionCaught.toLocaleString()} / {collectionTotal.toLocaleString()}
      </div>
    </div>
  );
}
