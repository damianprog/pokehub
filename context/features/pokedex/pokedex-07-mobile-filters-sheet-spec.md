# Spec — Pokédex 07 · Mobile filters sheet

> **Status:** spec / pre-implementation
> **Scope:** on mobile, a "Filters" button with a count badge opens a bottom sheet holding every filter the desktop panel has: Type, Generation, Rarity and, signed in, My status. Choices are a draft inside the sheet and apply together on "Show N Pokémon", whose number tracks the draft live.
> **Out of scope:** any change to the desktop filter panel, search and sort (both keep their own controls), swipe-to-dismiss, and a history entry for the open sheet.

---

## 1. Goal & scope

Since slice 03, mobile visitors can see and remove active filters as chips, but they can't add one. The only way to a filtered mobile Pokédex today is a shared link. This slice closes that gap and finishes the Pokédex slice plan.

Source design: `PokeHub-Pokedex.dc.html`, the "Mobile · filters sheet · signed in" and "Mobile · filters sheet · logged out" artboards, plus the "Mobile · 375" artboard for the Filters button.

Mobile only. The sheet's trigger lives in the mobile-only row, so at the `md` breakpoint and up nothing changes.

---

## 2. The Filters button

- Sits on the left of the existing mobile sort row (`PokedexMobileSortRow`), with the sort button staying on the right. A filter-lines icon, then "Filters".
- **Count badge.** A small brand-gradient pill after the label, shown only when at least one filter is active. The number counts what the sheet controls: one per selected type, plus one each for generation, rarity and status.
- **Deviation from the design:** the prototype's badge also counts the search term, because it reuses the chip count. Here search is left out. The search field sits right above the button, the sheet can't change it, and a badge reading "1" over a sheet with nothing selected would be confusing. The chip row still shows the search term as before.
- **Loading skeleton:** the row shows a disabled Filters button with no badge next to the disabled sort button, so the row doesn't shift when the page arrives.

---

## 3. The sheet

**Component.** shadcn's Sheet (Base UI Dialog), added through the shadcn CLI since `src/components/ui` doesn't have it yet. It gives the focus trap, Escape to close, scroll lock and the backdrop. Nothing else gets added. Base UI's Drawer also exists and would make the drag handle work, but swipe gestures are out of scope, so the plain Sheet is enough.

**Layout, top to bottom,** per the artboards:

| Part | Content |
|---|---|
| Handle | The small grab bar. Decorative only here. |
| Header | "Filters" title and a ✕ close button, with a divider under it |
| Body (scrolls) | The sections below, each with a small uppercase label |
| Footer (pinned) | "Reset" on the left, the primary "Show N Pokémon" button filling the rest |

The sheet rises from the bottom and covers almost the whole screen, leaving a strip of the dimmed page visible at the top. The footer stays pinned while the body scrolls, and it respects the phone's bottom safe area.

**Sections:**

| Section | Control | Options |
|---|---|---|
| Type | The 18 type chips in `POKEDEX_TYPES` order, wrapping. Multi-select. | Every type, in its badge color with a colored dot. Selected chips get a stronger tint and a border in the type color. |
| Generation | 5-column option grid. Single choice. | "All", then "1" to "9". The region names aren't shown, but each option's accessible name includes the region ("Generation 1, Kanto"). |
| Rarity | 2-column option grid. Single choice. | "All", Common, Uncommon, Rare, Ultra rare, with the sub-lines from `POKEDEX_RARITIES` (so Uncommon reads "Final-stage starters…", as decided in slice 04). |
| My status | 2-column option grid. Single choice. Signed in only. | "All", Rated, Not rated, Favorites, Wishlist, from `POKEDEX_STATUSES`. |

Selected options in the grids use the design's green tint and border. Every list comes from `pokedex-filters.ts`, so the sheet can't drift from the desktop menus.

**Semantics.** Type chips are toggle buttons that announce their pressed state. Each grid is a single-choice group that announces the selected option.

---

## 4. Draft state and applying

This is the main difference from every filter control so far: the desktop chips and menus are links that apply immediately, while the sheet edits a draft.

- **Opening** copies the URL's current filters (types, generation, rarity, status) into the draft.
- **Tapping** a chip or option changes only the draft. The URL and the grid behind the sheet stay as they are.
- **"Show N Pokémon"** pushes one URL built with `pokedexHref` from the draft, keeping the current search term and sort and dropping `count`, then closes the sheet. It's a push, not a replace, the same as tapping a filter link today, so Back undoes it. While the navigation is pending, the grid dims through the existing `data-pending` mechanism.
- **Reset** clears the draft's filters only. It doesn't apply, it doesn't close the sheet, and it leaves search and sort alone, because neither appears in the sheet. That's deliberately narrower than the chip row's "Clear all", which resets everything to a bare `/pokedex` (slice 05).
- **Closing any other way** (✕, backdrop tap, Escape) throws the draft away. Reopening starts from the URL again.
- If the draft equals the current URL, "Show" just closes the sheet without navigating.

---

## 5. The "Show N" count

The button's number reflects the draft, which by definition isn't in the URL yet, so the server page can't supply it. Decision: **a read-only server action**, `countPokedexMatches`, returns the match count for a draft.

