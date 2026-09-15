"use client";

import { useWishlistStore } from "@/store/wishlist";
import { WISHLIST_CAP } from "@/lib/wishlist";

interface WishlistCapacityNoticeProps {
  pokemonName: string;
}

/**
 * Inline warning panel below the desktop action row, shown when clicking a
 * disabled bookmark button at capacity — sourced from
 * `PokeHub-Wishlist.dc.html` §1c. The design pairs this with a "Manage
 * wishlist" button into `/settings/wishlist`; omitted per
 * favorite-wishlist-02-wishlist-toggle-spec.md §7 since that page doesn't
 * exist yet, leaving Dismiss as the only action.
 */
export function WishlistCapacityNotice({ pokemonName }: WishlistCapacityNoticeProps) {
  const { capacityNoticeOpen, closeCapacityNotice } = useWishlistStore();

  if (!capacityNoticeOpen) return null;

  return (
    <div
      className="mt-[10px] flex items-start gap-[11px] rounded-[12px] border p-[12px_14px]"
      style={{ background: "#15181e", borderColor: "rgba(255,200,138,0.22)" }}
    >
      <span className="flex-none text-[13px] leading-[1.5] text-[#ffc88a]">!</span>
      <div className="flex-1 text-[12.5px] leading-[1.55] text-[#9aa0ab]">
        Your wishlist is full at <span className="font-bold text-[#e8eaed]">{WISHLIST_CAP} of {WISHLIST_CAP}</span>.
        Remove one to add {pokemonName}.
        <div className="mt-[9px]">
          <button
            type="button"
            onClick={closeCapacityNotice}
            className="h-[30px] rounded-[9px] px-[12px] text-[12.5px] font-semibold text-[#7b818c]"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
