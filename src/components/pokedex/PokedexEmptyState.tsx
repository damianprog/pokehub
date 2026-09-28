import Link from "next/link";
import { Search } from "lucide-react";

interface PokedexEmptyStateProps {
  search: string;
}

/** Shown in place of the grid when a search matches nothing. */
export function PokedexEmptyState({ search }: PokedexEmptyStateProps) {
  return (
    <div className="rounded-[14px] border border-dashed border-white/[0.1] bg-[#13161b] px-[20px] py-[40px] text-center md:rounded-[16px] md:px-[24px] md:py-[72px]">
      <Search
        aria-hidden
        className="mx-auto mb-[10px] size-[26px] text-[#7b818c] md:mb-[12px] md:size-[30px]"
        strokeWidth={2}
      />
      <h2 className="font-heading m-0 text-[16px] font-bold tracking-[-0.01em] break-words md:text-[19px]">
        No Pokémon match “{search}”
      </h2>
      <p className="mx-auto mt-[8px] mb-[18px] max-w-[400px] text-[13px] leading-[1.6] text-pretty text-[#8b919e] md:mb-[20px] md:text-[13.5px]">
        Check the spelling, or try a dex number like 25 or #025.
      </p>
      <Link
        href="/pokedex"
        className="font-heading inline-flex h-[44px] w-full items-center justify-center rounded-[11px] bg-[linear-gradient(135deg,var(--brand-from),var(--brand-to))] px-[22px] text-[14px] font-bold text-white md:h-[42px] md:w-auto md:shadow-[0_8px_24px_rgba(196,79,224,0.28)]"
      >
        Clear search
      </Link>
    </div>
  );
}
