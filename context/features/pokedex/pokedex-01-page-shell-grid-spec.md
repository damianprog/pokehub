# Spec — Pokédex 01 · Page shell + grid

> **Status:** spec / pre-implementation
> **Scope:** the new `/pokedex` route. It covers the page header (title, total count, "Surprise me"), a responsive grid of real Pokémon cards in dex order with each card's community rating, "Load more" pagination, a loading skeleton, and pointing every existing "Pokedex" link at the new route.
> **Out of scope:** search, all filters and the filter panel, active-filter chips, the "Showing N of 1,025" line, the no-results state, sort, everything personal on cards (the "You rated" line, favorite/wishlist indicators and hover buttons), and the mobile filters sheet. These are slices 02–07 in `overview.md`.

---

## 1. Goal & scope

Every "Pokedex" link in the app currently goes to `/discover`, which doesn't exist, or to a random Pokémon. This slice creates the page those links should open. It's the smallest version that is useful on its own: you can scroll through every Pokémon in dex order, see how the community rates each one, and click through to its detail page.

Source design: `PokeHub-Pokedex.dc.html`, as revised on 2026-09-25 after the first review pass (see `overview.md` §3). This slice uses the desktop signed-in and logged-out artboards (which look the same once personal data and filters are removed), the desktop and mobile loading artboards, and the mobile 375 page artboard.

The filter panel is **not** built as a static shell in this slice. It's much bigger than Rating 07's three sort chips. An inert panel of 18 type chips and three dropdowns would look finished while doing nothing, so it's left out until slice 03 makes it real.

---

## 2. Route & page structure

New route `src/app/(app)/pokedex/page.tsx`, inside the `(app)` route group. That means it inherits `Nav`, `.app-bg` and the shared container with no new layout code, like `/u/[username]` and `/p/[slug]`. `generateMetadata` gives a title along the lines of "Pokédex — PokeHub".

From top to bottom: the header row (§3), the card grid (§4), then the "Load more" control (§6). There's no breadcrumb, because the design has none and the page is top-level.

---

## 3. Header

- **Title and count.** A large "Pokédex" heading with the total number of Pokémon underneath ("1,025 Pokémon"). The number is a real count from the `Pokemon` table, not a hardcoded value, so it stays correct if the seed changes.
- **Surprise me.** A secondary, outlined button with a die glyph, right-aligned in the header row. It's a plain `<a>` to the existing `/api/pokemon/random`. That's the same full-navigation approach the signed-in nav's old "Browse" link used, so the redirect is followed and a new Pokémon is rolled on every click (see the 2026-09-02 history entry).
- **Search input.** The search field that sits between them in the design isn't rendered yet; slice 02 adds it. Nothing should leave an empty gap in its place.

On mobile the design stacks the header: title, count, then a full-width row with the (future) search field and an icon-only "Surprise me" square. This slice renders the icon-only "Surprise me" at mobile widths and the labeled button at desktop widths.

---

## 4. Card grid & card contents

The grid has six columns on desktop and two on mobile. In between, use whatever column step reads well (the landing `Trending` grid and profile `SignatureTeam` grid already collapse the same way). Cards are ordered by dex number ascending.

Each card is a new `PokedexCard` component, one per file per project convention. The whole card is a link to `/p/[slug]`. Its contents, top to bottom:

- **Artwork tile.** Square, with the official artwork centered on a radial gradient from `TYPE_GRADIENTS` for the Pokémon's primary type (fallback `FALLBACK_GRADIENT`). Use `next/image`, since the host is already allowed in `next.config.ts`. The revised design approximates the detail page's per-type colors with its own table. The code uses the real `TYPE_GRADIENTS` / `TYPE_BADGE_COLORS` maps instead of copying the design's hex values, so a small color difference from the artboard is expected and fine.
- **Dex number.** Zero-padded (`#006`), small and muted.
- **Name.** A single line, truncated with an ellipsis if too long.
- **Type badges.** Small uppercase pills using `TYPE_BADGE_COLORS`, like `PokemonHeader` but at the design's smaller card size.
- **Rating line, pinned to the bottom of the card.** When the Pokémon has at least one rating, show a partial-fill five-star row, the numeric average and the rating count. The count is written in full on desktop and shortened on mobile ("1.2k"). When it has zero ratings, show "No ratings yet" in muted italic instead.

Hovering a card on desktop lifts it slightly and brightens its border, as in the design. This is purely visual; the favorite/wishlist hover buttons belong to slice 06.

---

## 5. Data

**The page's Pokémon.** A new read function in `src/lib/pokemon.ts` returns the first `count` Pokémon in dex order (§6). It only selects the fields the card needs (id, slug, name, types, artwork URL), not full rows with base stats and flavor text.

**Community rating per card.** A new function in `src/lib/user-pokemon.ts` takes the page's Pokémon ids and returns each one's average and rating count. It's a single `groupBy` over `UserPokemon` limited to those ids and non-null ratings, using the same rule `getPokemonRatingStats` already applies. That avoids an N+1 of per-card stats calls. Ids with no ratings are simply missing from the result, and the card shows "No ratings yet". Averages stay in half-star units until display and go through `src/lib/rating.ts`, which owns the unit (project-overview §14), for both the numeric label and the star fill.

**Total.** A plain `count()` on `Pokemon` for the header (§3) and for `hasMore` (§6).

These run in parallel from `page.tsx`, except that the rating lookup has to wait for the page's ids. The page has no server action and no API route, like every other read-only page (project-overview §6.1).

