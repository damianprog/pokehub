"use client";

import { useWishlistState } from "@/store/wishlist";
import { WISHLIST_CAP } from "@/lib/wishlist";

const BOOKMARK_PATH = "M2 1.6h11v13.2L7.5 10.6 2 14.8V1.6Z";

interface WishlistCountFooterProps {
  pokemonId: number;
  initialIsWishlist: boolean;
  initialWishlistCount: number;
}

/**
 * "N of 3 wishlisted" line under the desktop action row, sourced from
 * `PokeHub-Wishlist.dc.html` §1b. The design pairs this with a "Manage"
 * link into `/settings/wishlist`; omitted per
 * favorite-wishlist-02-wishlist-toggle-spec.md §7 since that page doesn't
 * exist yet. Renders nothing until the Pokémon is wishlisted.
 */
export function WishlistCountFooter({
  pokemonId,
  initialIsWishlist,
  initialWishlistCount,
}: WishlistCountFooterProps) {
  const { isWishlist, count } = useWishlistState(pokemonId, initialIsWishlist, initialWishlistCount);

  if (!isWishlist) return null;

  return (
    <div className="flex items-center gap-[8px] px-[2px] pt-[2px] text-[12.5px] text-[#7b818c]">
      <svg width="10" height="12" viewBox="0 0 15 17" style={{ color: "#ffc88a" }} aria-hidden="true">
        <path d={BOOKMARK_PATH} fill="currentColor" />
      </svg>
      <span>
        <span className="font-bold text-[#e8eaed]">
          {count} of {WISHLIST_CAP}
        </span>{" "}
        wishlisted
      </span>
    </div>
  );
}
