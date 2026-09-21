# Spec — Rating 08 · Sort control

> **Status:** spec / pre-implementation
> **Scope:** wiring the three "Newest / Highest rated / Lowest rated" chips on `/p/[slug]/reviews` (shipped as a static, inert shell in rating-07 §7) to real `ORDER BY` variants against the same review list, driven by a `sort` URL search param so the choice is shareable and bookmarkable rather than held in component state.
> **Out of scope:** pagination / "Load more" (Rating 09), a "Most helpful" option, filtering by star count, persisting a user's preferred sort across visits.

---

## 1. Goal & scope

Rating 07 built the all-reviews page and rendered its sort row with "Newest" hardcoded active and the other two chips inert, deferring the real behavior to this slice (rating-07 §7, §14). This spec wires all three chips to real orderings of the same `getAllReviews` data, with ties broken deterministically rather than left to incidental row order.

---

## 2. Sort state lives in the URL, not component state

The chosen sort is a `sort` search param on `/p/[slug]/reviews` — one of `newest` (the default), `highest`, or `lowest`. A missing or unrecognized value falls back to `newest` rather than erroring, and the default case omits the param entirely (a bare `/p/[slug]/reviews` is "Newest," matching the page's current unwired behavior) so the common-case URL stays clean.

This is a deliberate departure from the design source, which holds the active chip in local component state. A URL param is shareable and bookmarkable — pasting a link with `?sort=highest` reproduces the same ordering for anyone who opens it — and it fits how `page.tsx` already works: it's a server component reading `params` today, and reading `searchParams` the same way is the same capability, not a new one. Local `useState` would also need its own effort to sync with the URL to get those properties for free; starting from the URL avoids building that sync in the first place.

---

## 3. Chips become real links, not client state

`ReviewSortChips` changes from three static `<span>`s to the same linked-vs-current pattern `Breadcrumb` already uses: the active chip stays a plain, styled `<span>` (unchanged from rating-07), and the other two become real `<Link>`s to `/p/[slug]/reviews?sort=...`. Clicking one is an ordinary Next.js navigation — the server re-runs `page.tsx` with the new param and returns the newly-ordered list — so no `"use client"` boundary is needed here at all, which is simpler than giving the component its own state and pushing URL updates through `useRouter`.

These links pass `scroll={false}`. The sort row sits mid-page, below the identity header and rating card; without it, Next.js's default post-navigation scroll-to-top would jerk the page back up past content the reader is already looking at, for an interaction that's meant to feel like an in-place re-order.

---

## 4. Which rows the sort affects

Only the "everyone else" list (`AllReviewsResult.reviews`) is reordered. The pinned card (`AllReviewsResult.ownReview`) keeps its rating-07 §3 behavior exactly as-is: always the viewer's own row, always first, never duplicated into the list below it and never itself re-sorted. `getAllReviews` already queries these as two separate Prisma calls (`findUnique` for the viewer's own row, `findMany` for everyone else's), so scoping the new ordering to the `findMany` side falls out naturally rather than needing a special case to protect the pinned row.

---

## 5. `ORDER BY` variants and the null-rating edge case

- **Newest** (default): `reviewedAt desc`, unchanged from rating-07.
- **Highest rated**: `rating desc`. A review whose rating was cleared while its text survived (the same null-rating edge case `YourReview` and `TopReviews` already handle per rating-04 §2 / rating-05 §6) must not float to the top just because it sorts before every real value under Postgres's default null-ordering — nulls are pinned to the end of the list regardless of direction (Prisma's per-field `nulls: "last"` option covers this without a manual filter/concat step).
- **Lowest rated**: `rating asc`, with nulls sorted last here too — a review with no rating shouldn't outrank a genuine 0.5-star review by appearing artificially "lower" than every rated one.
- **Ties.** Two reviews sharing the same rating value break by `reviewedAt desc` as a secondary key, in both directions, so the order is fully determined rather than depending on whatever order Postgres happens to return matching rows in. This is a two-key Prisma `orderBy` array (rating first, then `reviewedAt`), not a second query or in-memory sort.

---

## 6. Data layer changes

`getAllReviews(pokemonId, viewerId, sort)` in `src/lib/user-pokemon.ts` gains a third parameter — a small exported union type (e.g. `ReviewSortOption = "newest" | "highest" | "lowest"`) — applied only to the `otherRows` `findMany`'s `orderBy` (§4, §5). The `ownRowRaw` `findUnique` and the `totalReviewCount` count have no ordering concept and are untouched.

`page.tsx` reads `sort` off its `searchParams` prop (awaited the same way `params` already is), validates it against the three allowed values, falls back to `"newest"` for anything else including no param at all (§2), and passes the validated value to both `getAllReviews` and `ReviewSortChips` (so the chip row knows which one is currently active).

`getTopReviews` — the detail-page preview `TopReviews` renders — is untouched. It keeps its fixed `reviewedAt desc` order, a difference from this page already established deliberately in rating-05 §4 and not something this slice revisits.

---

## 7. Client/server split

No new client components. `page.tsx` stays a server component — reading a validated value off `searchParams` is an ordinary server-component capability, not something that needs a client boundary. `ReviewSortChips` goes from three presentational spans to one span plus two `Link`s, still fully server-rendered.

---

## 8. Mobile

Same three chips, same URL-param mechanism, at both widths — sort isn't a viewport concern, consistent with how the rest of this page already treats width purely as a styling question (rating-07 §10).

---

## 9. Deliberate non-goals (this slice)

- **"Most helpful" as a fourth option** — no helpfulness signal exists yet, the same deferral rating-04 §4 and rating-05 §4 already made.
- **Pagination interaction** — the fetch is still unpaginated (rating-07 §9); how sort and a future "Load more" compose is Rating 09's problem, not this slice's.
- **Persisting a preferred sort across visits** (cookie, profile setting, etc.) — the URL param is the only state that exists; a fresh visit to a Pokémon's reviews page always starts at "Newest."
- **Star-count filtering** — a different axis, not in the design, not planned here.

---

## 10. Implementation order

1. `ReviewSortOption` type + the sort-dependent two-key `orderBy` on `getAllReviews`'s `otherRows` query (§5, §6).
2. `page.tsx`: read and validate `searchParams.sort`, thread it through to `getAllReviews` and `ReviewSortChips`.
3. `ReviewSortChips`: accept `slug` and `activeSort` props; render the active chip as the existing span and the other two as `scroll={false}` `Link`s to `?sort=...` (§3).

---

## 11. Testing

Manual, in the browser:

- A Pokémon with several reviews spanning different ratings and timestamps, including one null-rating review with surviving text → each chip produces the correct order, checked against actual rating values rather than eyeballed; both Highest and Lowest push the null-rating review to the end, never the top.
- Two reviews tied on rating → ordered by `reviewedAt` descending relative to each other, under both Highest and Lowest.
- The pinned "your review" card never moves or reappears in the list below, regardless of which chip is active.
- Reloading a URL with `?sort=highest` (or `lowest`) reproduces the same order — the param round-trips correctly.
- An unknown or malformed `sort` value (e.g. `?sort=bogus`) falls back to Newest without erroring.
- Clicking a chip doesn't jump the scroll position back to the top of the page.
- 375px and desktop widths both keep the active/inactive chip styling already shipped in rating-07.
- No console errors; `npm run build`/`lint` pass.
