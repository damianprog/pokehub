# Spec — `TopReviews` component

> **Status:** spec / pre-implementation
> **Scope:** the "Top Reviews" section on `/p/[slug]` — heading + "View all" link, followed by two review cards, sitting directly below Base Stats.
> **Out of scope:** "Appears in lists" section, real review data, review interactivity, mobile layout.

---

## 1. Goal & scope

A single `TopReviews` RSC rendered in the info column of `/p/[slug]`, directly below `BaseStats`
and above the still-unbuilt "Appears in lists" section. Same "visual layer first" pattern as the
other detail-page components — presentational, no interactivity.

No review-writing feature exists yet (`UserPokemon.reviewText`/`rating` have zero rows), so — same
as `CommunityRating` and `RateRow` — this ships with **static placeholder props** shaped like a
real query's output, not a live query.

---

## 2. Visual spec (from Claude Design)

Source: `PokeHub.dc.html`, Pokémon Detail screen — the "Top Reviews" section between Base Stats
and "Appears in lists". Pull exact spacing/sizing/colors from that source when implementing.

- **Header row:** "Top Reviews" heading (left, matches other info-column section headings), muted
  "View all {count} →" (right, pointer cursor, non-functional this iteration).
- **Review card ×2:** same surface treatment as other cards on this page, tighter padding/radius.
  Three stacked parts:
  1. Header row — circular initial avatar on a per-user gradient (pointer cursor, no navigation),
     username (bold) + follower count (muted, small), star rating on the right.
  2. Quoted review text, muted-light body color.
  3. Muted footer line: "♥ {count} found this helpful".
- **Star rating:** reuse the two-layer partial-fill-star pattern already used in `CommunityRating`
  — inline the same two-span structure, don't extract a shared component.

---

## 3. Content & formatting

Component derives display text from raw props, same as `CommunityRating`/`RateRow`:

| Value | Formula | Example |
|---|---|---|
| Star fill width | `(rating / 5) * 100` | `90%` (4.5★), `80%` (4.0★) |
| Follower count | abbreviate to 1 decimal + `k` at ≥1000 | `1200` → `1.2k` |
| Helpful count | `helpfulCount.toLocaleString()` | `412` |
| View-all count | `totalReviewCount.toLocaleString()` + `" →"` | `1,840 →` |

The `k`-abbreviation formatter is new this component — write it inline, don't extract a shared
utility for a single caller.

---

## 4. Design decision — static placeholder data

Same missing-data situation as `CommunityRating`/`RateRow`: static placeholder props, hardcoded on
the page, shared across every Pokémon page (no per-species branching this iteration).

One wrinkle: the design's two sample reviews are genuine Charizard text ("Mega X going
pitch-black dragon", "the 4× rock weakness"). Unlike numeric placeholders, review text can't be
genericized — it'll read as obviously Charizard-specific on other Pokémon pages. Keeping it anyway
for consistency with the one-dataset precedent; revisit once real reviews exist.

---

## 5. Props

- `totalReviewCount` — `number`, e.g. `1840`
- `reviews` — array, each: `id`, `username`, `followerCount`, `avatarInitial`,
  `avatarGradientFrom`, `avatarGradientTo`, `rating` (0–5), `text`, `helpfulCount`
  — e.g. `{ id: "1", username: "ghosttype_andy", followerCount: 1200, avatarInitial: "G", avatarGradientFrom: "#8b6fd4", avatarGradientTo: "#4a3a8a", rating: 4.5, text: "Not even a fire-type loyalist and I get it. Mega X going pitch-black dragon is one of the best evolutions in the franchise. Half a star off for being on every team ever.", helpfulCount: 412 }`
  and a second entry for `anna_g` (4000 followers, gradient `#e85b9e`→`#b89ee0`, 4.0★, "The
  original poster child, and it holds up. Docking a point only because the 4× rock weakness still
  gives me nightmares from the Brock era.", 288 helpful).

Page passes the design's sample data verbatim as a hardcoded constant — not per-Pokémon data.

---

## 6. File location

- `src/components/pokemon/TopReviews.tsx`

---

## 7. Deliberate non-goals (this iteration)

- Real review data (query against `UserPokemon`) — deferred with the rating/review feature itself.
- "Appears in lists" section — next section in the design, separate iteration.
- "View all" link, avatar click/profile nav, "found this helpful" button — all static, no
  destination/handler exists yet.
- Interactivity in general, mobile layout, per-Pokémon-aware placeholder text (§4).

---

## 8. Implementation order

1. `src/components/pokemon/TopReviews.tsx` — component (§2, §3), props per §5.
2. Wire into `src/app/(app)/p/[slug]/page.tsx`, directly below `<BaseStats />`, passing the
   hardcoded placeholder dataset from §5.

---

## 9. Testing

- `/p/charizard` (or any Pokémon) → "Top Reviews" heading, "View all 1,840 →", two review cards
  (ghosttype_andy 4.5★/412 helpful, anna_g 4.0★/288 helpful) in that order, follower counts as
  `1.2k`/`4.0k`.
- No console errors; `npm run build` passes.
- Visually pixel-matched against the Claude Design source.
