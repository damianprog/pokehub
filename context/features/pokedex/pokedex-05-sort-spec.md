# Spec — Pokédex 05 · Sort

> **Status:** spec / pre-implementation
> **Scope:** a Sort menu with four orderings (Dex number, Name A–Z, Highest rated, Most rated), driven by a `sort` URL param. It sits on the right of the desktop Refine row, and on mobile as a standalone sort button above the chip row. It works with search, every filter and "Load more".
> **Out of scope:** "My status" and the personal card layer (slice 06), the mobile "Filters" button and sheet (slice 07), sort directions or extra orderings beyond the design's four, and any change to how cards show their rating.

---

## 1. Goal & scope

The grid is in dex order today, which is fine for browsing but can't answer "what does the community rate highest?" or "what's everyone rating?". That's the Letterboxd question this page exists for. Sort adds those two answers, plus alphabetical order for people who know the name but not the number.

Dex number and Name A–Z are plain database orderings. The two rating sorts are the real work in this slice: Prisma can't order Pokémon by an aggregate over their ratings, so they need their own read path (§4).

Source design: `PokeHub-Pokedex.dc.html` (revision of 2026-09-25), the desktop Refine row's Sort menu and the mobile artboard's sort button.

---

## 2. URL state

- **`sort`:** one of `name`, `highest-rated` or `most-rated`. Dex order is the default and is never written to the URL. Anything else, including `dex`, an empty value or a wrong case, means dex order. This follows Rating 08's `sort` param on the reviews page.
- **Parsing** lives in `src/lib/pokedex-filters.ts` next to the other params. One list holds each option's URL key and its menu label, the same way `POKEDEX_RARITIES` does, so the parser, the menu and `pokedexHref` all read from it.
- **`PokedexFilters` gains a sort field.** It isn't a filter, but it's URL state that every Pokédex link has to carry, and `pokedexHref` already builds links from that object. `hasPokedexFilters` keeps ignoring it (§5).
- **Links.** `pokedexHref` writes `sort` only when it isn't the default. "Load more", the type chips, the Generation and Rarity menus, every chip's ✕ and the search input all carry it forward. The search input already keeps params it doesn't know, so it needs no change.
- **A sort change drops `count`.** A new order starts again from the first page, the same rule as a filter change.

---

## 3. The orderings

Each ordering is a complete, deterministic order. Dex number is the final tiebreak everywhere, so two loads of the same URL always return the same sequence.

| Option | Order | Tiebreaks |
|---|---|---|
| Dex number (default) | Dex number ascending | — |
| Name A–Z | Display name ascending, using the database's ordering | Dex number |
| Highest rated | Average community rating, highest first | More ratings first, then dex number |
| Most rated | Number of ratings, most first | Higher average first, then dex number |

**What counts as a rating.** It's the same thing the card shows: a `UserPokemon` row whose `rating` is set. A review whose rating was cleared doesn't count. The average uses the raw half-star values, as `getRatingSummaries` does, not the rounded number on the card.

**Unrated Pokémon go last** in both rating sorts, in dex order. Today that's almost the whole list. "Highest rated" is a short run of rated Pokémon followed by the plain Pokédex, and that's expected, not a bug.

**No minimum-ratings threshold.** A Pokémon with a single 5★ rating ranks above one with a hundred ratings averaging 4.9. Letterboxd-style weighting (a minimum count or a Bayesian average) would empty the list at today's volumes. It's listed as a non-goal (§8) to revisit once there's real data.

**Name A–Z and special names.** Names like "Mr. Mime", "Nidoran♀" and "Flabébé" sort wherever Postgres's collation puts them. This slice doesn't add custom normalization.

---

## 4. Reading a rating-sorted page

Prisma can order by a relation's `_count`, but it can't restrict that count to rows with a rating, and it can't order by a relation's average at all. Both rating sorts therefore use one separate read path inside the existing `getPokedexPage`, so the page component doesn't change:

1. **Rating stats.** One `groupBy` over `UserPokemon` gives the count and average of non-null ratings per Pokémon, for rated Pokémon only. The aggregation runs in the database, and the result can never exceed the size of the catalogue (~1,025 rows), however many ratings exist.
2. **Matching ids.** The ids of every Pokémon that matches `pokedexWhere`, in dex order. That's at most ~1,025 integers, and it reuses the existing where-builder, so search and filters behave exactly as in the other sorts.
3. **Order and slice.** Sort the matching ids per §3 in application code (rated first by the chosen key, unrated after in dex order), then take the first `count`.
4. **Rows.** Fetch the full card rows for those ids and return them in the computed order.

**Why not raw SQL.** A single SQL query with a join and `ORDER BY AVG(...)` would be one round trip, but it would mean rewriting `pokedexWhere` (search escaping, slug matching, types, generation, rarity) in SQL next to the Prisma version. Two copies of the filter logic would drift apart. The Pokédex is a fixed-size catalogue, so working with every matching id in memory is cheap and stays cheap.

**Pagination stays stable.** "Load more" asks for a larger `count` and re-renders the whole list from the top, rather than fetching an offset page. Combined with the deterministic order, there's no way to get duplicates or gaps between pages. If someone rates a Pokémon between two clicks, the list simply reflects the new order.

**The card ratings.** The page still calls `getRatingSummaries` for the visible cards, exactly as now. Reusing step 1's stats for the cards is a possible later optimization, not part of this slice.

Dex number and Name A–Z stay on the normal single `findMany`, with only the `orderBy` changing.

---

