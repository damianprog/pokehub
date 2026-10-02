import Link from "next/link";
import { X } from "lucide-react";
import { PokedexLinkPending } from "@/components/pokedex/PokedexLinkPending";

interface PokedexFilterChipProps {
  label: string;
  color: string;
  /** The current URL with just this filter removed. */
  removeHref: string;
}

/** One active filter in the row above the grid, removable with its ✕. */
export function PokedexFilterChip({ label, color, removeHref }: PokedexFilterChipProps) {
  return (
    <span
      className="inline-flex h-[30px] flex-none items-center gap-[6px] rounded-[8px] border border-white/[0.1] bg-white/[0.06] pr-[5px] pl-[11px] text-[12.5px] font-semibold md:gap-[8px] md:pr-[6px] md:pl-[12px] md:text-[13px]"
      style={{ color }}
    >
      {label}
      <Link
        href={removeHref}
        scroll={false}
        aria-label={`Remove filter: ${label}`}
        className="flex size-[20px] items-center justify-center rounded-[6px] text-[#9aa0ab] hover:bg-white/[0.1] hover:text-[#e8eaed]"
      >
        <X aria-hidden className="size-[12px]" strokeWidth={2.6} />
        <PokedexLinkPending />
      </Link>
    </span>
  );
}
