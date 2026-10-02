# Spec — Pokédex 03 · Type & generation filters

> **Status:** spec / pre-implementation
> **Scope:** the desktop filter panel on `/pokedex` with its Type chip row and a "Refine" row holding the Generation menu. Below it sit the active-filters row (one chip per active filter, including the search term) with "Clear all", and the "Showing N of 1,025" line. All of it is driven by URL params. The no-results state widens from search-only to filters, and the type crumb in the detail-page breadcrumbs links to a type-filtered Pokédex.
> **Out of scope:** the Rarity menu (slice 04), the Sort menu (slice 05), "My status" and the rest of the personal card layer (slice 06), and the mobile "Filters" button and bottom sheet (slice 07). The Refine row is built so these menus can drop in later, but it holds only Generation for now.

---

## 1. Goal & scope

Search (slice 02) finds one Pokémon you already know. Filters are for browsing: "show me every Ghost type" or "what came out in Gen 4". This slice adds the two filters people reach for first, type and generation, plus the shared pieces every later filter builds on: the panel, the active-filters row, "Clear all", the result count and the filter-aware empty state.

Source design: `PokeHub-Pokedex.dc.html` (revision of 2026-09-25). The relevant parts are the desktop artboards' filter panel and active-filters row, and the desktop and mobile no-results artboards. The mobile filters sheet artboards belong to slice 07.

---

## 2. URL state

Both filters live in search params, like `q`, `count` and Rating 08's `sort`. A filtered view is shareable, bookmarkable and survives reload and the back button.

- **`type`:** one or more lowercase type keys, comma-separated (for example `type=fire,dragon`). Keys are the ones the `Pokemon.types` column and `TYPE_BADGE_COLORS` already use. Unknown keys are dropped and duplicates collapse. If nothing valid is left, there's no type filter. Write the keys in a fixed order (the order of the chip row), so the same selection always produces the same URL.
- **`gen`:** a single whole number from 1 to 9. Anything else means "all generations".
- **Pagination.** Any filter change drops `count`, the same rule as a new search, so the results start from the first page. "Load more" carries `type` and `gen` forward along with `q`.
- **Params pass through.** Every control touches only its own param (plus dropping `count`). Toggling a type keeps `q` and `gen`, the search input keeps `type` and `gen` (slice 02 already built it this way), and slices 04–05 will add `rarity` and `sort` under the same rule.
- **Clean URLs.** No empty `type=`, and no `gen` when "All generations" is picked.

The parsing and validation of all Pokédex params should live in one place that the page uses (next to `normalizePokedexSearch`), not scattered across components.

---

## 3. Matching rules

- **Type, multiple selected:** a Pokémon matches if it has **any** of the selected types (OR). Selecting Fire and Dragon shows every Fire type and every Dragon type: Charmander (Fire only) and Dratini (Dragon only) both appear, and a Pokémon never needs to have all the selected types. OR is the recommendation because a Pokémon has at most two types: AND would return zero for any three selected types and only a handful for most pairs, which makes the chip row feel broken. The trade-off is that "show me exactly Fire/Flying" isn't possible. Revisit if that turns out to be a real need.
- **Generation:** `Pokemon.generation` equals the selected number.
- **Combining:** type, generation and search are ANDed together. "Ghost types in Gen 4 whose name contains 'mis'" works as expected.

Results stay in dex order. The filter conditions join the existing `pokedexSearchWhere` logic into one where-builder in `src/lib/pokemon.ts`, which the paged read and the match count both use, so the grid, "Load more" and the "Showing" count can't disagree. `Pokemon.generation` already has an index, and `types` filtering over ~1,000 rows needs none.

---

## 4. The filter panel (desktop)

A rounded card under the header, matching the design's panel. It has two rows separated by a hairline.

**Type row.** A small uppercase "Type" label on the left, then all 18 type chips wrapping onto as many lines as they need. Each chip is a type pill with a colored dot and the type name, in the type's badge colors from `TYPE_BADGE_COLORS`. A selected chip gets a stronger fill, a border in the type's color and white text, per the design. Clicking toggles that type. Chip order follows the design's order.

**Refine row.** A small uppercase "Refine" label, then the Generation menu. The row's right side stays empty for now. Sort lands there in slice 05.

**Generation menu.** A trigger button reading "Generation" in muted text followed by the current value ("All" or "Gen 4") and a caret. It takes the design's tinted purple active look when a generation is selected. It opens a dropdown listing "All generations" and then Gen 1 to Gen 9, each with its region name as a muted sub-line (Kanto, Johto, Hoenn, Sinnoh, Unova, Kalos, Alola, Galar, Paldea). The current choice gets a check mark. Picking an option applies it and closes the menu. Use the project's existing shadcn `DropdownMenu` (already used by `NavAvatarMenu`) rather than hand-rolling outside-click and keyboard handling. The generation list is a constant in `src/lib/`, not read from the database.

**Navigation behavior.** The same rules as the search input: a filter change updates the URL without a scroll jump and without the route's loading skeleton replacing the grid, and the grid dims while the new results load (reusing slice 02's `data-pending` dimming, or the equivalent for links). Unlike typing, a filter change is a deliberate single action, so it should **push** a history entry. Back undoes the last filter.

**Client/server.** Type chips can be plain links whose href is "the current URL with this type toggled". That works without JavaScript and needs no client state. The Generation menu needs a small client component for the dropdown, and its options can still be links. Keep the client surface small, as slice 02 did.

