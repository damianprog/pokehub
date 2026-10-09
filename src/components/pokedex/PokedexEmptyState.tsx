import Link from "next/link";
import Image from "next/image";

const SLOWPOKE_ARTWORK =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/79.png";

interface PokedexEmptyStateProps {
  search: string;
  /** A type or generation filter is active — switches to the filter wording. */
  filtered: boolean;
}

/** Shown in place of the grid when the search and/or filters match nothing. */
export function PokedexEmptyState({ search, filtered }: PokedexEmptyStateProps) {
  const text = filtered
    ? {
        heading: "No Pokémon match these filters",
        help: "Try removing a filter, or search by name or dex number instead.",
        action: "Clear all",
      }
    : {
        heading: `No Pokémon match “${search}”`,
        help: "Check the spelling, or try a dex number like 25 or #025.",
        action: "Clear search",
      };

  return (
    <div className="rounded-[14px] border border-dashed border-white/[0.1] bg-[#13161b] px-[20px] py-[40px] text-center md:rounded-[16px] md:px-[24px] md:py-[72px]">
      <Image
        src={SLOWPOKE_ARTWORK}
        alt=""
        width={120}
        height={120}
        className="mx-auto -mt-[14px] mb-[6px] block size-[96px] object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.45)] md:-mt-[30px] md:mb-[8px] md:size-[120px]"
      />
      <h2 className="font-heading m-0 text-[16px] font-bold tracking-[-0.01em] break-words md:text-[19px]">
        {text.heading}
      </h2>
      <p className="mx-auto mt-[8px] mb-[18px] max-w-[400px] text-[13px] leading-[1.6] text-pretty text-[#8b919e] md:mb-[20px] md:text-[13.5px]">
        {text.help}
      </p>
      <Link
        href="/pokedex"
        className="font-heading inline-flex h-[44px] w-full items-center justify-center rounded-[11px] bg-[linear-gradient(135deg,var(--brand-from),var(--brand-to))] px-[22px] text-[14px] font-bold text-brand-ink md:h-[42px] md:w-auto md:shadow-[0_8px_24px_rgba(63,217,138,0.28)]"
      >
        {text.action}
      </Link>
    </div>
  );
}
