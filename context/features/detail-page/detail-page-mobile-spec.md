# Spec — Pokémon Detail Page — Mobile Layout

> **Status:** spec / pre-implementation
> **Scope:** the mobile presentation of `/p/[slug]`, reusing the existing desktop section
> components wherever their visual content matches, and introducing new components only for the
> pieces of mobile chrome that have no desktop equivalent.
> **Source:** Claude Design project, `PokeHub-PokemonDetail-Mobile.dc.html` (dedicated mobile
> screen file, separate from the main `PokeHub.dc.html` desktop screens).

---

## 1. Goal & scope

Today `/p/[slug]` renders a single fixed two-column desktop layout (a sticky `392px` artwork
column beside an info column) with no responsive behavior at all — there's no mobile treatment of
this page yet. This spec covers making the page work well at phone widths, following the same
"reuse the desktop section, adjust for width" approach already used elsewhere in the app (see the
landing page's `Features`/`Trending` grids collapsing to a single column below the existing
breakpoint).

The mobile design reuses the same underlying content and, for most sections, the same visual
language as desktop — it's a narrower single-column stack rather than a redesign. The pieces that
genuinely differ are the page chrome around that stack: a sticky top bar replaces the breadcrumb,
a full-bleed hero image replaces the artwork card, and a sticky bottom bar replaces the inline
action row.

**What this spec covers:**

- Which existing section components are reused as-is (or with minor responsive sizing) vs. which
  pieces of chrome need new, mobile-only components.
- The layout/structural differences between the two presentations.
- Props and data implications for the new components.

**What this spec deliberately does NOT cover:**

- Any interactivity (favorite toggling, overflow menu actions, star input, back navigation) —
  every section on this page today is presentational-only pending the future rating/review
  feature, and the mobile chrome follows the same pattern this iteration.
- Real data/aggregation — the mobile layout consumes the exact same `Pokemon` record and the same
  placeholder datasets (rating, rate-row, top reviews, appears-in-lists) already wired into the
  desktop page.

---

## 2. Overall approach

Render one page, not a separate mobile route. Both the desktop chrome (breadcrumb, artwork card,
inline action row, two-column grid) and the mobile chrome (sticky top bar, full-bleed hero, single
column stack, sticky bottom bar) exist in the same page markup, toggled by the existing responsive
breakpoint already used across the landing page components — one side hidden, the other shown,
rather than a client-side viewport check. This keeps the page a plain server component; no new
`"use client"` boundary is needed purely for the layout swap.

The reused section components in the info column (header, physicals, rating, rate row, base
stats, top reviews, appears-in-lists) are not duplicated per breakpoint — they render once and
adjust their own internal sizing responsively where needed (see §4).

---

## 3. New mobile-only chrome (no desktop equivalent)

Three pieces of chrome exist only in the mobile design and have no component to reuse:

**Sticky top bar.** Replaces the breadcrumb on mobile. A slim sticky header pinned to the top of
the viewport: a round back button on the left, the Pokémon's name centered/truncated in the
middle, and a round overflow ("more") button on the right. Backdrop-blurred so content scrolling
behind it stays legible.

**Mobile hero.** Replaces `PokemonArtwork` on mobile — not a responsive variant of it, a
genuinely different treatment. Where the desktop artwork is a square card with rounded corners,
the mobile hero is a full-bleed, non-rounded rectangular banner at the very top of the page (sitting
directly under the sticky top bar), with the Pokédex-number watermark anchored to the top-left
corner instead of centered, and a circular favorite button floating in the top-right corner of the
image itself rather than sitting in a separate row underneath. This is different enough from
`PokemonArtwork` (aspect ratio, corner treatment, watermark position, and an overlaid interactive
element baked into the image) that it should be its own component rather than a `variant` prop
bolted onto the existing one.

**Sticky bottom action bar.** Replaces the inline `PokemonActions` row on mobile. A bar fixed to
the bottom of the viewport containing the "add to list" button and the "Write review" CTA. Note
the favorite button is *not* here on mobile — it already lives on the hero overlay above, so this
bar only carries two of the three actions `PokemonActions` shows on desktop.

---

## 4. Reused section components

These render unchanged in structure and content; only their internal sizing needs to flex at
narrower widths. None of them need new props for this iteration.

- **`PokemonHeader`** — same Pokédex-number label, name heading, and type-badge row. The name
  heading in particular needs to shrink noticeably at mobile widths (it dominates less of the
  screen than on desktop).
- **`PokemonPhysicals`** — same three-column Height/Weight/Base XP layout; sizing is already very
  close to the mobile design as-is, only a minor reduction needed.
