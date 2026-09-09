"use client";

import { useAuthModal } from "@/store/auth-modal";
import { useReviewComposer } from "@/store/review-composer";

interface TopReviewsEmptyStateProps {
  pokemonName: string;
  isAuthenticated: boolean;
}

/**
 * "Top Reviews · none yet" — the common case today, since most Pokémon have
 * zero written reviews. "Write review" opens the same composer every other
 * entry point on this page already opens (see
 * rating-review/rating-05-top-reviews-real-aggregation-spec.md §8).
 */
export function TopReviewsEmptyState({ pokemonName, isAuthenticated }: TopReviewsEmptyStateProps) {
  const { open: openAuthModal } = useAuthModal();
  const { open: openComposer } = useReviewComposer();

  function handleWriteReview() {
    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }
    openComposer();
  }

  return (
    <div className="rounded-[14px] border border-dashed border-white/10 bg-[#13161b] px-[24px] py-[34px] text-center">
      <div className="mb-[12px] text-[26px] opacity-80">✎</div>
      <div className="font-heading text-[18px] font-bold">Be the first to review {pokemonName}</div>
      <p className="mx-auto mt-[8px] mb-[18px] max-w-[380px] text-[13.5px] leading-[1.6] text-[#8b919e]">
        Nobody&apos;s written about {pokemonName} yet — yours will be the first thing shown here.
      </p>
      <button
        type="button"
        onClick={handleWriteReview}
        className="h-[40px] rounded-[11px] bg-[linear-gradient(135deg,var(--brand-from),var(--brand-to))] px-[20px] text-[14px] font-bold text-white"
      >
        Write review
      </button>
    </div>
  );
}
