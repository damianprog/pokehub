interface PokedexCardIndicatorsProps {
  isFavorite: boolean;
  isWishlist: boolean;
}

/** Mobile-only, non-interactive heart/bookmark over the artwork for flags that are on (desktop uses `PokedexCardToggles`). */
export function PokedexCardIndicators({ isFavorite, isWishlist }: PokedexCardIndicatorsProps) {
  if (!isFavorite && !isWishlist) return null;

  return (
    <div className="pointer-events-none absolute top-[6px] right-[6px] flex gap-[4px] md:hidden">
      {isFavorite && (
        <span
          role="img"
          aria-label="Favorite"
          className="flex size-[24px] items-center justify-center rounded-[7px] bg-[rgba(12,14,18,0.62)] text-[12px] leading-none text-[#ff5d8f]"
        >
          ♥
        </span>
      )}
      {isWishlist && (
        <span
          role="img"
          aria-label="On your wishlist"
          className="flex size-[24px] items-center justify-center rounded-[7px] border border-[rgba(255,200,138,0.35)] bg-[rgba(12,14,18,0.62)] text-[#ffc88a]"
        >
          <svg width="9" height="11" viewBox="0 0 15 17" aria-hidden="true">
            <path d="M2 1.6h11v13.2L7.5 10.6 2 14.8V1.6Z" fill="currentColor" />
          </svg>
        </span>
      )}
    </div>
  );
}
