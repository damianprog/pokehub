import { toStars } from "@/lib/rating";

interface PokedexCardYouRatedProps {
  /** The viewer's rating in half-star units. */
  rating: number;
}

/** The viewer's own rating under a card's community rating. */
export function PokedexCardYouRated({ rating }: PokedexCardYouRatedProps) {
  return (
    <div className="mt-[8px] flex items-center gap-[5px] border-t border-white/[0.06] pt-[8px] text-[11px] font-semibold text-brand-link-hover md:mt-[9px] md:gap-[6px] md:pt-[9px] md:text-[11.5px]">
      <span className="size-[5px] rounded-full bg-brand-to md:size-[6px]" />
      You rated
      <span className="font-heading font-bold">★ {toStars(rating).toFixed(1)}</span>
    </div>
  );
}
