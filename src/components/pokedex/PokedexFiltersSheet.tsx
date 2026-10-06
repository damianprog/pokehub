"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { countPokedexFilters, pokedexHref, type PokedexFilters } from "@/lib/pokedex-filters";
import {
  FILTERS_BUTTON_CLASS,
  PokedexFiltersButtonContent,
} from "@/components/pokedex/PokedexFiltersButtonContent";
import { PokedexFiltersSheetBody } from "@/components/pokedex/PokedexFiltersSheetBody";

interface PokedexFiltersSheetProps {
  filters: PokedexFilters;
  /** Shows the "My status" section. */
  signedIn: boolean;
  total: number;
  matches: number;
}

/**
 * Mobile Filters button and the bottom sheet it opens. Closing without "Show"
 * (✕, backdrop, Escape) drops the draft, since the body unmounts.
 */
export function PokedexFiltersSheet({ filters, signedIn, total, matches }: PokedexFiltersSheetProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function apply(href: string) {
    setOpen(false);
    if (href === pokedexHref(filters)) return;
    startTransition(() => {
      router.push(href, { scroll: false });
    });
  }

  return (
    // Read by the page's `group-has-[[data-pending]]` to dim the results.
    <div data-pending={isPending || undefined}>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger className={FILTERS_BUTTON_CLASS}>
          <PokedexFiltersButtonContent count={countPokedexFilters(filters)} />
        </SheetTrigger>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          overlayClassName="bg-[rgba(4,5,8,0.66)] supports-backdrop-filter:backdrop-blur-none"
          className="gap-0 rounded-t-[22px] border-white/[0.1] bg-[#15181e] text-[#e8eaed] shadow-[0_-20px_50px_rgba(0,0,0,0.5)] data-[side=bottom]:h-[calc(100dvh-84px)]"
        >
          <div aria-hidden className="flex justify-center pt-[10px] pb-[4px]">
            <div className="h-[4px] w-[38px] rounded-[2px] bg-white/[0.18]" />
          </div>
          <div className="flex items-center border-b border-white/[0.06] px-[18px] pt-[6px] pb-[12px]">
            <SheetTitle className="flex-1 text-[18px] font-bold text-[#e8eaed]">Filters</SheetTitle>
            <SheetClose
              aria-label="Close filters"
              className="flex size-[36px] items-center justify-center rounded-[10px] bg-white/[0.06] text-[#9aa0ab]"
            >
              <X aria-hidden className="size-[15px]" strokeWidth={2.4} />
            </SheetClose>
          </div>
          <PokedexFiltersSheetBody
            filters={filters}
            signedIn={signedIn}
            total={total}
            matches={matches}
            onApply={apply}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
