"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface PokedexWishlistCount {
  count: number;
  setCount: (count: number) => void;
}

const PokedexWishlistContext = createContext<PokedexWishlistCount | null>(null);

interface PokedexWishlistProviderProps {
  /** The viewer's total wishlisted count, as the server read it for this render. */
  initialCount: number;
  children: ReactNode;
}

/**
 * The viewer's wishlist count, shared by every card on the grid so freeing a
 * slot on one card re-enables the others at once. Separate from the detail
 * page's per-Pokémon wishlist store.
 */
export function PokedexWishlistProvider({ initialCount, children }: PokedexWishlistProviderProps) {
  const [count, setCount] = useState(initialCount);
  // A fresh server render (navigation, revalidation) brings a new count — adopt it.
  const [serverCount, setServerCount] = useState(initialCount);
  if (initialCount !== serverCount) {
    setServerCount(initialCount);
    setCount(initialCount);
  }

  return (
    <PokedexWishlistContext.Provider value={{ count, setCount }}>
      {children}
    </PokedexWishlistContext.Provider>
  );
}

export function usePokedexWishlistCount(): PokedexWishlistCount {
  const value = useContext(PokedexWishlistContext);
  if (!value) throw new Error("usePokedexWishlistCount must be used inside PokedexWishlistProvider");
  return value;
}
