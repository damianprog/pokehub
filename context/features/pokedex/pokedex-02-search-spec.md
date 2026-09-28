# Spec — Pokédex 02 · Search

> **Status:** spec / pre-implementation
> **Scope:** a search input on `/pokedex` that narrows the grid by name or dex number, driven by a URL param. Load more keeps working inside the search results, and there's a no-results state for a search that matches nothing. The header layout moves to the design's final shape, with the input next to "Surprise me".
> **Out of scope:** type, generation and rarity filters, the filter panel, active-filter chips (including the design's search chip), "Clear all", the "Showing N of 1,025" line, sort, the personal card layer and the mobile filters sheet. These are slices 03–07 in `overview.md`. The nav's own search box ("Search 1,302 Pokémon, lists, people…") is a separate, site-wide search and is not touched.

---

## 1. Goal & scope

Slice 01 made the whole Pokédex browsable, but finding one Pokémon still means scrolling or pressing "Load more" dozens of times. This slice adds the fastest way in: type part of a name or a dex number and the grid narrows to the matches.

Source design: `PokeHub-Pokedex.dc.html` (revision of 2026-09-25). The search field appears in every artboard. It sits in the header on desktop and in a row under the title on mobile. The no-results artboards (desktop and mobile) are used here in a search-only form (§6).

---

## 2. URL state

The search term lives in a `q` search param, the same "the URL is the state" approach as `count` and Rating 08's `sort`. A search is shareable and bookmarkable, and it survives a reload or the back button.

- **Validation.** Trim the value and cap its length at something generous (around 50 characters). A missing, empty or whitespace-only `q` means "no search", and the page behaves exactly as in slice 01.
- **Pagination.** `count` keeps its slice-01 meaning, but inside the search results. Changing the search term drops `count`, so each new search starts from the first page. "Load more" carries `q` forward. Its href is already built with `URLSearchParams` for exactly this reason (slice 01 §6).
- **Clean URLs.** The input never writes an empty `q=`. Clearing the search removes the param.

---

## 3. Matching rules

A single search term matches a Pokémon when any of the following is true:

- **Name contains the term**, case-insensitive. "chariz" finds Charizard, and "saur" finds all three Bulbasaur-line Pokémon.
- **Slug contains the term**, with spaces in the term treated as hyphens. Display names come from PokeAPI's localized names, so they include accents and punctuation ("Flabébé", "Mr. Mime", "Farfetch’d", "Nidoran♀"), while slugs are plain ASCII ("flabebe", "mr-mime", "farfetchd", "nidoran-f"). Matching both lets people find these Pokémon without typing the special characters.
- **Dex number equals the term**, when the term is a whole number. An optional leading "#" and leading zeros are accepted, so "25", "025" and "#025" all find Pikachu. A number matches exactly, not as a prefix: "25" finds #025, not #250–#259. A number is also matched as a name or slug, so "2" still finds Porygon2 alongside #002.

Results stay in dex order. Sort arrives in slice 05. The matching logic lives in one place in `src/lib/pokemon.ts`, and the paged read and the count both use it (§5), so the grid and `hasMore` can't disagree.

---

## 4. The search input

**Placement.**
- **Desktop:** between the title block and "Surprise me", at a fixed comfortable width (the design uses about a quarter of the content width).
- **Mobile:** the design stacks the header as title, count, then a full-width row holding the search field with the icon-only "Surprise me" square beside it. Slice 01 put the square next to the title, so it moves down into this row.

**Look.** A rounded, subtly filled field with a magnifier glyph on the left, styled like the design and like "Surprise me". The placeholder is "Search by name or dex number" on desktop and the shorter "Name or dex number" on mobile.

**Clear button.** A ✕ inside the field on the right, shown only while the field has text. It clears the search and keeps focus in the field. The design only draws the ✕ on desktop, but it's useful on mobile too, so show it at both widths.

**Behavior: live as you type.** The grid updates while the user types, after a short debounce (roughly 300 ms), without pressing Enter. This matches the design, where the input filters on every change. Things to get right:

- **Replace, don't push.** Update the URL with a history *replace*, so the back button doesn't step through every keystroke. It should leave the Pokédex, or go back to the previous full search.
- **No scroll jump.** Keep the scroll position, like "Load more" does.
- **The input owns its own text.** It starts from the URL's `q` but doesn't re-sync from the URL on every navigation. A slow response landing mid-typing must never overwrite characters, move the caret or steal focus. It only re-syncs when `q` changes from outside, such as the back button or the empty state's "Clear search".
- **Enter.** Pressing Enter applies the search immediately instead of waiting for the debounce. The field sits inside a GET form targeting `/pokedex`, so without JavaScript Enter still performs a normal search.
- **Keep the other params.** Changing the search only touches `q` (and drops `count`, per §2). Slices 03–05 will add params that must pass through untouched.

**Pending feedback.** While a new search is loading, the current grid can dim slightly (a transition's pending flag is enough). The route's `loading.tsx` skeleton should *not* replace the grid on every keystroke. Slice 01 verified that "Load more" navigations don't show it, so check that search navigations don't either.

**Accessibility.** The input needs an accessible label, since the placeholder isn't one, and `type="search"`. The ✕ is a real button with an accessible name.

This is the Pokédex's first client component. It stays small: the input and its URL syncing, nothing else. The page, the grid and the cards remain server components.

---

## 5. Data

`src/lib/pokemon.ts`:

- **Paged read.** The slice-01 paged read takes the optional search term and applies the §3 conditions. It still selects only the fields a card needs.
- **Count of matches.** There's a count of matching Pokémon, next to the unfiltered total. The **header keeps showing the unfiltered total** ("1,025 Pokémon"), as in every design artboard. The match count drives `hasMore` and the empty state.
- **Arguments.** Both functions take plain string and number arguments, so React `cache()` works on them (unlike the array-argument helpers fixed in slice 01).

Ratings are unchanged: the batched rating lookup runs over whichever ids the page ends up with.

A search over ~1,000 rows with `contains` doesn't need an index or full-text search. Postgres full-text search (project-overview §12) is for the site-wide search, not this.

---

## 6. No-results state

A search that matches nothing needs a proper state, not an empty grid. The overview currently places the no-results state in slice 03, but search is the first thing that can produce zero results, so a search-only version is pulled forward into this slice. Slice 03 then widens it to cover filters.

Use the design's no-results card: a dashed, muted panel with a large magnifier glyph, a heading, one line of help text and a gradient button. For this slice, word it for search:

- **Heading:** something like: No Pokémon match "xyz".
- **Help text:** a short hint to check the spelling or try a dex number.
- **Button:** "Clear search". It's a link to `/pokedex`, so it needs no client code.

The header and the search field stay visible above it, still holding the term, so the user can just edit it. "Load more" doesn't render, since `hasMore` is false.

---

## 7. Loading skeleton

`loading.tsx` renders the header, so the header's new shape needs to appear there too. Render the search field in the skeleton, either inert or as a same-sized placeholder box, so nothing shifts when the page arrives. On mobile the header now has an extra row, and the skeleton must match it.

---

## 8. Mobile

Same components, with responsive classes at the `md` breakpoint as in slice 01. The mobile-specific details:

- the header restack (search row with the "Surprise me" square, §4),
- the shorter placeholder,
- the no-results card with slightly tighter padding, per the mobile artboard.

---

## 9. Client/server split

- **Client:** the search input only (§4).
- **Server:** everything else, including the no-results state and "Load more". The page reads `q` and `count` from its search params, as it already reads `count`.

---

## 10. Deliberate non-goals (this slice)

- **Search chip, "Clear all" and "Showing N of 1,025":** these belong to the active-filters row built in slice 03. The ✕ in the field is the only way to clear the search from the UI until then, plus the empty state's button.
- **Fuzzy or typo-tolerant matching,** such as "charzard" finding Charizard. Substring plus slug matching covers the common cases. Revisit only if it turns out to be a real problem.
- **Searching types, abilities or flavor text.** Types are a filter (slice 03).
- **Autocomplete or a suggestions dropdown.** The grid itself is the result list.
- **Keyboard shortcut to focus the search** ("/").

---

## 11. Implementation order

1. Data: the §3 matching in `src/lib/pokemon.ts`, the search-aware paged read and the match count (§5).
2. `page.tsx`: validate `q`, pass it to the data functions, base `hasMore` on the match count and carry `q` in "Load more" (§2).
3. The no-results state (§6).
4. The search input client component and the header relayout at both widths (§4, §8).
5. The loading skeleton header (§7).

---

## 12. Testing

Manual, in the browser, plus a direct-URL check of the edge cases:

- Typing "chariz" narrows the grid to Charizard without pressing Enter. The URL gains `q=chariz` with no new history entry per keystroke, and the page doesn't scroll.
- Name matching is case-insensitive ("PIKA" finds Pikachu), and a partial name finds multiple ("saur" finds #001–#003).
- Dex numbers work: "25", "025" and "#025" each find exactly Pikachu, and "2" finds #002 as well as Porygon2.
- Special-character names can be found without the special characters: "flabebe", "mr mime", "farfetchd".
- A search with more than 24 matches shows "Load more", and clicking it keeps `q` in the URL and grows the results. A search with 24 or fewer hides it. Editing the search after "Load more" resets back to the first page.
- A search with no matches shows the no-results card. "Clear search" returns to the full Pokédex, and the field empties.
- The ✕ clears the field and the search at both widths. An empty field leaves no `q` in the URL.
- Typing fast never drops characters, jumps the caret or loses focus while results load. The loading skeleton doesn't replace the grid between keystrokes.
- Reloading `/pokedex?q=chariz` shows the field pre-filled and the filtered grid. The back button restores a previous full search. `q` made only of spaces, or a very long `q`, falls back cleanly.
- Pressing Enter applies the search immediately.
- Screenshots at 375px, ~1366px and 1440px compared against the design artboards: the desktop header with the field between title and "Surprise me", and the mobile search row with the "Surprise me" square. Check signed in and logged out, with no console errors. `npm run build` and `lint` pass (apart from the known `scripts/seed-pokemon.ts` lint errors).