**Accessibility.** Type chips expose their selected state (for example `aria-pressed` on a button, or `aria-current` or a visually hidden "selected" on a link). The Generation trigger and options are keyboard-operable, which `DropdownMenu` provides.

---

## 5. Active-filters row & result count

A single row between the panel and the grid, as in the design.

**Chips.** One removable chip per active filter, in this order: each selected type (in the type's text color), then the generation ("Gen 4"), then the search term in curly quotes. Each chip has a small ✕ that removes only that filter. The search chip clears `q`, and the search input empties itself through its existing "re-sync when `q` changes from outside" path. Chips can be links, like the type toggles.

**"Clear all".** Shown only when at least one chip is. It goes to the bare `/pokedex`, clearing type, generation and search together.

**Count.** Right-aligned:
- no filters and no search: "Showing all 1,025",
- otherwise: "Showing N of 1,025", where N is the match count and 1,025 is the real unfiltered total.

The numbers are real and formatted with thousands separators. The row keeps its height when it holds only the count, so the grid doesn't shift as chips appear and disappear.

This row replaces slice 02's reliance on the search field's ✕ as the only way to clear a search from the page.

---

## 6. No-results state

Slice 02 built a search-only empty card. It now covers filters too, with copy chosen by what's active:

- **Search only:** unchanged from slice 02 (No Pokémon match "xyz", spelling hint, "Clear search").
- **Any filter active (with or without a search):** the design's "No Pokémon match these filters", the help line "Try removing a filter, or search by name or dex number instead." and a "Clear all" button linking to `/pokedex`.

The panel, the active-filters row (showing "Showing 0 of 1,025") and the search field stay visible above the card, so the user can remove one filter instead of starting over. "Load more" doesn't render.

---

## 7. Breadcrumb type crumb

The type crumb in the breadcrumbs on `/p/[slug]` and `/p/[slug]/reviews` is plain text today. It becomes a link to `/pokedex?type={primary type}`, the same type the crumb already shows. `Breadcrumb` already supports linked items, so this only changes the items passed in.

---

## 8. Mobile

The design doesn't show the desktop panel on mobile. Its mobile filtering UI is the "Filters" button and bottom sheet, which is slice 07. Until then:

- **Hidden on mobile:** the filter panel (below the `md` breakpoint).
- **Shown on mobile:** the active-filters row, laid out as in the mobile artboard. Chips go on one horizontally scrollable line that bleeds to the screen edges, with "Clear all" at its end, and the "Showing" line sits on its own row underneath. A filtered URL (from a shared link or a breadcrumb crumb) shows its chips and can be cleared on a phone.
- **No-results card:** the mobile layout with the full-width button, per the mobile artboard.

So between this slice and slice 07, a phone user can't add a type or generation filter from the page itself, only arrive at one through a link. That's an accepted temporary gap, not a bug.

---

## 9. Loading skeleton

`loading.tsx` renders the header and must now also reserve the panel's space on desktop and the active-filters row's height at both widths, so nothing jumps when the page arrives. Same-sized placeholder blocks are enough. The real chips don't need to render in the skeleton.

---

## 10. Deliberate non-goals (this slice)

- **Rarity, Sort and My status menus:** slices 04, 05 and 06. Don't render placeholders for them.
- **AND matching for types,** or an "exact dual type" mode (§3).
- **Per-option counts** in the type chips or the generation menu ("Fire · 64").
- **Filtering by alternate forms or regional variants.** The seeded data has one row per species, and `generation` is the species' generation.
- **The mobile filters sheet** and its "Filters" count badge (slice 07).

---

## 11. Implementation order

1. Param parsing and validation for `type` and `gen`, next to the search normalizer (§2).
2. Data: one where-builder combining search, type and generation, used by the paged read and the match count (§3).
3. `page.tsx`: read the new params, pass them through, carry them in "Load more".
4. The active-filters row and the count (§5), at both widths.
5. The filter panel: the type chip row, then the Generation menu (§4).
6. The widened no-results state (§6).
7. The breadcrumb crumb links (§7).
8. The loading skeleton (§9).

---

## 12. Testing

Manual, in the browser, plus direct-URL edge cases:

- Clicking a type chip filters the grid, marks the chip selected, adds a chip to the active row and updates the count. Clicking it again undoes all three. Selecting two types shows Pokémon of either type.
- Picking "Gen 1" shows exactly #001–#151 in dex order, with a "Gen 1" chip and the trigger in its active look. "All generations" removes it.
- Filters combine with search: typing in the search keeps the type/gen params, and toggling a type keeps `q`. The search chip appears, and its ✕ clears both the chip and the field.
- "Clear all" returns to the bare `/pokedex` with an empty search field.
- "Load more" inside a filtered view keeps every param, and changing any filter resets to the first page.
- Each filter change adds one history entry. Back steps through them, and the panel, chips and field all reflect the restored URL. No scroll jump, and no skeleton replacing the grid.
- A combination with no matches shows "No Pokémon match these filters", and its "Clear all" works. A search-only miss still shows slice 02's copy.
- Bogus params fall back cleanly: `type=fire,banana,fire` behaves as `type=fire`, while `type=banana`, `gen=0`, `gen=10` and `gen=abc` behave as no filter.
- The type crumb on a detail page and on its reviews page links to the Pokédex filtered by that type.
- At 375px the panel is hidden, while a filtered URL shows the scrollable chip row and the "Showing" line, and the chips can be removed.
- Screenshots at 375px, ~1366px and 1440px compared against the design artboards, signed in and logged out, with no console errors. `npm run build` and `lint` pass (apart from the known `scripts/seed-pokemon.ts` lint errors).
