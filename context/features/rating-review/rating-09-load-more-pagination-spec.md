# Spec — Rating 09 · Load more pagination

> **Status:** spec / pre-implementation
> **Scope:** a real "Load more" control on `/p/[slug]/reviews`'s non-pinned review list, growing how many reviews are shown per click while respecting whichever sort (Rating 08) is currently active — no API route, no client-side fetch, the same server-rendered "URL is the whole state" pattern Rating 08 already established for sort.
> **Out of scope:** infinite scroll / auto-loading on viewport intersection, true keyset/cursor pagination, changing the header's total review count, changing anything about sort itself.

---

## 1. Goal & scope

Rating 07 deliberately shipped `/p/[slug]/reviews` with an unpaginated fetch, reasoning that an inert "Load more" button would misleadingly imply hidden content when the page already showed everything (rating-07 §9). Rating 08 then flagged that composing sort with a future paginated fetch was left open (rating-08 §9). This slice closes both: the non-pinned list now fetches a bounded window, and a real "Load more" control grows that window without discarding whatever sort is active.

---

## 2. Growing-window pagination via a `count` param, not true cursor/keyset

The chosen mechanism is a single `count` search param on `/p/[slug]/reviews` describing how many non-pinned reviews are currently shown, starting at a default page size and growing by one page size per click — not true keyset/seek pagination keyed off the last row's sort values.

True keyset pagination needs a cursor comparison tailored to each of the three orderings Rating 08 built: a plain `reviewedAt` cursor for Newest, but a `(rating, reviewedAt)` tuple comparison for Highest/Lowest. That's meaningfully more WHERE-clause complexity for a page whose real review counts per Pokémon are still small (rating-07 §9 already made this observation). A single growing `count` sidesteps all of it: the same three `orderBy` variants Rating 08 already built, just capped differently each time.

**Accepted trade-off.** Classic offset-style pagination can shift result boundaries by one row if a new review is posted between two "Load more" clicks — under Newest, a brand-new review pushes everything down a slot, which can occasionally duplicate or skip a row right at the page boundary. Given today's review volumes and click cadence this is a rare, low-stakes edge case, the same category of accepted rough edge as this project's UTC-only streak day boundary (project-overview_8.md §14) — deferred until it's a demonstrated problem, not engineered around preemptively.

---

## 3. `count` param behavior & default page size

`count` is a positive integer. Missing, non-numeric, or non-positive values fall back to a default page size of 10 — the same validate-or-default treatment `sort` already gets (rating-08 §6), just for a number instead of an enum. "Load more" grows the current count by that same page size (10, 20, 30, …) each click.

No upper clamp is enforced: the query is naturally bounded by how many qualifying reviews actually exist for that Pokémon, and today's data is nowhere near large enough for an unbounded `count` to be costly. Revisit only if review volumes grow enough for that to change.

---

## 4. Interaction with sort (Rating 08)