**Why an action and not the alternatives:**

| Option | Verdict |
|---|---|
| GET route handler | Rejected (decided during implementation). Requests could run in parallel and be aborted, but the client side needed a debounce, abort handling and bookkeeping for stale responses. That's too much code for a number on a button. |
| Server action | **Chosen.** It's called like a plain function, the same way every other client call in the project works. Next.js runs a client's actions one at a time, so responses come back in tap order and the last one always matches the last draft. That needs no debounce or abort. The cost: a quick run of taps queues a few counts, so the number can lag briefly behind the draft. Accepted. |
| Drop the number ("Show results") | Rejected. The number is the useful part: it tells you before you apply that a combination is empty. |

**The action.**
- It takes the draft as a query string built by `pokedexQuery` (extracted from `pokedexHref`, so the page URL and the action's input are built the same way). It validates that string with Zod, parses it with `parsePokedexFilters` so anything bogus is ignored the same way as on the page, and returns the count from the existing `getPokedexMatchCount`. That means the sheet's number and the page's "Showing N of" can never disagree.
- `status` only counts for a signed-in viewer, read from the session on the server. As on the page, a logged-out call drops it and no client-sent user id is trusted.
- Read-only, so it revalidates nothing. Thin wrapper, per `project-overview_8.md` §6.1: validate, call the existing domain function, return `{ success, data, error }`. No new query logic.

**On the client.**
- When the sheet opens, the number comes from the page (it already knows `matches`), so opening calls nothing.
- Each draft change calls the action. While a call is running, the button shows the previous label in a subtle pending style and stays tappable. Applying never waits for the count.
- If the call fails (through `runAction`, like every other call site), the button falls back to "Show Pokémon" with no number and still applies.

**Label rules:**

| Draft | Label |
|---|---|
| No filters and no search term | "Show all 1,025" (the real total) |
| Anything narrowing, including only a search term carried over from the URL | "Show N Pokémon", with N formatted like the count line ("1,024") |
| A combination that matches nothing | "Show 0 Pokémon", still enabled. Applying lands on the existing no-results card, which offers "Clear filters". |

---

## 6. Interplay with what exists

- **Chips row and "Showing N of"** are unchanged. They describe the URL, not the draft.
- **Sort** keeps its own button and isn't in the sheet. Applying the sheet preserves it.
- **Search** keeps its field. Applying preserves the term, and the count includes it.
- **Logged out:** no My status section. A `status` param from a shared link is already dropped by the page, so it can't reach the draft.
- **Signed in, a shared `?status=` link:** the sheet opens with that status selected, and it can be changed or reset there. The removable chip from slice 06 still works too.

---

## 7. Deliberate non-goals (this slice)

- **Swipe-to-dismiss** and a working drag handle.
- **Back closing the sheet.** Opening the sheet adds no history entry, so Back while it's open leaves the page as it does today.
- **Per-option counts** in the sheet ("Fire · 72").
- **Search or sort inside the sheet.**
- **Any desktop change,** including turning the desktop panel into a draft model.

---

## 8. Implementation order

1. `pokedexQuery` and the count server action (§5).
2. Add shadcn's Sheet to `src/components/ui`.
3. The sheet's markup: header, sections, footer, both signed-in and logged-out (§3).
4. Draft state, Reset, applying and dismissing (§4).
5. The live count on the Show button, with its pending style and fallback (§5).
6. The Filters button with its badge in `PokedexMobileSortRow`, and its disabled skeleton state (§2).

---

## 9. Testing

Manual, in the browser at 375px, signed in and logged out, plus direct-URL edge cases:

- **Button:** the badge shows the right number for types, generation, rarity and status combined, and no badge with only a search term. The skeleton row matches the loaded row's layout.
- **Sheet:** opens from the button. ✕, backdrop and Escape close it. Focus is trapped while open and returns to the Filters button after closing. The page behind doesn't scroll. The body scrolls with the footer pinned.
- **Sections:** logged out shows no My status section. Signed in shows it. Opening reflects the current URL, including a filter from a shared link.
- **Draft:** taps change nothing behind the sheet. Closing without applying leaves the URL untouched, and reopening shows the URL's state again.
- **Count:** after a series of quick taps, the final number matches the last draft. Every number checked matches the "Showing N of" line after applying. A search term in the URL is included. A combination with no matches shows "Show 0 Pokémon". With the action request blocked, the label falls back to "Show Pokémon" and applying still works.
- **Apply:** the URL holds the draft plus the existing search and sort, with no `count`. Back returns to the previous filters. The grid dims during the navigation.
- **Reset:** clears all four sections, keeps the sheet open, and the label becomes "Show all 1,025" (or "Show N Pokémon" with a search term). Applying after Reset keeps search and sort.
- **Bogus input:** a query with bogus params is counted as if they weren't there, and a logged-out `status` doesn't change the count.
- **Desktop at ~1366px and 1440px:** no Filters button, and the panel is unchanged.
- Screenshots against both sheet artboards, with no console errors. `npm run build` and `lint` pass, apart from the known `scripts/seed-pokemon.ts` errors and `src/auth.ts` warning.
