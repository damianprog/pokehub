import { create } from "zustand";

interface WishlistStore {
  /** Guards `hydrate` against clobbering live state on a re-render/remount of the same page. */
  pokemonId: number | null;
  isWishlist: boolean;
  /** The signed-in user's total wishlisted count across every Pokémon, not just this one. */
  count: number;
  capacityNoticeOpen: boolean;
  hydrate: (pokemonId: number, isWishlist: boolean, count: number) => void;
  setWishlist: (isWishlist: boolean, count: number) => void;
  openCapacityNotice: () => void;
  closeCapacityNotice: () => void;
}

/**
 * Shared client state for the wishlist toggle on `/p/[slug]`. Both the
 * desktop (`PokemonActions`/`PokemonArtwork`) and mobile (`PokemonMobileHero`)
 * surfaces render simultaneously (CSS-hidden by breakpoint, not unmounted),
 * and several small components on each surface (button, corner/footer
 * badges, capacity notice) need the same live `isWishlist`/`count` — a
 * single store avoids prop-drilling optimistic state across that many
 * sibling components. `pokemonId` guards `hydrate` so a second surface's
 * mount effect doesn't stomp an in-flight optimistic update with the
 * server-rendered initial props.
 */
export const useWishlistStore = create<WishlistStore>((set, get) => ({
  pokemonId: null,
  isWishlist: false,
  count: 0,
  capacityNoticeOpen: false,
  hydrate: (pokemonId, isWishlist, count) => {
    if (get().pokemonId === pokemonId) return;
    set({ pokemonId, isWishlist, count, capacityNoticeOpen: false });
  },
  setWishlist: (isWishlist, count) => set({ isWishlist, count }),
  openCapacityNotice: () => set({ capacityNoticeOpen: true }),
  closeCapacityNotice: () => set({ capacityNoticeOpen: false }),
}));

/**
 * Reads live wishlist state for one Pokémon, falling back to the
 * server-rendered initial props until the store has been hydrated for this
 * `pokemonId` (by whichever `WishlistButton` instance mounts and runs its
 * effect first — desktop or mobile). Shared by every component that only
 * *reads* the state (badges, the capacity notice) so they don't each need
 * their own hydration fallback logic.
 */
export function useWishlistState(pokemonId: number, initialIsWishlist: boolean, initialCount: number) {
  const { pokemonId: hydratedPokemonId, isWishlist, count } = useWishlistStore();
  const isHydrated = hydratedPokemonId === pokemonId;
  return {
    isWishlist: isHydrated ? isWishlist : initialIsWishlist,
    count: isHydrated ? count : initialCount,
  };
}
