"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { setWishlist } from "@/actions/wishlist";
import { useAuthModal } from "@/store/auth-modal";
import { useWishlistStore, useWishlistState } from "@/store/wishlist";
import { WISHLIST_CAP } from "@/lib/wishlist";

// Sourced from `PokeHub-Wishlist.dc.html` §1-2 — outline bookmark when not
// wishlisted, filled when wishlisted. Same path/viewBox on both surfaces;
// only the shell color/background differs (passed in via `className`).
const BOOKMARK_PATH = "M2 1.6h11v13.2L7.5 10.6 2 14.8V1.6Z";

const NOT_WISHLISTED_COLOR = "#9aa0ab";
const WISHLISTED_COLOR = "#ffc88a";
const AT_CAPACITY_COLOR = "#4f5662";

// `borderWidth`/`borderStyle` are set explicitly (not just `borderColor`) so
// these states render a real border on mobile too, where the button's base
// className has no `border` utility (the design's not-wishlisted mobile
// circle is borderless — only the active states below add one).
const WISHLISTED_STYLE = {
  color: WISHLISTED_COLOR,
  background: "rgba(255,200,138,0.12)",
  borderWidth: "1px",
  borderStyle: "solid" as const,
  borderColor: "rgba(255,200,138,0.35)",
};
const AT_CAPACITY_STYLE = {
  color: AT_CAPACITY_COLOR,
  background: "rgba(255,255,255,0.03)",
  borderWidth: "1px",
  borderStyle: "solid" as const,
  borderColor: "rgba(255,255,255,0.06)",
  cursor: "not-allowed" as const,
};

interface WishlistButtonProps {
  pokemonId: number;
  slug: string;
  pokemonName: string;
  isAuthenticated: boolean;
  initialIsWishlist: boolean;
  initialWishlistCount: number;
  className?: string;
  /** Not-wishlisted glyph color — differs by surface in the design source (desktop `#9aa0ab`, mobile `#cdd2da`). */
  notWishlistedColor?: string;
  /** Position/size of the small "3" at-capacity count badge; omit to render no badge. */
  capacityBadgeClassName?: string;
}

export function WishlistButton({
  pokemonId,
  slug,
  pokemonName,
  isAuthenticated,
  initialIsWishlist,
  initialWishlistCount,
  className,
  notWishlistedColor = NOT_WISHLISTED_COLOR,
  capacityBadgeClassName,
}: WishlistButtonProps) {
  const { open: openAuthModal } = useAuthModal();
  const { hydrate, setWishlist: setStoreWishlist, openCapacityNotice } = useWishlistStore();
  const { isWishlist: currentIsWishlist, count: currentCount } = useWishlistState(
    pokemonId,
    initialIsWishlist,
    initialWishlistCount,
  );

  useEffect(() => {
    hydrate(pokemonId, initialIsWishlist, initialWishlistCount);
  }, [pokemonId, initialIsWishlist, initialWishlistCount, hydrate]);

  const atCapacity = !currentIsWishlist && currentCount >= WISHLIST_CAP;

  async function handleClick() {
    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }

    if (atCapacity) {
      openCapacityNotice();
      return;
    }

    const nextIsWishlist = !currentIsWishlist;
    const nextCount = currentCount + (nextIsWishlist ? 1 : -1);
    setStoreWishlist(nextIsWishlist, nextCount);

    const result = await setWishlist({ pokemonId, slug, isWishlist: nextIsWishlist });
    if (result.success) {
      toast.success(
        nextIsWishlist ? `Added ${pokemonName} to your wishlist.` : `Removed ${pokemonName} from your wishlist.`,
      );
    } else {
      setStoreWishlist(currentIsWishlist, currentCount);
      if (result.atCapacity) {
        openCapacityNotice();
      } else {
        toast.error(result.error);
      }
    }
  }

  const style = atCapacity
    ? AT_CAPACITY_STYLE
    : currentIsWishlist
      ? WISHLISTED_STYLE
      : { color: notWishlistedColor };

  return (
    <button
      type="button"
      aria-label={currentIsWishlist ? "Remove from wishlist" : "Add to wishlist"}
      title={currentIsWishlist ? "Remove from wishlist" : atCapacity ? "Wishlist full" : "Add to wishlist"}
      aria-pressed={currentIsWishlist}
      onClick={handleClick}
      className={className}
      style={style}
    >
      <svg width="15" height="17" viewBox="0 0 15 17" fill="none" aria-hidden="true">
        <path
          d={BOOKMARK_PATH}
          stroke={currentIsWishlist ? "none" : "currentColor"}
          fill={currentIsWishlist ? "currentColor" : "none"}
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
      </svg>
      {atCapacity && capacityBadgeClassName && (
        <span className={capacityBadgeClassName}>{WISHLIST_CAP}</span>
      )}
    </button>
  );
}