- **`CommunityRating`** — same score/star/distribution layout; the large average-score number and
  the spacing around it are noticeably more compact on mobile than desktop.
- **`RateRow`** — same "Rate it" + star control + stats line; near-identical to desktop already,
  only a marginal reduction on the star glyph size.
- **`BaseStats`** — same six-stat bar chart; effectively no mobile-specific adjustment needed, the
  existing sizing already matches the mobile design closely.

Two reused components need a genuine content/layout adjustment, not just smaller type:

- **`TopReviews`** — the mobile review cards drop the follower-count line entirely, showing only
  the username next to the star rating (no "· N followers" segment). The component needs to
  support omitting that line on mobile rather than always rendering it.
- **`AppearsInLists`** — desktop lays these out as a fixed 3-column grid; mobile instead uses a
  horizontally-scrolling strip of fixed-width cards that bleeds edge-to-edge past the page's
  normal side padding. The individual card content (thumbnail trio, title, byline) is unchanged —
  only the outer container's layout mode and each card's width behavior differ by breakpoint.

---

## 5. Page structure differences

- No breadcrumb on mobile — the sticky top bar's back button + title takes over that role.
- No sticky two-column grid on mobile — everything stacks in a single column in document order:
  hero, header, physicals, rating, rate row, base stats, top reviews, appears-in-lists.
- The page needs bottom padding on mobile equal to (or greater than) the sticky bottom bar's
  height, so the last section (appears-in-lists) isn't hidden underneath it.
- The mobile design's `<script>` block fetches Charizard's data live from PokeAPI as a design-tool
  convenience for previewing the screen — that's a Claude Design authoring artifact, not something
  to implement. Our page already has the real `Pokemon` record from `getPokemon(slug)`; the mobile
  layout consumes that same prop data exactly like the desktop layout does.

---

## 6. Props for the new components

- **Sticky top bar** — needs the Pokémon's name for the title text. Back-button behavior
  (browser-history back vs. a fixed link) is left as an implementation detail; no interactivity is
  required to actually navigate this iteration beyond whatever the simplest static/no-op choice is
  — call out explicitly in code review if it's wired to something real.
- **Mobile hero** — the same subset of fields `PokemonArtwork` already takes (id, name,
  artworkUrl, types). The favorite button renders in its default/unfavorited visual state only;
  no click handler or toggle state this iteration, matching how `PokemonActions`' favorite button
  is already static today.
- **Sticky bottom action bar** — no props needed this iteration; both buttons are static, same as
  today's `PokemonActions`.

---

## 7. File structure (proposed)

- `src/components/pokemon/PokemonMobileTopBar.tsx` — new.
- `src/components/pokemon/PokemonMobileHero.tsx` — new.
- `src/components/pokemon/PokemonMobileActionBar.tsx` — new.
- `TopReviews.tsx`, `AppearsInLists.tsx` — modified to support the mobile-specific display
  difference noted in §4.
- `PokemonHeader.tsx`, `PokemonPhysicals.tsx`, `CommunityRating.tsx`, `RateRow.tsx` — modified with
  responsive sizing only, no structural change.
- `src/app/(app)/p/[slug]/page.tsx` — modified to render both the desktop and mobile chrome,
  breakpoint-toggled, and mount the reused section components once inside whichever column
  structure is active.

---

## 8. Deliberate non-goals (this iteration)

- Any real interactivity — favorite toggling, overflow-menu actions, review composer, star-rating
  input, list-add flow. Matches the non-goals already carried by every desktop section spec so
  far.
- Real data aggregation for rating/reviews/lists — still placeholder data, same as desktop.
- A tablet-specific intermediate layout — this spec only distinguishes "desktop" and "mobile" at
  the existing breakpoint already used elsewhere in the app.

---

## 9. Testing

Manual verification once implemented:

- `/p/charizard` at a phone-width viewport (matching the design frame's width) — sticky top bar
  stays pinned while scrolling, hero renders full-bleed with the favorite button overlaid, all
  reused sections stack in a single column, sticky bottom bar stays pinned above the safe-area
  inset, and the last section isn't obscured by it.
- Same URL at a desktop-width viewport — confirms the existing desktop layout is untouched by the
  breakpoint changes.
- A Pokémon with a single type (e.g. `/p/magikarp`) and one with two types (e.g. `/p/charizard`)
  at mobile width — type badge row still renders correctly in the narrower header.
- `TopReviews` at mobile width shows no follower-count line; at desktop width it still does.
- `AppearsInLists` at mobile width scrolls horizontally and bleeds to the screen edge; at desktop
  width it's still the 3-column grid.
