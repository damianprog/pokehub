# Spec — Favorites & Wishlist 01 · Favorite toggle

> **Status:** spec / pre-implementation
> **Scope:** turning the existing static ♥ buttons on `/p/[slug]` (desktop `PokemonActions`, mobile `PokemonMobileHero`) into a real per-user favorite toggle, persisted to `UserPokemon.isFavorite`.
> **Out of scope:** Wishlist entirely — see §7 for why this slice doesn't touch it. Also out of scope: the "+" add-to-list button (a separate Lists feature), a favorites grid/list anywhere (profile page, discovery), and rank/stat displays that could eventually read from favorite counts.

---

## 1. Goal & scope

This is the first slice of the Favorites & Wishlist feature. A signed-in user can click the ♥
button to favorite a Pokémon, click again to unfavorite it, and the state round-trips to the
database and survives a reload. Favoriting is unlimited per `project-overview_8.md` §3 — unlike
Wishlist's 3-slot cap, there is no ceiling to enforce here.

Both host buttons already exist as pixel-matched static markup from the Claude Design source —
this is purely a wiring slice, not a new visual build. `PokemonActions.tsx` (desktop, next to
"Write review") and `PokemonMobileHero.tsx` (mobile, floating circular button over the hero
artwork) both render the ♥ glyph today with no click handler; the mobile component's own comment
already flags "static/unfavorited, no toggle this iteration."

Source design: `PokeHub.dc.html` (desktop action row, static single-state markup) and
`PokeHub-PokemonDetail-Mobile.dc.html` (mobile hero, which is the one artboard in the whole design
project that actually implements a working toggle — see §3).

---

## 2. Current state (what's already built)

| Surface | Component | Today |
|---|---|---|
| Desktop | `PokemonActions.tsx` | Static ♥ button, unfavorited color, no handler, `aria-label="Favorite"` |
| Mobile | `PokemonMobileHero.tsx` | Static ♥ button, unfavorited color, no handler, `aria-label="Favorite"`, floating over the hero artwork |

Neither component currently receives any favorite-related prop from the page. `UserPokemon.isFavorite`
exists in the schema (`@default(false)`) but has zero real writes anywhere in the codebase — this
slice is the first thing to touch it, the same way Rating 01 was the first real write to `rating`.

---

## 3. Visual states

Two states: unfavorited and favorited. No desktop artboard — not `PokeHub.dc.html`'s original
action row, nor any of the three Pokémon-detail states added since in `PokeHub-Wishlist.dc.html`
(not-wishlisted / wishlisted / at-capacity, §7) — ever shows the ♥ button in anything but its
single static color. Four desktop artboards across two files, zero toggled desktop state: there
just isn't one to source from.

The mobile file is different: `PokeHub-PokemonDetail-Mobile.dc.html` ships a small working
component (`toggleFav` / `favColor` in its script block) that actually flips color on click, which
makes it the only place in the whole design project with a real, sourced answer for what
"favorited" looks like — the glyph shifts from a muted pink (`#e8a0c0`) to a brighter, more
saturated pink-red (`#ff5d8f`). `PokeHub-Wishlist.dc.html`'s own mobile mockups render that same ♥
circle in flat grey (`#9aa0ab`) instead, in every one of its states — but since those mockups exist
to demonstrate the new bookmark icon sitting next to it, not to re-specify Favorite, the grey reads
as an unintentional simplification rather than a deliberate palette change. Flagging it here rather
than picking silently, in case it turns out to be intentional. Either way, the mobile hero component
with actual toggle logic remains the one authoritative source for Favorite's own colors.

Since no desktop artboard anywhere gives a favorited-state color of its own, reusing the mobile
source's favorited color on both surfaces is the reasonable default for visual consistency —
flagged here as a judgement call rather than a pixel-sourced desktop value, since it technically
isn't one. Pull the exact two color values from the mobile design source's script block when
implementing rather than approximating.

No other visual change accompanies the toggle (no animation, no count, no confirmation) in any
design source.

---

## 4. Data model & persistence

No schema change — `UserPokemon.isFavorite` already exists. The slice writes to the existing
`UserPokemon` row for the `(userId, pokemonId)` pair, matching the upsert pattern already
established by `setUserRating`/`postUserReview` in `src/lib/user-pokemon.ts`:

- Favoriting a Pokémon with no existing row creates one with `isFavorite: true` and every other
  field at its default — must not touch `rating`, `reviewText`, or any collection field.
- Favoriting/unfavoriting a Pokémon that already has a row (rated, reviewed, or caught) only flips
  `isFavorite`, leaving everything else on the row untouched.
- Unlike rating, there's no `reviewedAt`-style side effect to reason about — favoriting isn't a
  review signal.

---

## 5. Mutation path

A single Server Action, following the same layering already used for rating/review (§6.1 of
`project-overview_8.md`, and the precedent in `src/actions/rating.ts`): the action does the
session check, Zod validation, and `revalidatePath` call; the actual upsert lives in
`src/lib/user-pokemon.ts` alongside the existing per-`UserPokemon` helpers.

One toggle action (flip the current value) versus separate favorite/unfavorite actions is the
implementer's call — a toggle needs no value to validate beyond the Pokémon id, which is simpler
than rating's set/clear split where the value itself needed bounds-checking.

