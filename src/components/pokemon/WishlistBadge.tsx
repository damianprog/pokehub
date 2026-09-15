"use client";

import { useWishlistState } from "@/store/wishlist";

const BOOKMARK_PATH = "M2 1.6h11v13.2L7.5 10.6 2 14.8V1.6Z";

interface WishlistBadgeProps {
  pokemonId: number;
  initialIsWishlist: boolean;
  initialWishlistCount: number;
}

/**
 * Top-right "Wishlisted" pill on the desktop artwork card
 * (`PokemonArtwork`), sourced from `PokeHub-Wishlist.dc.html` §1b. Renders
 * nothing until the Pokémon is wishlisted.
 */
export function WishlistBadge({ pokemonId, initialIsWishlist, initialWishlistCount }: WishlistBadgeProps) {
  const { isWishlist } = useWishlistState(pokemonId, initialIsWishlist, initialWishlistCount);

  if (!isWishlist) return null;

  return (
    <span
      className="absolute top-[16px] right-[16px] inline-flex h-[28px] items-center gap-[7px] rounded-[9px] border px-[11px] text-[12px] font-bold backdrop-blur-[6px]"
      style={{
        background: "rgba(12,14,18,0.62)",
        borderColor: "rgba(255,200,138,0.35)",
        color: "#ffc88a",
      }}
    >
      <svg width="10" height="12" viewBox="0 0 15 17" aria-hidden="true">
        <path d={BOOKMARK_PATH} fill="currentColor" />
      </svg>
      Wishlisted
    </span>
  );
}
