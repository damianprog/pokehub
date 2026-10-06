"use client";

import { useState } from "react";
import { toast } from "sonner";
import { setFavorite } from "@/actions/favorite";
import { setWishlist } from "@/actions/wishlist";
import { runAction } from "@/lib/run-action";
import { WISHLIST_CAP } from "@/lib/wishlist";
import { usePokedexWishlistCount } from "@/components/pokedex/PokedexWishlistProvider";

// Values from `PokeHub-Pokedex.dc.html`'s card buttons; on/at-capacity colors
// match the detail page's `FavoriteButton`/`WishlistButton`.
const BOOKMARK_PATH = "M2 1.6h11v13.2L7.5 10.6 2 14.8V1.6Z";
const FAVORITE_ON = "#ff5d8f";
const FAVORITE_OFF = "#e8a0c0";
const WISHLIST_ON = "#ffc88a";
const WISHLIST_OFF = "#9aa0ab";
const WISHLIST_AT_CAPACITY = "#4f5662";

const BUTTON =
  "size-[30px] items-center justify-center rounded-[9px] border bg-[rgba(12,14,18,0.62)] backdrop-blur-[6px]";
const SHOWN = "flex";
// Off buttons appear on hover, and whenever focus is inside the card: tabbing
// onto the card's link reveals them, so the next Tab reaches them.
const REVEAL_ON_HOVER = "hidden group-hover/card:flex group-focus-within/card:flex";

interface PokedexCardTogglesProps {
  pokemonId: number;
  slug: string;
  pokemonName: string;
  initialIsFavorite: boolean;
  initialIsWishlist: boolean;
}

/**
 * Desktop-only favorite + wishlist toggles over a Pokédex card's artwork.
 * Flags that are on stay visible as indicators; the rest appear on hover.
 * Optimistic, reverted with a toast on failure.
 */
export function PokedexCardToggles({
  pokemonId,
  slug,
  pokemonName,
  initialIsFavorite,
  initialIsWishlist,
}: PokedexCardTogglesProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isWishlist, setIsWishlist] = useState(initialIsWishlist);
  // A fresh server render (navigation, revalidation) can bring flags changed
  // elsewhere — adopt them, as `PokedexWishlistProvider` does for the count.
  const [serverFlags, setServerFlags] = useState({ initialIsFavorite, initialIsWishlist });
  if (
    initialIsFavorite !== serverFlags.initialIsFavorite ||
    initialIsWishlist !== serverFlags.initialIsWishlist
  ) {
    setServerFlags({ initialIsFavorite, initialIsWishlist });
    setIsFavorite(initialIsFavorite);
    setIsWishlist(initialIsWishlist);
  }
  const { count, setCount } = usePokedexWishlistCount();
  const atCapacity = !isWishlist && count >= WISHLIST_CAP;

  async function toggleFavorite() {
    const next = !isFavorite;
    setIsFavorite(next);
    const result = await runAction(setFavorite({ pokemonId, slug, isFavorite: next }));
    if (!result.success) {
      setIsFavorite(!next);
      toast.error(result.error);
    }
  }

  async function toggleWishlist() {
    if (atCapacity) {
      toast.error(`Your wishlist is full (${WISHLIST_CAP} of ${WISHLIST_CAP}). Remove one to add ${pokemonName}.`);
      return;
    }
    const next = !isWishlist;
    setIsWishlist(next);
    setCount(count + (next ? 1 : -1));
    const result = await runAction(setWishlist({ pokemonId, slug, isWishlist: next }));
    if (!result.success) {
      setIsWishlist(!next);
      setCount(count);
      toast.error(result.error);
    }
  }

  const favoriteLabel = isFavorite ? `Remove ${pokemonName} from favorites` : `Add ${pokemonName} to favorites`;
  const wishlistLabel = isWishlist
    ? `Remove ${pokemonName} from wishlist`
    : atCapacity
      ? "Wishlist full"
      : `Add ${pokemonName} to wishlist`;

  return (
    <div className="absolute top-[19px] right-[19px] z-[1] hidden gap-[5px] md:flex">
      <button
        type="button"
        onClick={toggleFavorite}
        aria-pressed={isFavorite}
        aria-label={favoriteLabel}
        title={favoriteLabel}
        className={`${BUTTON} border-white/[0.14] text-[14px] leading-none ${isFavorite ? SHOWN : REVEAL_ON_HOVER}`}
        style={{ color: isFavorite ? FAVORITE_ON : FAVORITE_OFF }}
      >
        ♥
      </button>
      <button
        type="button"
        onClick={toggleWishlist}
        aria-pressed={isWishlist}
        aria-label={wishlistLabel}
        title={wishlistLabel}
        className={`${BUTTON} ${isWishlist ? SHOWN : REVEAL_ON_HOVER} ${atCapacity ? "cursor-not-allowed" : ""}`}
        style={{
          color: isWishlist ? WISHLIST_ON : atCapacity ? WISHLIST_AT_CAPACITY : WISHLIST_OFF,
          borderColor: isWishlist ? "rgba(255,200,138,0.35)" : atCapacity ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.14)",
        }}
      >
        <svg width="11" height="13" viewBox="0 0 15 17" fill="none" aria-hidden="true">
          <path
            d={BOOKMARK_PATH}
            fill={isWishlist ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
