# Spec — Favorites & Wishlist 02 · Wishlist toggle

> **Status:** spec / pre-implementation
> **Scope:** adding and removing a Pokémon from a signed-in user's wishlist directly from
> `/p/[slug]` — a new bookmark toggle on the desktop action row (`PokemonActions`) and a second
> floating circle on the mobile hero (`PokemonMobileHero`), persisted to `UserPokemon.isWishlist`,
> capped at 3 wishlisted Pokémon per user.
> **Out of scope:** the `/settings/wishlist` management page entirely — that is its own future
> spec. Anything in the design source that exists only to route there (a "Manage" link, a "Manage
> wishlist" button) is deferred along with it; see §7.

---

## 1. Goal & scope

This is the second slice of the Favorites & Wishlist feature, following Favorite (01). A
signed-in user can click the bookmark toggle to add a Pokémon to their wishlist, click again to
remove it, and the state round-trips to the database and survives a reload — same shape as
Favorite, with one addition: Wishlist is capped at 3, so adding a 4th must be blocked rather than
silently allowed.

Source design: `PokeHub-Wishlist.dc.html`, sections 1 (desktop action row) and 2 (mobile floating
toggle). Section 3 of that file (`/settings/wishlist`) is not part of this slice.

Wishlist is a distinct mechanic from Favorite per `project-overview_8.md` §3/§4.5: capped at 3
slots (5 for Pro per §9 — see the note at the end of §4 on why this slice ignores that for now),
and it will eventually feed a ×1.5 pack-roll weight once the pack system exists. Neither the Pro
slot count nor the pack weighting is built in this slice — both depend on features that don't
exist yet (Stripe/Pro billing, packs).

---

## 2. Current state (what's already built)

`UserPokemon.isWishlist` exists in the schema (`@default(false)`, already indexed via
`@@index([userId, isWishlist])`) but has zero real writes anywhere in the codebase, the same
starting point Favorite was in before slice 01.

The desktop action row (`PokemonActions.tsx`) currently renders exactly two buttons next to
"Write review": the `FavoriteButton` and a static "+" add-to-list button. There is no third button
today — the bookmark toggle is new UI, not a rewire of existing static markup. Slice 01 §6 flagged
this in advance: "worth keeping the `FavoriteButton` extraction and its container markup generic
enough that slice 02 can slot a sibling button in next to it."

The mobile hero (`PokemonMobileHero.tsx`) currently renders one floating circle (`FavoriteButton`)
top-right over the artwork. This slice adds a second circle stacked underneath it.

---

## 3. Visual states

Three states, both surfaces: not wishlisted, wishlisted, and at capacity (3 already wishlisted,
looking at a 4th Pokémon).

### Desktop — action row, 46×42px shell matching ♥ and +

- **Not wishlisted.** Same shell as the ♥/+ buttons (`rgba(255,255,255,0.06)` background, hairline
  border), outline bookmark glyph at `#9aa0ab`, `title="Add to wishlist"`. Sits between ♥ and +.
- **Wishlisted.** Shell tints to the amber accent: background `rgba(255,200,138,0.12)`, border
  `rgba(255,200,138,0.35)`, filled bookmark glyph at `#ffc88a`, `title="Remove from wishlist"`. The
  artwork card above also gains a top-right corner badge — "Wishlisted" with a small bookmark
  glyph, translucent dark pill (`rgba(12,14,18,0.62)`, backdrop blur, amber-tinted border), same
  `#ffc88a` text. Below the action row, a small line reads "**2 of 3** wishlisted" — that count is
  the user's total wishlist size, not specific to this Pokémon (see §6). The design pairs this line
  with a "Manage" link into `/settings/wishlist`; omit that link this slice per §7 and render the
  count text on its own.
- **At capacity.** Bookmark shell dims — background `rgba(255,255,255,0.03)`, border
  `rgba(255,255,255,0.06)`, glyph `#4f5662`, `cursor: not-allowed` — with a small "3" count badge
  overlapping its top-right corner. Per the design's own annotation, the button is still clickable
  despite the disabled styling: clicking it reveals an inline warning panel below the action row
  ("Your wishlist is full at **3 of 3**. Remove one to add {name}.") rather than failing silently
  or via toast. The design pairs that panel with "Manage wishlist" / "Dismiss" buttons — per §7,
  build only "Dismiss" (closes the panel) this slice; omit "Manage wishlist" since its destination
  doesn't exist yet.

### Mobile — second 42px circle under the ♥ circle, floating over the hero artwork

- **Not wishlisted.** Same translucent dark circle as ♥ (`rgba(12,14,18,0.55)`, backdrop blur),
  outline bookmark glyph — the source here uses `#cdd2da` rather than desktop's `#9aa0ab` for the
  unwishlisted glyph color; pull the exact value from each surface's own artboard rather than
  reconciling the two, same treatment slice 01 gave to a similar cross-surface color mismatch.
- **Wishlisted.** Circle tints amber (`rgba(255,200,138,0.16)` background, `rgba(255,200,138,0.4)`
  border, `#ffc88a` glyph, filled bookmark). A bottom-left badge over the hero reads "Wishlisted ·
  2 of 3" — combining the state label and count into one pill, unlike desktop's split badge/footer.
- **At capacity.** Circle dims (`rgba(12,14,18,0.45)` background, `#4f5662` glyph) with a small "3"
  badge on its corner. Clicking it rises a bottom sheet-style prompt over the hero (dark gradient
  scrim, amber top border): "Wishlist full — 3 of 3" / "Remove one to make room for {name}." with
  "Manage wishlist" and "Not now" buttons. Same §7 deferral applies — build "Not now" (dismiss)
  only, omit "Manage wishlist" this slice.

No animation, count badge on the buttons themselves (beyond the "3" at-capacity indicator), or
other visual change beyond what's described above appears in either artboard.

---

## 4. Data model & persistence

No schema change — `UserPokemon.isWishlist` already exists, same shape as `isFavorite`. Writes go
to the existing `UserPokemon` row for the `(userId, pokemonId)` pair:

- Wishlisting a Pokémon with no existing row creates one with `isWishlist: true` and every other
  field at its default — must not touch `rating`, `reviewText`, `isFavorite`, or any collection
  field.
- Wishlisting/unwishlisting a Pokémon that already has a row only flips `isWishlist`, leaving
  everything else untouched.
- Unlike Favorite, adding requires a guard: the write must not succeed if the user already has 3
  Pokémon wishlisted (and this Pokémon isn't already one of them). Removing never needs the guard —
  it always frees a slot.

**Cap enforcement is server-side, not just a disabled button.** The at-capacity UI in §3 covers the
common case, but the mutation itself must re-check the count before writing, the same
defense-in-depth principle already applied elsewhere (e.g. the pack-open transaction in
`project-overview_8.md` §10.3) — two rapid adds from different tabs/devices must not both succeed
and leave a user with 4. Read-count-then-write should happen inside a transaction.

**On the Free-vs-Pro slot count (§9 of `project-overview_8.md` lists 3 for Free, 5 for Pro):** this
slice hardcodes the cap at 3 for every user regardless of `User.isPro`, deliberately ignoring that
row. No Stripe/Pro billing flow has shipped yet (per `current-feature.md` history, Pro is still
unbuilt beyond the `isPro` schema field), the Wishlist design source shows only a 3-slot cap in
every artboard with no Pro variant, and a Pro-aware limit would be built against a tier system that
doesn't functionally exist yet. Flagging this rather than silently building a `isPro ? 5 : 3`
branch against an unimplemented feature — worth a real look once Pro billing exists.

---

## 5. Mutation path

A single Server Action, following the same layering as Favorite (§6.1 of `project-overview_8.md`,
precedent in `src/actions/favorite.ts`): the action does the session check, Zod validation, and
`revalidatePath`; the upsert-plus-cap-check lives in `src/lib/user-pokemon.ts` alongside the
existing per-`UserPokemon` helpers.

This mutation needs one thing Favorite's didn't: a way for the caller to distinguish "wishlist is
full" from a generic failure, since the UI response differs (inline capacity panel vs. a toast).
The existing `{ success, data, error }` shape can carry that as an additional discriminant on the
failure branch (e.g. a boolean or reason code) — implementer's call on the exact shape, but it must
be machine-checkable, not just a string the UI pattern-matches on.

Requirements, unchanged from the established pattern:

- Auth check inside the action, never trust a client-supplied user id.
- Zod validation of the Pokémon id.
- `try`/`catch` around the Prisma call, failure surfaced via the existing `sonner` toast — except
  the at-capacity case, which surfaces via the inline panel/sheet in §3 instead of a toast.
- Revalidate the Pokémon detail path.

---

## 6. Client/server split & reading initial state

Same shape as Favorite: neither host component should become fully client-side for one button.
Expect a `WishlistButton` client component analogous to `FavoriteButton`, rendered by both
`PokemonActions` (already client) and `PokemonMobileHero` (server component) — reusing the
existing extraction point slice 01 left generic for this. The at-capacity panel/sheet from §3 is
visually distinct enough between desktop and mobile (an inline bordered box below the row vs. a
bottom overlay on the hero image) that it likely wants its own component(s) rather than living
inside `WishlistButton` itself — implementer's call, per the one-component-per-file convention.

**Optimistic update:** same pattern as Favorite/rating — flip immediately on click, revert with a
toast if the action fails. This only applies to the toggle-off path and the toggle-on path when
under the cap; the at-capacity path in §3 isn't optimistic, since the button's state (disabled,
capacity badge) is already known from the page load rather than discovered after a failed write.

**Reading the current value — two different reads:**

1. Per-Pokémon: whether *this* Pokémon is wishlisted. Same shape as `isFavorite` — extend the
   existing `getUserPokemonReview` read (or its eventual rename, per slice 01 §6) to also select
   `isWishlist`, avoiding a second per-row round trip.
2. Per-user total: how many Pokémon the user has wishlisted overall, needed to know whether *this*
   Pokémon's "not wishlisted" state should render as addable or at-capacity, and to populate the "2
   of 3" text. This is a separate aggregate query (a `count` over `UserPokemon` where
   `userId` matches and `isWishlist` is true — the existing `@@index([userId, isWishlist])` covers
   it), not something the per-row read can answer.

Both values need to reach `PokemonActions`/`PokemonMobileHero` from `page.tsx`, the same way
`initialIsFavorite` does today.

---

## 7. Deferred: everything that routes to `/settings/wishlist`

Per Damian's direction, `/settings/wishlist` itself is a future slice. Three design elements exist
only to link into it, and all three are deferred along with the page:

- The desktop "Manage" link next to the "2 of 3 wishlisted" count (§3).
- The "Manage wishlist" button in the desktop at-capacity inline panel (§3).
- The "Manage wishlist" button in the mobile at-capacity sheet (§3).

Build the surrounding UI (badges, counts, the capacity panel/sheet's message and dismiss action)
without these — a link or button to a route that 404s is worse than not having it. When
`/settings/wishlist` ships, wiring these three back in should be a small follow-up, not a rebuild.

---

## 8. Anonymous users

Same as Favorite: the bookmark button renders in its not-wishlisted state for signed-out visitors,
and clicking it opens the existing auth modal (`useAuthModal`) rather than writing anything or
redirecting to `/sign-in`. The at-capacity state never applies to a signed-out visitor (there's no
wishlist to be full), so no capacity UI needs an anonymous variant.

---

## 9. Deliberate non-goals (this slice)

- **`/settings/wishlist`** — the whole management page (grid of 3 slots, search/add picker, remove
  buttons). A dedicated future spec.
- **Everything in §7** that routes there.
- **Pro's 5-slot cap** — hardcoded at 3 for everyone, see §4.
- **Wishlist pack-roll weighting (×1.5)** — depends on the pack system, which doesn't exist yet
  (`project-overview_8.md` §4.5).
- **A wishlist grid/list anywhere else** a user could browse everything they've wishlisted outside
  of `/settings/wishlist` (profile page, discovery surfaces).
- **Feed events** — no event type exists for wishlist adds in `FeedEventType`, and none should be
  added speculatively here.

---

## 10. Implementation order

1. Extend the existing per-`UserPokemon` read in `src/lib/user-pokemon.ts` to include `isWishlist`,
   and add the separate per-user wishlist-count read (§6).
2. Toggle-wishlist function in the same file: upsert on `(userId, pokemonId)`, transactional
   count-then-write cap check on the add path (§4).
3. Server action — auth check, Zod validation, capacity-aware failure shape, revalidate (§5).
4. `WishlistButton` client component (and the capacity panel/sheet component(s)), shared by both
   host surfaces (§6).
5. Wire `PokemonActions` (new third button between ♥ and +) and `PokemonMobileHero` (new second
   floating circle) to render it.
6. Wire the page: pass both `initialIsWishlist` and the total wishlist count down, revalidate on
   write.
7. Anonymous path → auth modal (§8).

---

## 11. Testing

Manual, in the browser, signed in as a real user:

- Not-wishlisted desktop button → click → wishlisted color/badge/footer count, persists on reload.
- Click again → back to not-wishlisted, count decrements, persists on reload.
- Same two checks on the mobile floating circle.
- Wishlist a 3rd Pokémon → both surfaces on a 4th Pokémon's page render the at-capacity state.
- Click the at-capacity button on both surfaces → inline panel (desktop) / sheet (mobile) appears
  with the correct Pokémon name; Dismiss/Not now closes it without writing anything.
- Attempt to bypass the cap by calling the server action directly with a 4th pokemonId while
  already at 3 → rejected, no 4th row gets `isWishlist: true`.
- A Pokémon with no existing `UserPokemon` row → wishlisting it creates the row without setting
  `rating`/`reviewText`/`isFavorite`/collection fields.
- Wishlisting a Pokémon that already has a rating/review/favorite → only `isWishlist` changes.
- Signed out → clicking either button opens the auth modal, nothing is written.
- Failure path (non-capacity) → action error surfaces a toast and the optimistic state reverts.
- No console errors; `npm run build` passes.