The "Load more" link always carries the currently-active `sort` forward (when it isn't the default) alongside the grown `count`, so clicking it never silently resets the ordering.

The reverse isn't true, by design: a sort chip's link never includes `count` — Rating 08's chips already build their hrefs this way (`ReviewSortChips.tsx`), and nothing about this slice changes that. So switching sort always resets back to the default page size rather than carrying forward however many pages were loaded under the old order. Loading 30 "Highest rated" reviews and then clicking "Lowest rated" shows the first (default) page of the new order, not 30 rows of it — carrying a stale, order-mismatched batch into a newly-selected sort would be more confusing than restarting the count.

**Noted, not solved:** a viewer who has scrolled deep into an expanded list and then changes sort (collapsing the page back to the default size) can land with their scroll position past the end of the now-shorter list, looking at empty space. Flagged rather than engineered around this slice, the same treatment rating-01 gave its mobile touch-target note.

---

## 5. Detecting "is there more?" from `totalReviewCount`, not a sentinel row

`getAllReviews` already runs `totalReviewCount` (a `COUNT(*)` over every qualifying review, pinned one included) unconditionally in the same `Promise.all` as `otherRows`, for the header's "N reviews · average" line (rating-07 §4). Since that number already exists on every call, `hasMore` is derived from it rather than by over-fetching: `otherRows` is fetched with a plain `take: count` (no `+ 1`), and `hasMore` is `totalReviewCount > reviews.length + (ownReview ? 1 : 0)` — true whenever the total exceeds how many rows are currently displayed (the returned "other" rows plus the pinned own review, when present).

This is equivalent to the sentinel-row approach (fetch one extra row, trim it, compare lengths) for every case — anonymous viewer, signed-in viewer with a qualifying review, signed-in viewer without one — but without ever fetching a row that isn't shown. An initially-considered alternative, `take: count + 1` with a trimmed sentinel, was rejected once it became clear `totalReviewCount` already answers the same question for free.

`totalReviewCount` itself (the header's "N reviews · average" line) is untouched. It already counts every qualifying review including the pinned one, independent of how many rows are currently window-displayed, and continues to describe the Pokémon's true total regardless of pagination state.

---

## 6. Data layer changes

`getAllReviews(pokemonId, viewerId, sort, count)` gains a fourth parameter, defaulting to the page-size constant from §3, and `AllReviewsResult` gains `hasMore: boolean`. The `ownRowRaw` `findUnique` and the `totalReviewCount` count are untouched — neither has a windowing concept, the same reasoning rating-08 §6 already established for why sort doesn't touch them either.

`page.tsx` reads and validates `searchParams.count` the same way it already reads and validates `sort` (§3; rating-08 §6), and passes the validated value to `getAllReviews`.

---

## 7. "Load more" control

A new component (e.g. `LoadMoreReviews`), rendered by `PokemonReviewsList` directly after the mapped review cards, only when `hasMore` is true — never in the empty state, since that case always has `hasMore: false`. It's a real `Link` to `/p/[slug]/reviews` carrying `sort` (when non-default) and `count` (always — the control is only ever shown once more rows exist beyond the current count, which by then is always above the default), with `scroll={false}` for the same reason Rating 08's chips use it (rating-08 §3) — more important here, since this control sits at the bottom of a potentially long list, and the default post-navigation scroll-to-top would immediately throw the viewer back to the top of the page they just asked to see more of.

The href is built via `URLSearchParams` rather than the sort chips' manual string interpolation (`/p/${slug}/reviews?sort=${option}`). That approach works for exactly one always-or-never param; this control combines two (an optional `sort`, an always-present `count`), and hand-assembling that combination invites a stray `?`/`&`.

No new client component. This is a straight continuation of Rating 08's "the URL is the whole state" decision — an ordinary navigation re-runs the page with the larger `count` and returns the longer list.

---

## 8. Mobile

Same control, same mechanism, at both widths — not a viewport concern, consistent with rating-07 §10 and rating-08 §8.

---

## 9. Deliberate non-goals (this slice)

- **True keyset/cursor pagination** — deferred per §2; revisit only if review volumes or write concurrency make the offset trade-off actually bite.
- **Infinite scroll / auto-fetch on scroll position** — an explicit click keeps this a plain server-rendered link; no intersection observer, no client JS.
- **An upper clamp on `count`** — not needed at today's data scale (§3).
- **The sort-reset scroll-position rough edge (§4)** — flagged, not solved.
- **Anything about sort itself, or the header's total review count** — both untouched by this slice.

---

## 10. Implementation order

1. `AllReviewsResult` gains `hasMore`; `getAllReviews` gains a `count` parameter, `take: count` on the `otherRows` query, and `hasMore` computed from `totalReviewCount` (§5–§6).
2. `page.tsx`: read and validate `searchParams.count` the same way `sort` already is, pass the result through to `getAllReviews`.
3. `LoadMoreReviews` component, wired into `PokemonReviewsList` and rendered only when `hasMore` (§7).

---

## 11. Testing

Manual, in the browser:

- A Pokémon with more written reviews than the default page size → only the default count renders initially, "Load more" appears; clicking it once reveals the next batch appended below, with scroll position preserved (no jump to top).
- Clicking "Load more" repeatedly until every qualifying review is shown → the control disappears once `hasMore` is false.
- "Load more" while "Highest rated" (or "Lowest rated") is active continues fetching in that same order — newly-revealed rows aren't silently reset to Newest.
- Switching sort after loading extra pages → the list resets to the default page size under the new order (§4), not a stale, order-mismatched longer list.
- A Pokémon with fewer qualifying reviews than the default page size → "Load more" never renders.
- `?count=bogus` or `?count=-5` on the URL → falls back to the default page size without erroring.
- The header's "N reviews · average" line stays correct (equal to the true total) regardless of how many rows are currently window-displayed.
- 375px and desktop widths render the control identically in position and style.
- No console errors; `npm run build`/`lint` pass.
