"use client";

import { useState, useTransition } from "react";
import {
  hasPokedexFilters,
  POKEDEX_GENERATIONS,
  POKEDEX_RARITIES,
  POKEDEX_STATUSES,
  POKEDEX_TYPES,
  pokedexHref,
  pokedexQuery,
  resetPokedexFilters,
  toggleType,
  type PokedexFilters,
} from "@/lib/pokedex-filters";
import { countPokedexMatches } from "@/actions/pokedex";
import { runAction } from "@/lib/run-action";
import { PokedexSheetTypeChip } from "@/components/pokedex/PokedexSheetTypeChip";
import { PokedexSheetOptionGrid } from "@/components/pokedex/PokedexSheetOptionGrid";

interface PokedexFiltersSheetBodyProps {
  /** The page's current filters — the draft starts from them. */
  filters: PokedexFilters;
  signedIn: boolean;
  total: number;
  /** The page's match count for `filters`, so opening the sheet needs no count call. */
  matches: number;
  /** Navigates to the draft's URL (or just closes, when it's the current one). */
  onApply: (href: string) => void;
}

const GENERATION_OPTIONS = [
  { key: "all", label: "All", ariaLabel: "All generations" },
  ...POKEDEX_GENERATIONS.map(({ gen, region }) => ({
    key: String(gen),
    label: String(gen),
    ariaLabel: `Generation ${gen}, ${region}`,
  })),
];

const RARITY_OPTIONS = [
  { key: "all", label: "All", ariaLabel: "All rarities" },
  ...POKEDEX_RARITIES.map(({ key, label, sub }) => ({ key, label, sub })),
];

const STATUS_OPTIONS = [
  { key: "all", label: "All", ariaLabel: "Any status" },
  ...POKEDEX_STATUSES.map(({ key, label }) => ({ key, label })),
];

function showLabel(draft: PokedexFilters, count: number | null, total: number): string {
  if (!hasPokedexFilters(draft) && !draft.search) return `Show all ${total.toLocaleString("en-US")}`;
  if (count === null) return "Show Pokémon";
  return `Show ${count.toLocaleString("en-US")} Pokémon`;
}

/**
 * The filters sheet's scrolling sections and pinned footer. Mounted only while
 * the sheet is open, so every opening starts a fresh draft from the URL.
 * Taps edit the draft; "Show" applies it all at once.
 */
export function PokedexFiltersSheetBody({ filters, signedIn, total, matches, onApply }: PokedexFiltersSheetBodyProps) {
  const [draft, setDraft] = useState(filters);
  const [count, setCount] = useState<number | null>(matches);
  const [isCounting, startCounting] = useTransition();

  // Actions run one at a time, so the last result to land is for the last draft.
  function change(next: PokedexFilters) {
    setDraft(next);
    startCounting(async () => {
      const result = await runAction(countPokedexMatches(pokedexQuery(next)));
      setCount(result.success ? result.data : null);
    });
  }

  return (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto px-[18px] py-[16px]">
        <div className="font-heading mb-[10px] text-[11.5px] font-semibold tracking-[0.06em] text-[#7b818c] uppercase">
          Type
        </div>
        <div className="mb-[22px] flex flex-wrap gap-[7px]">
          {POKEDEX_TYPES.map((type) => (
            <PokedexSheetTypeChip
              key={type}
              type={type}
              selected={draft.types.includes(type)}
              onToggle={() => change(toggleType(draft, type))}
            />
          ))}
        </div>

        <PokedexSheetOptionGrid
          label="Generation"
          columns={5}
          options={GENERATION_OPTIONS}
          value={draft.gen === null ? "all" : String(draft.gen)}
          onChange={(key) => change({ ...draft, gen: key === "all" ? null : Number(key) })}
        />
        <PokedexSheetOptionGrid
          label="Rarity"
          columns={2}
          options={RARITY_OPTIONS}
          value={draft.rarity?.key ?? "all"}
          onChange={(key) =>
            change({ ...draft, rarity: POKEDEX_RARITIES.find((rarity) => rarity.key === key) ?? null })
          }
        />
        {signedIn && (
          <PokedexSheetOptionGrid
            label="My status"
            columns={2}
            options={STATUS_OPTIONS}
            value={draft.status?.key ?? "all"}
            onChange={(key) =>
              change({ ...draft, status: POKEDEX_STATUSES.find((status) => status.key === key) ?? null })
            }
          />
        )}
      </div>

      <div className="flex gap-[10px] border-t border-white/[0.07] px-[18px] pt-[12px] pb-[calc(22px+env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={() => hasPokedexFilters(draft) && change(resetPokedexFilters(draft))}
          className="flex h-[48px] flex-none items-center rounded-[12px] border border-white/[0.1] bg-white/[0.05] px-[18px] text-[14px] font-semibold text-[#cdd2da]"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={() => onApply(pokedexHref(draft))}
          className={`font-heading flex h-[48px] flex-1 items-center justify-center rounded-[12px] bg-[linear-gradient(135deg,var(--brand-from),var(--brand-to))] text-[15px] font-bold text-brand-ink shadow-[0_8px_24px_rgba(63,217,138,0.3)] transition-opacity ${
            isCounting ? "opacity-75" : ""
          }`}
        >
          <span aria-live="polite">{showLabel(draft, count, total)}</span>
        </button>
      </div>
    </>
  );
}
