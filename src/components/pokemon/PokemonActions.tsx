"use client";

import { useAuthModal } from "@/store/auth-modal";
import { useReviewComposer } from "@/store/review-composer";
import { FavoriteButton } from "@/components/pokemon/FavoriteButton";

interface PokemonActionsProps {
  pokemonId: number;
  slug: string;
  pokemonName: string;
  isAuthenticated: boolean;
  initialIsFavorite: boolean;
}

export function PokemonActions({
  pokemonId,
  slug,
  pokemonName,
  isAuthenticated,
  initialIsFavorite,
}: PokemonActionsProps) {
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
    <div className="mt-[14px] flex gap-[10px]">
      <button
        type="button"
        onClick={handleWriteReview}
        className="h-[42px] flex-1 rounded-[11px] bg-[linear-gradient(135deg,var(--brand-from),var(--brand-to))] text-[14px] font-bold text-white"
      >
        Write review
      </button>
      <FavoriteButton
        pokemonId={pokemonId}
        slug={slug}
        pokemonName={pokemonName}
        isAuthenticated={isAuthenticated}
        initialIsFavorite={initialIsFavorite}
        className="h-[42px] w-[46px] rounded-[11px] border border-white/10 bg-white/[0.06]"
      />
      <button
        type="button"
        aria-label="Add to list"
        className="h-[42px] w-[46px] rounded-[11px] border border-white/10 bg-white/[0.06] text-[#9aa0ab]"
      >
        +
      </button>
    </div>
  );
}
