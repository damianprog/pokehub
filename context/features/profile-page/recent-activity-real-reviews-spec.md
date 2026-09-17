# Profile Page — Recent Activity Real Reviews Spec

## Status

Planning — not started

## Goal

Replace the "Recent activity" section's fixed mock feed (`PLACEHOLDER_RECENT_ACTIVITY`, always the
same Charizard/Gengar cards on every profile) with the profile owner's real review history, now
that the rating/review feature exists and `UserPokemon` rows carry real `rating`/`reviewText`/
`reviewedAt` data. This is the same kind of mock-to-real swap already done for `CommunityRating`
(rating-02) and `TopReviews` (rating-05).

## Scope

In scope: sourcing "Recent activity" from the signed-in-or-not viewer's view of the *profile
owner's* own written reviews, replacing the mock dataset and wiring the card's rating/date/quote
rendering to match.

Out of scope: everything under "Out of scope" below, most notably non-review activity types
(favoriting, wishlisting, list creation, pack pulls, follows) — see that section for why, including
the direct answer to "should favoriting/wishlisting show up here."

## Data source

- A new query, colocated with `getTopReviews` in `src/lib/user-pokemon.ts` (e.g.
  `getRecentReviews(userId, limit)`), reading `UserPokemon` rows where `userId` is the *profile
  owner's* id and `reviewText` is set, ordered by `reviewedAt` descending, joined directly to the
  `Pokemon` relation for `slug`/`name`/`types`/`artworkUrl` — one query instead of the current
  two-step (mock ids → `getPokemonsByIds`) shape, since the real rows already carry the pokemon
  relation.
- This is a different query from `getTopReviews`: that one is scoped to a single Pokémon across all
  users; this one is scoped to a single user across all Pokémon.
- No auth gating — a profile's written reviews are already public-facing content (visible to every
  visitor via `TopReviews` on the Pokémon's own page), so any visitor to `/u/[username]` sees the
  same feed.
- Cap stays at 2 items, matching the current design and the existing mock feed's size. No "view
  all" link — the design doesn't have one here (unlike `TopReviews`), and adding one is a separate
  decision.

## Content & copy

- Activity line stays "reviewed {Pokémon name}" — the only activity type in scope this iteration.
- Star rating and quote block should match the convention just established across `YourReview` and
  `TopReviews`: the two-layer partial-fill stars plus the numeric rating chip (via
  `formatRatingValue`) when a rating exists, a "Not yet rated" label when `rating` is null (rating
  cleared but review text kept), and the review text rendered plain — no wrapping quotation marks.
  Today's mock version hardcodes a whole 1–5 rating and always wraps the quote in `&quot;…&quot;`;
  both should be dropped in favor of the shared convention.
- Date label: switch from the mock's relative "1d"/"3d" style (no relative-time helper exists
  anywhere in the codebase today) to the same absolute date format already used by `YourReview` and
  `TopReviews` (e.g. "15 Sept 2026"), for consistency across all three review surfaces rather than
  introducing a new formatting convention for just this one.

## Layout & components

No layout changes. `RecentActivity`'s card markup, gradient thumbnail, and link-scoped-to-artwork
behavior are unchanged — only the data it's fed and the rating/date/quote rendering details above.

## Empty state

The mock feed is never empty, so `RecentActivity` currently has no empty-state design. A profile
owner with zero written reviews needs one — reuse the tone of `TopReviewsEmptyState` (e.g. "No
activity yet") rather than rendering an empty heading with nothing under it.

## Interactions

Unchanged — artwork thumbnail links to `/p/[slug]`, rest of the card stays static.

## Responsive notes

Unchanged — no new fixed-width elements.

## Out of scope

- **Favoriting and wishlisting as activity types.** Recommendation: not in this pass, and probably
  its own follow-up spec rather than folded into this one. Reviews have `UserPokemon.reviewedAt` to
  order and timestamp them; favorites and wishlist entries have no equivalent — `isFavorite` and
  `isWishlist` are bare booleans with no "when" attached (`updatedAt` is shared with every other
  field on the row, including rating/review edits, so it can't be trusted as "when this was
  favorited"). Showing them chronologically alongside reviews needs either a schema addition
  (`favoritedAt`/`wishlistedAt` nullable timestamps, set in `setUserFavorite`/`setUserWishlist`) or
  wiring the already-modeled-but-unused `FeedEvent` table (see project-overview §5.3 — defined in
  the schema, zero rows written anywhere in the app today). Both are real scope: a migration plus
  touching the existing favorite/wishlist server actions, versus standing up the first `FeedEvent`
  writer/reader pair in the codebase. Worth doing eventually — favoriting is a lighter-weight,
  more frequent action than writing a review, so it would make the feed feel more alive — but it's
  a bigger, separate decision than swapping this section's mock reviews for real ones.
- List creation, rare pack pulls, new-follow events — no lists/packs/follow features exist yet.
- Pagination or a "load more" control.
- The "Favorite types" sidebar next to this section — separate, already-shipped section.

## Acceptance criteria

- `/u/[username]` shows the profile owner's own most recent written reviews (up to 2) in place of
  the fixed mock feed, using real Pokémon name/type/artwork and real rating/review/date data.
- A profile owner with zero written reviews sees an empty state instead of stale mock cards.
- Rating and date rendering match the convention used by `YourReview`/`TopReviews` (numeric rating
  chip, "Not yet rated" fallback, absolute date, unquoted review text).
- No layout break from 375px to 1920px.

## History