---

## 6. "Load more"

This slice reuses Rating 09's growing-window mechanism rather than inventing a new one. A `count` search param says how many cards are shown. It starts at a default page size, grows by one page size per click, and falls back to the default when missing, non-numeric or non-positive.

The page size should fill whole rows at both six and two columns: 24 is four desktop rows and twelve mobile rows. `hasMore` is the total (§5) being greater than `count`.

The control is a real `Link` with `scroll={false}`, centered below the grid on desktop and full-width on mobile, and only rendered while `hasMore` is true. `LoadMoreReviews` already does this for reviews. When implementing, check whether it can be generalized into one shared component (href and label as props) rather than making a second copy. If the two turn out to differ in more than their href, keep them separate. There's no client component either way.

The URL only carries `count` this slice. Slices 02–05 add params that `count` must be carried alongside, and the href is built with `URLSearchParams` so that composes cleanly later (rating-09 §7).

---

## 7. Loading skeleton

A `loading.tsx` for the route renders the design's desktop and mobile loading artboards: the same header and a grid of placeholder cards with shimmering blocks where the artwork, dex number, name and rating line go (type badges stay flat). It uses the same columns as the real grid (six on desktop, two on mobile) and enough placeholder cards to fill the first screen. The design shows 12 on desktop and 6 on mobile, and there's no need to render a full 24-card page. The shimmer keyframe should come from `globals.css`: reuse the existing one if its behavior matches, otherwise add a new token next to it.

---

## 8. Pointing the links at `/pokedex`

- `Nav.tsx` (logged out) and `Hero.tsx`: `/discover` → `/pokedex`.
- `SignedInNav.tsx`: `/api/pokemon/random` → `/pokedex`. It becomes a normal `next/link` again, since the full-navigation `<a>` was only needed for the redirect. The random behavior now lives in the "Surprise me" button (§3).
- The breadcrumbs on `/p/[slug]` and `/p/[slug]/reviews`: the "Pokedex" crumb goes to `/pokedex`. The type crumb stays plain text until slice 03.
- **Active nav state.** The design highlights the Pokedex nav item while on `/pokedex`. The two navs do it differently: the signed-in nav puts a filled pill behind the link, like the other nav tabs, and the logged-out nav keeps a plain text link with a short brand-gradient underline beneath it. This is cheap to do. `Nav.tsx` is already a client component that reads `usePathname()`, and `SignedInNav` renders inside it, so both can check the path without restructuring anything. Only the Pokedex link gets an active state in this slice. Feed and Packs still point to `/`, and giving them active states is out of scope.

---

## 9. Mobile

The same page and components use responsive classes at the `md` breakpoint, not a separate mobile tree. The existing mobile nav collapse (logo + avatar) already matches the design's mobile header. The mobile-specific details are the icon-only "Surprise me" (§3), the two-column grid, the shortened rating count (§4) and the full-width "Load more" (§6).

---

## 10. Client/server split

Everything is a server component. This slice adds no client components.

---

## 11. Deliberate non-goals (this slice)

- Search, filters, the filter panel, active chips, the result-count line and the empty state are slices 02–04.
- Sort is slice 05. Dex order is the fixed order for now.
- The personal card layer (the "You rated" line, favorite/wishlist indicators and hover buttons, "My status") is slice 06.
- The mobile filters sheet is slice 07.
- Infinite scroll and cursor pagination are rejected for the same reasons as rating-09 §2 and §9.
- Fixing the nav search placeholder's "1,302" is noted in `overview.md` §3 and is not part of this slice.

---

## 12. Implementation order

1. Data: the paged Pokémon read and total count in `src/lib/pokemon.ts`, and the batched rating-stats function in `src/lib/user-pokemon.ts` (§5).
2. `PokedexCard` (§4).
3. `page.tsx`: read and validate `count`, fetch data, then render the header and grid (§2, §3, §5).
4. "Load more": generalize `LoadMoreReviews` or add a sibling component (§6).
5. `loading.tsx` skeleton (§7).
6. Repoint the links and add the Pokedex active state in both navs (§8).

---

## 13. Testing

Manual, in the browser:

- `/pokedex` shows the header with the real total and the first page of cards in dex order (#001 onward). Each card links to the right `/p/[slug]`.
- Pokémon with ratings show the correct average and count, cross-checked against their detail page's community rating card (e.g. Charizard, Pikachu). Unrated Pokémon show "No ratings yet".
- "Load more" appends the next page without jumping to the top, and repeated clicks eventually reach #1025 and the control disappears. `?count=bogus` and `?count=-5` fall back to the default.
- "Surprise me" lands on a different random Pokémon on each click.
- The logged-out nav "Pokedex", the hero "Pokedex", the signed-in nav "Pokedex" and the breadcrumb "Pokedex" on both detail-page routes all open `/pokedex`.
- On `/pokedex`, the signed-in nav shows the Pokedex pill and the logged-out nav shows the gradient underline. Neither appears on any other route.
- The loading skeleton appears on a slow load (throttled network) and doesn't shift the layout when content arrives.
- Screenshots at 375px, ~1366px and 1440px compared against the design artboards: six columns on desktop, two on mobile, icon-only "Surprise me" on mobile.
- Both signed-in and logged-out views render correctly, with no console errors. `npm run build` and `lint` pass (apart from the known `scripts/seed-pokemon.ts` lint errors).
