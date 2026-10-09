import Image from "next/image";
import { WriteReviewButton } from "@/components/pokemon/WriteReviewButton";

interface TopReviewsEmptyStateProps {
  pokemonName: string;
  artworkUrl: string;
  isAuthenticated: boolean;
}

/**
 * "Top Reviews · none yet" — the common case today, since most Pokémon have
 * zero written reviews. "Write review" opens the same composer every other
 * entry point on this page already opens (see
 * rating-review/rating-05-top-reviews-real-aggregation-spec.md §8).
 */
export function TopReviewsEmptyState({
  pokemonName,
  artworkUrl,
  isAuthenticated,
}: TopReviewsEmptyStateProps) {
  return (
    <div className="rounded-[14px] border border-dashed border-white/10 bg-[#13161b] px-[24px] py-[34px] text-center">
      <Image
        src={artworkUrl}
        alt=""
        width={104}
        height={104}
        className="mx-auto -mt-[8px] mb-[6px] block size-[88px] object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.45)] md:-mt-[10px] md:mb-[8px] md:size-[104px]"
      />
      <div className="font-heading text-[18px] font-bold">Be the first to review {pokemonName}</div>
      <p className="mx-auto mt-[8px] mb-[18px] max-w-[380px] text-[13.5px] leading-[1.6] text-[#8b919e]">
        Nobody&apos;s written about {pokemonName} yet — yours will be the first thing shown here.
      </p>
      <WriteReviewButton
        isAuthenticated={isAuthenticated}
        className="h-[40px] rounded-[11px] px-[20px] text-[14px]"
      />
    </div>
  );
}
