import type { BaseStats as BaseStatsData } from "@/types/pokemon";
import { STAT_DEFS } from "@/lib/stat-colors";

interface BaseStatsProps {
  stats: BaseStatsData;
}

const STAT_SCALE_MAX = 255;

export function BaseStats({ stats }: BaseStatsProps) {
  return (
    <div className="mb-[26px] rounded-[16px] border border-white/[0.06] bg-[#15181e] p-[20px] leading-[normal]">
      <div className="font-heading mb-[16px] text-[12px] font-semibold tracking-[0.06em] text-[#7b818c] uppercase">
        Base Stats
      </div>
      {STAT_DEFS.map(({ key, label, color }) => {
        const value = stats[key];
        const barWidthPct = Math.min(
          100,
          Math.max(0, Math.round((value / STAT_SCALE_MAX) * 100)),
        );

        return (
          <div key={key} className="mb-[8px] flex items-center gap-[10px]">
            <span className="w-[54px] flex-none text-right text-[11.5px] text-[#7b818c]">
              {label}
            </span>
            <div className="h-[7px] flex-1 rounded-[4px] bg-white/[0.05]">
              <div
                className="h-[7px] rounded-[4px]"
                style={{ width: `${barWidthPct}%`, background: color }}
              />
            </div>
            <span className="font-heading w-[26px] flex-none text-right text-[12px] font-bold text-[#cdd2da]">
              {value}
            </span>
          </div>
        );
      })}
    </div>
  );
}
