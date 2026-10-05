"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface PokedexRefineOption {
  label: string;
  /** Muted second line under the label. */
  sub?: string | null;
  /** The Pokédex URL with this option applied — also the option's radio value. */
  href: string;
  selected: boolean;
}

interface PokedexRefineMenuProps {
  /** Muted trigger label, e.g. "Generation". The compact trigger omits it visually but keeps it for screen readers. */
  label: string;
  /** The current choice as shown in the trigger, e.g. "All" or "Gen 4". */
  value: string;
  /** Tinted trigger when a non-default option is selected. */
  active: boolean;
  options: PokedexRefineOption[];
  /** Which trigger edge the dropdown lines up with. */
  align?: "start" | "end";
  /** A narrower dropdown, for options without sub-lines (Sort). */
  narrow?: boolean;
  /** Mobile look: value-only trigger and taller, touch-sized rows. */
  compact?: boolean;
  /** Inert, for the loading skeleton. */
  disabled?: boolean;
}

function triggerClassName(active: boolean, compact: boolean) {
  const shape = compact
    ? "h-[40px] gap-[7px] rounded-[11px] px-[12px] text-[13px] font-bold"
    : "h-[38px] gap-[8px] rounded-[10px] px-[13px] text-[13.5px]";
  const tint = active
    ? "border-[rgba(63,217,138,0.4)] bg-[rgba(63,217,138,0.1)]"
    : `${compact ? "border-white/[0.1]" : "border-white/[0.08]"} bg-white/[0.05] hover:bg-white/[0.08]`;
  return `inline-flex items-center border whitespace-nowrap select-none ${shape} ${tint}`;
}

function contentWidthClassName(narrow: boolean, compact: boolean) {
  if (compact) return "min-w-[190px]";
  return narrow ? "min-w-[200px]" : "max-w-[300px] min-w-[260px]";
}

/**
 * One single-select dropdown on the Pokédex (Generation, Rarity, Sort).
 * Picking an option pushes a history entry, like the type chips' links.
 * Options are radio items, so the selected one is announced as checked.
 */
export function PokedexRefineMenu({
  label,
  value,
  active,
  options,
  align = "start",
  narrow = false,
  compact = false,
  disabled = false,
}: PokedexRefineMenuProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const selectedHref = options.find((option) => option.selected)?.href;

  function pick(href: string) {
    if (href === selectedHref) return;
    startTransition(() => {
      router.push(href, { scroll: false });
    });
  }

  return (
    // Read by the page's `group-has-[[data-pending]]` to dim the results.
    <div data-pending={isPending || undefined}>
      <DropdownMenu>
        <DropdownMenuTrigger
          disabled={disabled}
          aria-label={compact ? `${label}: ${value}` : undefined}
          className={triggerClassName(active, compact)}
        >
          {!compact && <span className="font-semibold text-[#8b919e]">{label}</span>}
          <span className="font-bold text-[#e8eaed]">{value}</span>
          <span aria-hidden className="text-[10px] text-[#646b78]">
            ▾
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align={align}
          sideOffset={6}
          className={`w-auto rounded-[12px] border border-white/[0.1] bg-[#1b1f26] p-[6px] shadow-[0_18px_44px_rgba(0,0,0,0.55)] ring-0 ${contentWidthClassName(narrow, compact)}`}
        >
          <DropdownMenuRadioGroup value={selectedHref} onValueChange={pick}>
            {options.map((option) => (
              <DropdownMenuRadioItem
                key={option.label}
                value={option.href}
                closeOnClick
                // The built-in check indicator, restyled to the design's check mark.
                className={`cursor-pointer gap-[10px] rounded-[8px] py-[7px] pr-[34px] pl-[10px] focus:bg-white/[0.07] [&_svg]:!size-[14px] [&_svg]:stroke-[3] [&_svg]:text-brand-link-hover [&>[data-slot=dropdown-menu-radio-item-indicator]]:right-[10px] ${
                  compact ? "min-h-[44px] text-[14px]" : "min-h-[36px] text-[13.5px]"
                } ${option.selected ? "bg-white/[0.05] text-white" : "text-[#cdd2da]"}`}
              >
                <span className="flex flex-1 flex-col gap-[2px]">
                  <span className="whitespace-nowrap">{option.label}</span>
                  {option.sub && (
                    <span className="text-[11.5px] leading-[1.35] text-[#7b818c]">{option.sub}</span>
                  )}
                </span>
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
