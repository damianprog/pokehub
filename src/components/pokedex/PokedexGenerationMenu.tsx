"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { POKEDEX_GENERATIONS, pokedexHref, type PokedexFilters } from "@/lib/pokedex-filters";

interface PokedexGenerationMenuProps {
  filters: PokedexFilters;
  /** Inert, for the loading skeleton. */
  disabled?: boolean;
}

const OPTIONS = [
  { gen: null, label: "All generations", region: null },
  ...POKEDEX_GENERATIONS.map(({ gen, region }) => ({ gen, label: `Gen ${gen}`, region })),
];

/** The Refine row's Generation dropdown. Picking an option pushes a history entry, like the type chips' links. */
export function PokedexGenerationMenu({ filters, disabled = false }: PokedexGenerationMenuProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const active = filters.gen !== null;

  function pick(gen: number | null) {
    if (gen === filters.gen) return;
    startTransition(() => {
      router.push(pokedexHref({ ...filters, gen }), { scroll: false });
    });
  }

  return (
    // Read by the page's `group-has-[[data-pending]]` to dim the results.
    <div data-pending={isPending || undefined}>
      <DropdownMenu>
        <DropdownMenuTrigger
          disabled={disabled}
          className={`inline-flex h-[38px] items-center gap-[8px] rounded-[10px] border px-[13px] text-[13.5px] whitespace-nowrap select-none ${
            active
              ? "border-[rgba(196,79,224,0.4)] bg-[rgba(196,79,224,0.1)]"
              : "border-white/[0.08] bg-white/[0.05] hover:bg-white/[0.08]"
          }`}
        >
          <span className="font-semibold text-[#8b919e]">Generation</span>
          <span className="font-bold text-[#e8eaed]">{active ? `Gen ${filters.gen}` : "All"}</span>
          <span aria-hidden className="text-[10px] text-[#646b78]">
            ▾
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          sideOffset={6}
          className="w-auto max-w-[300px] min-w-[260px] rounded-[12px] border border-white/[0.1] bg-[#1b1f26] p-[6px] shadow-[0_18px_44px_rgba(0,0,0,0.55)] ring-0"
        >
          {OPTIONS.map((option) => {
            const selected = option.gen === filters.gen;
            return (
              <DropdownMenuItem
                key={option.label}
                onClick={() => pick(option.gen)}
                className={`min-h-[36px] gap-[10px] rounded-[8px] px-[10px] py-[7px] text-[13.5px] focus:bg-white/[0.07] ${
                  selected ? "bg-white/[0.05] text-white" : "text-[#cdd2da]"
                }`}
              >
                <span className="flex flex-1 flex-col gap-[2px]">
                  <span className="whitespace-nowrap">{option.label}</span>
                  {option.region && (
                    <span className="text-[11.5px] leading-[1.35] text-[#7b818c]">{option.region}</span>
                  )}
                </span>
                <span className="flex w-[14px] justify-center">
                  {selected && <Check aria-label="Selected" className="size-[14px] text-[#d88ef0]" strokeWidth={3} />}
                </span>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
