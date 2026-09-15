"use client";

import { useWishlistStore } from "@/store/wishlist";
import { WISHLIST_CAP } from "@/lib/wishlist";

const BOOKMARK_PATH = "M2 1.6h11v13.2L7.5 10.6 2 14.8V1.6Z";

interface WishlistCapacitySheetProps {
  pokemonName: string;
}

/**
 * Bottom-overlay prompt rising over the mobile hero when the at-capacity
 * circle is tapped, sourced from `PokeHub-Wishlist.dc.html` §2 (at-capacity
 * state). The design pairs this with a "Manage wishlist" button into
 * `/settings/wishlist`; omitted per
 * favorite-wishlist-02-wishlist-toggle-spec.md §7 since that page doesn't
 * exist yet, leaving "Not now" as the only action.
 */
export function WishlistCapacitySheet({ pokemonName }: WishlistCapacitySheetProps) {
  const { capacityNoticeOpen, closeCapacityNotice } = useWishlistStore();

  if (!capacityNoticeOpen) return null;

  return (
    <div
      className="absolute inset-x-0 bottom-0 border-t p-[16px_16px_18px]"
      style={{
        background: "linear-gradient(180deg,rgba(12,14,18,0),rgba(12,14,18,0.92) 42%)",
        borderColor: "rgba(255,200,138,0.18)",
      }}
    >
      <div className="mb-[5px] flex items-center gap-[9px]">
        <svg width="11" height="13" viewBox="0 0 15 17" style={{ color: "#ffc88a" }} aria-hidden="true">
          <path d={BOOKMARK_PATH} fill="currentColor" />
        </svg>
        <span className="font-['Space_Grotesk'] text-[14px] font-bold">
          Wishlist full — {WISHLIST_CAP} of {WISHLIST_CAP}
        </span>
      </div>
      <div className="mb-[12px] text-[12.5px] leading-[1.5] text-[#9aa0ab]">
        Remove one to make room for {pokemonName}.
      </div>
      <button
        type="button"
        onClick={closeCapacityNotice}
        className="h-[40px] w-full rounded-[11px] border border-white/10 bg-white/[0.06] text-[13.5px] font-bold text-[#cdd2da]"
      >
        Not now
      </button>
    </div>
  );
}
