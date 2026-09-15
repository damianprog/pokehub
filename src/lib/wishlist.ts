/**
 * Max wishlisted Pokémon per user. Hardcoded for every user regardless of
 * `User.isPro` — project-overview_8.md §9 lists 5 for Pro, but Pro billing
 * isn't functionally implemented yet, so a tier-aware limit would be built
 * against a feature that doesn't exist. Revisit once Pro billing ships.
 * See favorite-wishlist-02-wishlist-toggle-spec.md §4.
 *
 * Deliberately client-safe (no Prisma import) so both the server data layer
 * (`user-pokemon.ts`) and client components (`WishlistButton`, the store)
 * can share one source of truth for the number.
 */
export const WISHLIST_CAP = 3;
