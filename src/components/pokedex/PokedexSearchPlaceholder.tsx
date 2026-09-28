import { Search } from "lucide-react";

/** Inert, same-size stand-in for `PokedexSearch` in the loading skeleton, so the header doesn't shift. */
export function PokedexSearchPlaceholder() {
  return (
    <div
      aria-hidden
      className="flex h-[44px] min-w-0 flex-1 items-center gap-[8px] rounded-[12px] border border-white/[0.09] bg-white/[0.05] px-[13px] md:w-[360px] md:flex-none md:gap-[9px] md:px-[14px]"
    >
      <Search className="size-[16px] flex-none text-[#7b818c] md:size-[17px]" strokeWidth={2.2} />
      <span className="truncate text-[14px] text-[#646b78]">
        <span className="md:hidden">Name or dex number</span>
        <span className="hidden md:inline">Search by name or dex number</span>
      </span>
    </div>
  );
}
