import { TYPE_BADGE_COLORS, FALLBACK_BADGE_COLOR } from "@/lib/type-badge-colors";

interface PokemonHeaderProps {
  id: number;
  name: string;
  types: string[];
}

export function PokemonHeader({ id, name, types }: PokemonHeaderProps) {
  const dexNumber = `#${String(id).padStart(3, "0")}`;

  return (
    <>
      <div className="font-heading text-[14px] leading-[normal] tracking-[0.05em] text-[#7b818c]">
        {dexNumber}
      </div>
      <h1 className="font-heading mt-[2px] mb-[12px] text-[52px] leading-none font-bold tracking-[-0.03em]">
        {name}
      </h1>
      <div className="mb-[18px] flex gap-[8px]">
        {types.map((type) => {
          const meta = TYPE_BADGE_COLORS[type.toLowerCase()];
          const { bg, color } = meta ?? FALLBACK_BADGE_COLOR;
          const label = meta?.label ?? type;

          return (
            <span
              key={type}
              className="inline-flex h-[26px] items-center justify-center rounded-[7px] px-[12px] text-[12px] font-bold tracking-[0.04em] uppercase"
              style={{ background: bg, color }}
            >
              {label}
            </span>
          );
        })}
      </div>
    </>
  );
}
