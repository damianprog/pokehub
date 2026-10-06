"use client";

import { useId } from "react";
import { RadioGroup } from "@base-ui/react/radio-group";
import { Radio } from "@base-ui/react/radio";

export interface PokedexSheetOption {
  key: string;
  label: string;
  /** Muted second line under the label. */
  sub?: string | null;
  /** Accessible name when the visible label is too terse ("1" → "Generation 1, Kanto"). */
  ariaLabel?: string;
}

interface PokedexSheetOptionGridProps {
  label: string;
  columns: 2 | 5;
  options: PokedexSheetOption[];
  /** The selected option's key. */
  value: string;
  onChange: (key: string) => void;
}

/** One single-choice section of the mobile filters sheet (Generation, Rarity, My status), as a radio group. */
export function PokedexSheetOptionGrid({ label, columns, options, value, onChange }: PokedexSheetOptionGridProps) {
  const labelId = useId();

  return (
    <div className="mb-[22px]">
      <div
        id={labelId}
        className="font-heading mb-[10px] text-[11.5px] font-semibold tracking-[0.06em] text-[#7b818c] uppercase"
      >
        {label}
      </div>
      <RadioGroup
        value={value}
        onValueChange={(key) => onChange(String(key))}
        aria-labelledby={labelId}
        className={`grid gap-[7px] ${columns === 5 ? "grid-cols-5" : "grid-cols-2"}`}
      >
        {options.map((option) => (
          <Radio.Root
            key={option.key}
            value={option.key}
            aria-label={option.ariaLabel}
            className="flex min-h-[44px] cursor-pointer flex-col items-center justify-center gap-[2px] rounded-[10px] border border-white/[0.08] bg-white/[0.04] px-[8px] py-[6px] text-center text-[13px] font-bold text-[#cdd2da] select-none data-checked:border-[rgba(63,217,138,0.55)] data-checked:bg-[rgba(63,217,138,0.16)] data-checked:text-white"
          >
            {option.label}
            {option.sub && (
              <span className="text-[10.5px] leading-[1.3] font-medium text-[#7b818c]">{option.sub}</span>
            )}
          </Radio.Root>
        ))}
      </RadioGroup>
    </div>
  );
}
