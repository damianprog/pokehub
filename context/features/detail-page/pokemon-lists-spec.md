# Spec — `AppearsInLists` component

> **Status:** spec / pre-implementation
> **Scope:** the "Appears in lists" section on `/p/[slug]` — heading + 3-column grid of list
> cards, directly below Top Reviews (last section on the page).
> **Out of scope:** real list data, interactivity, mobile layout.

---

## 1. Goal

A single presentational `AppearsInLists` RSC, same "visual layer first" pattern as the other
detail-page sections. No lists feature exists yet, so it ships with static placeholder props
shaped like a real query's output (same approach as `CommunityRating`/`RateRow`/`TopReviews`).

---

## 2. Visual spec (from Claude Design, `PokeHub.dc.html`)

- **Heading:** "Appears in lists" — no "View all" link (unlike Top Reviews).
- **Grid:** 3 equal columns, small gap.
- **Card:** same surface treatment as Top Reviews cards, cursor pointer (non-functional). Three
  parts: a row of 3 small square thumbnails (tight gap, rounded, own per-Pokémon radial-gradient
  background behind the artwork — same idea as `Trending`'s cards), then bold list title, then a
  muted meta line: `"by {username} · {count} Pokémon"`.

Pull exact spacing/colors from the design source when implementing.

---

## 3. Design decision — static placeholder data

Hardcode 3 sample lists (verbatim from the design), shared across every Pokémon page. Per-thumbnail
gradients are hardcoded on the mock data itself (matching the `Trending` component's precedent),
not derived from `TYPE_GRADIENTS` — the design's values use different stops. Note: all 3 sample
lists include Charizard among their thumbnails, so it'll read as slightly Charizard-specific on
other pages — same known tradeoff as `TopReviews`, revisit once real list data exists.

---

## 4. Props

`lists`: array of `{ id, title, username, pokemonCount, thumbnails }`, where `thumbnails` is
exactly 3 `{ pokemonId, name, gradient }` entries.

Sample data (from design):
1. **Best Gen 1 Starters** — by `prof_oak`, 9 Pokémon — Venusaur #3 (green), Charizard #6 (orange), Blastoise #9 (blue)
2. **Cinematic Dragons** — by `damian`, 21 Pokémon — Garchomp #445 (purple), Charizard #6 (orange), Dragonite #149 (gold)
3. **My Childhood Team** — by `kanto_kris`, 6 Pokémon — Charizard #6 (orange), Alakazam #65 (pink), Snorlax #143 (tan)

Thumbnail images use the same `raw.githubusercontent.com` official-artwork sprite pattern already
used elsewhere (`{pokemonId}.png`). Exact gradient color stops come from the design source.

---

## 5. File location

- `src/components/pokemon/AppearsInLists.tsx`

---

## 6. Deliberate non-goals (this iteration)

- Real list data, list-card click navigation to `/list/[id]`, a "View all" link (not in the
  design for this section), interactivity, mobile layout, per-Pokémon-aware placeholder data.

---

## 7. Implementation order

1. `AppearsInLists.tsx` — component + props per §2–4.
2. Wire into `src/app/(app)/p/[slug]/page.tsx`, directly below `<TopReviews />`.

---

## 8. Testing

- `/p/charizard` (or any Pokémon) → "Appears in lists" heading, 3 cards in order with thumbnails,
  title, and meta line.
- No console errors; `npm run build` passes; pixel-matched against the design source.
