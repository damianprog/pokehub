"use client";

import { useAuthModal } from "@/store/auth-modal";
import { useReviewComposer } from "@/store/review-composer";
import { FavoriteButton } from "@/components/pokemon/FavoriteButton";
import { WishlistButton } from "@/components/pokemon/WishlistButton";
import { WishlistCountFooter } from "@/components/pokemon/WishlistCountFooter";
import { WishlistCapacityNotice } from "@/components/pokemon/WishlistCapacityNotice";

interface PokemonActionsProps {
  pokemonId: number;
  slug: string;
  pokemonName: string;
  isAuthenticated: boolean;
  initialIsFavorite: boolean;
  initialIsWishlist: boolean;
  initialWishlistCount: number;
}

export function PokemonActions({
  pokemonId,
  slug,
  pokemonName,
  isAuthenticated,
  initialIsFavorite,
  initialIsWishlist,
  initialWishlistCount,
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
    <div className="mt-[14px]">
      <div className="flex gap-[10px]">
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
        <WishlistButton
          pokemonId={pokemonId}
          slug={slug}
          pokemonName={pokemonName}
          isAuthenticated={isAuthenticated}
          initialIsWishlist={initialIsWishlist}
          initialWishlistCount={initialWishlistCount}
          className="relative flex h-[42px] w-[46px] items-center justify-center rounded-[11px] border border-white/10 bg-white/[0.06]"
          capacityBadgeClassName="absolute -top-[3px] -right-[3px] flex h-[16px] min-w-[16px] items-center justify-center rounded-[5px] border border-white/[0.12] bg-[#22262e] px-[4px] font-['Space_Grotesk'] text-[9.5px] font-extrabold text-[#9aa0ab]"
        />
        <button
          type="button"
          aria-label="Add to list"
          className="h-[42px] w-[46px] rounded-[11px] border border-white/10 bg-white/[0.06] text-[#9aa0ab]"
        >
          +
        </button>
      </div>
      <WishlistCountFooter
        pokemonId={pokemonId}
        initialIsWishlist={initialIsWishlist}
        initialWishlistCount={initialWishlistCount}
      />
      <WishlistCapacityNotice pokemonName={pokemonName} />
    </div>
  );
}
