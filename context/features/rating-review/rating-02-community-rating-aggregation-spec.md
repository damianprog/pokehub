# Spec — Rating 02 · Community rating aggregation

> **Status:** spec / pre-implementation
> **Scope:** replace `CommunityRating`'s static placeholder data on `/p/[slug]` with a real aggregation over `UserPokemon.rating` for that Pokémon.
> **Out of scope:** `RateRow`'s rank/lists/likes stats, Top Reviews, review text/the composer, feed events, profile stats.

---

## 1. Goal & scope

`CommunityRating` already ships as a presentational component (see `detail-page/community-rating-spec.md`) reading a hardcoded placeholder dataset, because at the time it was built `UserPokemon.rating` had zero rows anywhere. `Rating 01` (the interactive "Rate it" row) has since shipped and is writing real ratings. This slice closes that deferral: swap the placeholder for a real query, with no visual changes to the component itself.

---

## 2. Data source

`UserPokemon.rating` holds a nullable integer in half-star units, 1–10 (owned by `src/lib/rating.ts`, established in `Rating 01`). The aggregation reads every row for the given `pokemonId` where `rating` is not null, across all users.

---

## 3. Bucketing into the five distribution rows

The card's distribution section has five rows (5★…1★), but stored values are ten discrete half-units. Map each half-unit value into the whole-star bucket it rounds up to: 1–2 → 1★, 3–4 → 2★, 5–6 → 3★, 7–8 → 4★, 9–10 → 5★. This gives an even two-values-per-bucket split with no ambiguous rounding case, since the inputs are the ten fixed discrete values rather than an arbitrary continuous number.

---

## 4. Average score

The average is computed over the raw half-unit values, then converted to a star value (via the existing `toStars` helper) — independently of the bucketing in §3, not derived from the bucketed counts. This mirrors the component's own layout, which already treats the average score and the distribution bars as two separate pieces of derived data (`community-rating-spec.md` §2.2 vs §2.3). A Pokémon can show a `4.3` average while its distribution bars only ever land on whole-star rows — that's expected, not a bug.

---

## 5. Zero-ratings state

Most Pokémon will have no ratings at all for a long while. `CommunityRating` already guards divide-by-zero on the bar widths (`totalRatings === 0` → `0%`), so a Pokémon with no ratings renders `0.0`, "0 ratings", and five empty bars rather than crashing or showing `NaN`. Whether that's an acceptable empty state or deserves its own treatment (e.g. hiding the card, or a "not enough ratings yet" message) isn't settled by an existing design artboard — flagging it here rather than deciding silently. Default: ship the zero-state as the guard already renders it, and revisit only if it looks wrong once seen on a real un-rated Pokémon page.

---

## 6. Data helper

A new read function (e.g. `getPokemonRatingStats(pokemonId)`) lives alongside the existing data helpers (`getPokemon`, the `Rating 01` read helper) rather than being queried inline in the page — same placement convention as everything else on this route. One `groupBy` query on `rating` (filtered to the given `pokemonId`, `rating: { not: null }`) returns at most ten rows; the total, the average, and the five bucketed counts are all derived from that single result in application code rather than issuing multiple queries.

---

## 7. Wiring into the page

`src/app/(app)/p/[slug]/page.tsx` replaces its placeholder import with a call to the new helper, passing the Pokémon's id, and passes the result straight through to `<CommunityRating />` — the prop shape (`average`, `totalRatings`, `distribution`) doesn't change.

The existing placeholder dataset file becomes unused once this lands. Don't remove it as part of this change without checking first whether anything else still references it, and confirm with Damian before deleting — per the project's standing rule against deleting files without clarification.

---

## 8. Freshness

No new caching layer is needed. `Rating 01`'s `setRating`/`clearRating` actions already call `revalidatePath` on this same route, so a rating change is reflected the next time the page renders — this component just needs to read live at request time like `getPokemon` does. Whether the new helper is wrapped in React's `cache()` (as `getPokemon` is, for per-request dedupe) is the implementer's call, following that existing precedent if the helper ends up called more than once per render.

---

## 9. Deliberate non-goals

- **`RateRow`'s rank / list / like stats** — still placeholder, unrelated data.
- **Top Reviews, review text, the composer** — separate slices, untouched.
- **A redesigned empty state** — see §5; only revisited if the default guard rendering looks wrong in practice.
- **Performance work beyond a single query** — no materialized view, no Redis cache; not warranted at current scale.
- **Feed events, profile stats** — untouched.

---

## 10. Implementation order

1. Data helper: the `groupBy` query, the §3 bucketing, and the §4 average.
2. Wire it into `page.tsx` in place of the placeholder import.
3. Check the zero-ratings rendering against §5 and flag if it needs a design pass.
4. Confirm the placeholder dataset file has no remaining references; ask before deleting it.

---

## 11. Testing

- A Pokémon with a handful of real `UserPokemon.rating` rows (rate it as a few different test values via the existing "Rate it" row, or seed rows directly) → average and per-bucket counts match a manual calculation.
- A Pokémon with zero ratings → `0.0` average, "0 ratings", empty bars, no `NaN` or crash.
- Rate a Pokémon, reload the page → the card reflects the new rating immediately.
- Clear a rating, reload → the corresponding bucket's count decrements and the average recalculates.
- No console errors; `npm run build` passes.