Requirements, unchanged from the established pattern:

- Auth check inside the action, never trust a client-supplied user id.
- Zod validation of the Pokémon id.
- `{ success, data, error }` return shape, `try`/`catch` around the Prisma call, failure surfaced
  via the existing `sonner` toast.
- Revalidate the Pokémon detail path.

---

## 6. Client/server split & reading initial state

Both host components need a click handler, but neither should become fully client-side just for
one button — matching how Rating 01 kept `RateRow` as an RSC and extracted only the interactive
star control into its own client component (one-component-per-file). Expect a single small client
component (e.g. a `FavoriteButton`) that both `PokemonActions` (already `"use client"`) and
`PokemonMobileHero` (currently a server component) render, rather than duplicating the click/toggle
logic in two places or converting `PokemonMobileHero` wholesale.

**Optimistic update:** the glyph color should flip immediately on click, reverting with a toast if
the action fails — same pattern as the rating stars.

**Forward-looking, non-actionable note:** `PokeHub-Wishlist.dc.html` (§7) shows the desktop action
row gaining a fourth button (a bookmark, sitting between ♥ and +) and the mobile hero gaining a
second floating circle stacked under ♥, once Wishlist ships. Nothing to build for that now, but
worth keeping the `FavoriteButton` extraction and its container markup generic enough that slice 02
can slot a sibling button in next to it rather than needing a rewrite.

**Reading the current value:** `page.tsx` already does one `getUserPokemonReview` lookup per
signed-in visitor for rating/review state. Extending that same query (and its return type) to also
select `isFavorite` avoids a second round-trip to the same row — reasonable since it's already the
page's single per-`UserPokemon` read, though renaming the helper/type to something less
review-specific is worth considering once it stops being just about reviews. Implementer's call
whether to rename now or leave a comment for later.

---

## 7. Wishlist — why this slice stops at Favorite

Wishlist is a distinct mechanic from Favorite in the spec (`project-overview_8.md` §3, §4.5, §6):
up to 3 slots (not unlimited), managed from a dedicated `/settings/wishlist` page, and later feeds
a ×1.5 pack-roll weight once the pack system exists.

**Update:** at the time this spec was first written, the Claude Design project had no wishlist
surface anywhere — that gap is what originally justified stopping at Favorite. A dedicated file,
`PokeHub-Wishlist.dc.html`, has since been added covering the detail-page toggle (desktop action
row and mobile floating circle, in not-wishlisted / wishlisted / at-capacity states) and the
`/settings/wishlist` management screen. So the design-source blocker is resolved, and Wishlist is
ready to be spec'd as its own slice (`favorite-wishlist-02-wishlist-spec.md`) off that file.

This slice still only implements Favorite — that scope decision stands regardless of the design now
existing, per Damian's direction to focus on the Favorite toggle for now. Wishlist's own glyph
(outline bookmark), accent color (`#ffc88a`, shared with pinned/Ultra Rare so it never reads as the
pink ♥ or a gold rating star), and cap-of-3 behavior are documented in that new file for whenever
slice 02 is picked up.

---

## 8. Anonymous users

Same as Rating 01: the button renders in its unfavorited state for signed-out visitors, and
clicking it opens the existing auth modal (`useAuthModal`) rather than writing anything or
redirecting to `/sign-in`.

---

## 9. Deliberate non-goals (this slice)

- **Wishlist**, entirely — see §7.
- **The "+" add-to-list button** on both host components — a separate Lists feature.
- **A favorites list/grid** anywhere a user could browse everything they've favorited (profile
  page, a `/u/[username]/favorites`-style route, discovery surfaces).
- **Favorite counts** shown anywhere (e.g. "♥ 134" style counts seen elsewhere in the design on
  reviews/feed events) — those belong to a likes feature, not this one.
- **Feed events** — no `POKEMON_FAVORITED` event is written yet, matching `FeedEventType` already
  existing in the schema but nothing populating it.

---

## 10. Implementation order

1. Extend (or add alongside) the existing per-`UserPokemon` read in `src/lib/user-pokemon.ts` to
   include `isFavorite` (§6).
2. Toggle-favorite function in the same file, upserting on `(userId, pokemonId)` (§4).
3. Server action — auth check, Zod validation, revalidate (§5).
4. `FavoriteButton` client component, shared by both host surfaces (§6).
5. Wire `PokemonActions` and `PokemonMobileHero` to render it in place of the static button.
6. Wire the page: pass the current `isFavorite` value down, revalidate on write.
7. Anonymous path → auth modal (§8).

---

## 11. Testing

Manual, in the browser, signed in as a real user:

- Unfavorited desktop button → click → favorited color, persists on reload.
- Click again → back to unfavorited, persists on reload.
- Same two checks on the mobile hero button.
- A Pokémon with no existing `UserPokemon` row → favoriting it creates the row without setting
  `rating`/`reviewText`/collection fields.
- Favoriting a Pokémon that already has a rating/review → only `isFavorite` changes, the rest of
  the row is untouched.
- Signed out → clicking either button opens the auth modal, nothing is written.
- Failure path → action error surfaces a toast and the optimistic color reverts.
- No console errors; `npm run build` passes.