## 5. Not a filter

Following the design, sort isn't a filter:

- **No chip.** The active-filters row doesn't show the sort.
- **No count line.** On its own, a non-default sort doesn't switch on "Showing N of 1,025" and doesn't trigger the match count, since it doesn't narrow the list.
- **"Clear all" resets the sort too.** "Clear all" and the no-results card's button keep linking to a bare `/pokedex`, so they return to dex order along with clearing every filter and the search. Decided at review: the design's prototype keeps the sort on "Clear all", but one link back to the plain Pokédex is simpler and predictable. Neither link changes in this slice.
- **The trigger never tints.** Generation and Rarity get the tinted active look when narrowed. Sort always uses the neutral look, whichever option is picked, as in the design.

---

## 6. The Sort menu

**Desktop.** At the far right of the Refine row, pushed there by a spacer after the Rarity menu. The trigger reads a muted "Sort" label, the current option ("Dex number", "Name A–Z", "Highest rated" or "Most rated") and a caret. The dropdown opens aligned to the trigger's right edge and is narrower than the Generation and Rarity dropdowns. Options have no sub-lines.

**Mobile.** Below the search row and above the chip row, a row holding a sort button on its right. Slice 07 adds the "Filters" button on the left of the same row. Until then the row only contains the sort button, which is enough on its own: sort is a single control, not the sheet's multi-section form. The mobile trigger shows only the current value and a caret, without the "Sort" label. Its dropdown also opens right-aligned, with taller rows suited to touch. The desktop panel stays hidden on mobile, as before.

**Behavior** is the same as the other Refine menus. The current option has the check mark. Picking an option applies it, closes the menu, pushes a history entry and keeps the scroll position, and the grid dims while the new order loads. Picking the current option does nothing.

**One shared menu component.** `PokedexRefineMenu` already covers this once it gains two options: which edge the dropdown aligns to, and a compact trigger without the label for mobile. The option list is built on the server, like Generation's and Rarity's. How the mobile row is split into components (one per file) is left to the implementer.

**Accessibility (bundled in, as proposed at review).** The slice 04 review noted that the Refine menus use plain menu items, so screen readers don't announce the selected option. All three menus now go through this one component, and sort is the most "pick one of N" of them, so this slice switches the component to radio items with the current option checked. The visible check mark stays as it is. If review prefers to keep this separate, it drops out of the slice without affecting anything else.

---

## 7. Loading skeleton

The inert desktop panel renders a disabled Sort menu at the right end of its Refine row, and the skeleton renders the mobile row with a disabled sort button, so neither layout shifts once the page loads. Both show the default label.

---

## 8. Deliberate non-goals (this slice)

- **A minimum-ratings threshold or weighted average** for "Highest rated" (§3). Revisit once ratings exist in meaningful numbers.
- **Reverse directions** (Z–A, lowest rated, least rated). Not in the design.
- **Sorting search results by relevance.** Search results follow the selected sort like any other result set.
- **A sort chip,** or counting the sort in slice 07's filter-count badge.
- **Showing the sort key on cards** (for example, highlighting the rating count under "Most rated"). Cards stay as they are.
- **Custom name collation** for accented or symbol names.

---

## 9. Implementation order

1. The sort option list, `sort` parsing, the `PokedexFilters` field and `pokedexHref` support in `pokedex-filters.ts` (§2).
2. Dex number and Name A–Z ordering in `getPokedexPage` (§3).
3. The rating-sort read path for Highest rated and Most rated (§4).
4. `PokedexRefineMenu`: right alignment, the compact trigger and radio items (§6).
5. The desktop Sort menu in the Refine row, then the mobile sort row (§6).
6. The skeleton's disabled sort controls (§7).

---

## 10. Testing

Manual, in the browser, plus direct-URL edge cases:

- **Name A–Z** starts with Abomasnow, Abra, Absol… and stays alphabetical across "Load more".
- **Highest rated** lists the rated Pokémon first, by average, with ties broken by rating count and then dex number. These are checked against hand-computed values from the database, the same way Rating 02 was verified. Unrated Pokémon follow in dex order, starting at Bulbasaur unless it's rated.
- **Most rated** orders by rating count, with ties broken by average and then dex number. A Pokémon with a written review but a cleared rating isn't counted.
- **Pagination:** under both rating sorts, clicking "Load more" across the rated/unrated boundary gives no duplicates and no gaps, and the first 24 cards are the same before and after the click.
- **Combinations:** sort works with search, types, generation and rarity (for example Fire + Highest rated, or `q=char` + Name A–Z). Every control keeps `sort` in the URL, and changing it drops `count`.
- **Not a filter:** a sort on its own shows no chip and no "Showing N of" line. "Clear all" and the no-results button reset the filters, the search and the sort, landing on a bare `/pokedex`.
- **History:** each sort change adds one history entry, Back restores the previous order, and the scroll position stays put.
- **Bogus values** (`sort=dex`, `sort=NAME`, `sort=rating`, empty) give dex order, and the menu shows "Dex number".
- **Mobile at 375px:** the sort button works, its dropdown fits on screen right-aligned, and it combines with a filter chip from a shared link.
- **Accessibility:** the selected option is announced as checked in all three Refine menus. Generation and Rarity behave as before.
- Screenshots at ~1366px and 1440px compared against the design's Refine row, plus 375px against the mobile artboard, signed in and logged out, with no console errors. `npm run build` and `lint` pass (apart from the known `scripts/seed-pokemon.ts` errors and the `src/auth.ts` warning).
