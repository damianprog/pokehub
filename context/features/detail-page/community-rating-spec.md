# Spec — `CommunityRating` component

> **Status:** spec / pre-implementation
> **Scope:** the community rating card on `/p/[slug]` — average score, star fill, ratings count, and the 5★–1★ distribution bars, sitting directly below the Height/Weight/Base XP box.
> **Out of scope:** the "Rate it" row, base stats chart, top reviews, lists featuring this Pokémon; mobile layout; interactivity; real data aggregation.

---

## 1. Goal & scope

A single `CommunityRating` RSC that renders the rating summary card in the info column of
`/p/[slug]`, between `PokemonPhysicals` and the still-unbuilt "Rate it" row. Same "ship the visual
layer first" pattern already used for `PokemonArtwork`, `PokemonActions`, `PokemonHeader`, and
`PokemonPhysicals` — presentational, no interactivity.

Unlike those four, this component's data doesn't exist anywhere yet: no rating/review feature has
been built, so `UserPokemon.rating` has zero rows across the entire database. This iteration ships
the card with **static placeholder props** matching the shape a real aggregation query will
eventually return (see §5) — not a live query. Wiring `CommunityRating` to real
`UserPokemon.rating` aggregates is deferred to whichever future iteration builds the rating/review
feature itself (the "Rate it" row, review submission, etc.) — see §7.

The component is mounted in `src/app/(app)/p/[slug]/page.tsx`, directly below
`<PokemonPhysicals />`, ahead of the remaining info-column placeholder.

---

## 2. Visual spec (from Claude Design)

Source: `PokeHub.dc.html`, Pokémon Detail screen, Info column — the "Community rating" card
immediately following the Height/Weight/Base XP box, immediately before the "Rate it" row.

### 2.1 Container

| Property | Value |
|---|---|
| Display | `flex` |
| Gap | `30px` |
| Align items | `center` |
| Background | `#15181e` |
| Border | `1px solid rgba(255,255,255,0.06)` |
| Border radius | `16px` |
| Padding | `22px` |
| Margin bottom | `14px` |

Two children: a fixed-width left block (score) and a flexible right block (distribution bars).

### 2.2 Left block — score

`text-align:center; flex:none`. Three stacked elements:

| Element | Property | Value |
|---|---|---|
| Average score | Font | Space Grotesk, weight `700` |
| Average score | Font size | `54px` |
| Average score | Line height | `1` |
| Average score | Color | `#e6b450` (gold) |
| Average score | Content | average to 1 decimal, e.g. `4.3` |
| Star fill | Font size | `17px` |
| Star fill | Letter spacing | `3px` |
| Star fill | Line height | `1` |
| Star fill | Font family | `Arial` |
| Star fill | Margin top | `6px` |
| Ratings count | Font size | `12px` |
| Ratings count | Color | `#7b818c` |
| Ratings count | Margin top | `7px` |
| Ratings count | Content | formatted count + `" ratings"`, e.g. `8,412 ratings` |

**Star fill rendering** — this reuses the two-layer partial-fill-star pattern already established
in `src/components/landing/Testimonials.tsx` (and `Trending.tsx`/`Marquee.tsx`): a background span
of 5 unicode stars in `#363b45` (empty/track color), with a second span absolutely positioned on
top in `#e6b450` (fill color), `overflow:hidden; white-space:nowrap`, whose `width` is a percentage
that visually clips how many stars appear filled. No new abstraction — inline the same two-span
structure Testimonials already uses rather than extracting a shared component, consistent with how
that pattern is duplicated (not shared) across the three landing components today.

### 2.3 Right block — distribution bars

`flex:1; display:flex; flex-direction:column; gap:6px`. Five rows, one per star value, **5★ first,
1★ last**:

| Property | Value |
|---|---|
| Row | `display:flex; align-items:center; gap:10px` |
| Star label | `width:26px; font-size:11px; color:#7b818c; text-align:right`, content `5★`…`1★` |
| Bar track | `flex:1; height:8px; border-radius:5px; background:rgba(255,255,255,0.05)` |
| Bar fill | `height:8px; border-radius:5px`, `width` = percentage (see §3), `background` = per-row color (below) |
| Count label | `width:42px; font-size:11px; color:#7b818c`, content = formatted count, e.g. `4,883` |

Per-row bar fill color (fixed, not computed — same in the design regardless of the actual
percentage):

| Star | Bar fill color |
|---|---|
| 5★ | `#e6b450` |
| 4★ | `#e6b450` |
| 3★ | `#b89540` |
| 2★ | `#8a7030` |
| 1★ | `#6a5826` |

---

## 3. Value formatting & derived percentages

The component receives raw numbers (§5) and derives every percentage itself — no caller does this
math, same principle as `PokemonPhysicals` owning its own unit formatting (§3 of that spec).

| Value | Formula | Example (from the design's sample data) |
|---|---|---|
| Average score text | `average.toFixed(1)` | `4.3` |
| Star fill width | `(average / 5) * 100`, clamped `0–100` | `86%` |
| Ratings count text | `totalRatings.toLocaleString()` | `8,412` |
| Per-star bar width | `(starCount / totalRatings) * 100`, `0` when `totalRatings === 0` | 5★: `58%`, 4★: `24%`, 3★: `10%`, 2★: `5%`, 1★: `3%` |
| Per-star count text | `starCount.toLocaleString()` | 5★: `4,883`, 4★: `2,019`, 3★: `841`, 2★: `421`, 1★: `248` |

The `totalRatings === 0` guard matters now, not just as future-proofing: real Pokémon pages will
hit it the moment this component is wired to live data (§7), and it's cheap to handle correctly
from the start rather than shipping a `NaN%`/divide-by-zero bug.

---

## 4. Design decision — static placeholder data (this iteration)

No `UserPokemon.rating` rows exist anywhere in the database — the rating/review feature (stars
input, review CRUD, the "Rate it" row on this same page) hasn't been built yet. Two options existed
for this iteration:

1. **Static placeholder props** (chosen) — the component takes plain numeric props; the page passes
   hardcoded placeholder values shaped exactly like a real aggregation query's output. Matches the
   "ship the visual layer first, no interactivity yet" pattern already used for every other
   detail-page component (`PokemonArtwork`, `PokemonActions`, `PokemonHeader`,
   `PokemonPhysicals`) — none of them are wired to real user-generated data either, since none
   exists yet.
2. Real `getPokemonRatingStats(pokemonId)` Prisma aggregation now — rejected for this iteration.
   With zero rows in the table, every Pokémon page would render a genuine "0 ratings" empty state,
   which can't be visually verified against the Claude Design mockup's example numbers, and the
   query would need to be rewritten anyway once the rating feature defines exactly how ratings get
   written.

The same placeholder values are used for every Pokémon this iteration (not per-species numbers) —
there's no real per-species signal to vary them by yet, and inventing fake per-species numbers
would be worse than one clearly-a-placeholder dataset shared across pages.

---

## 5. Props

- `average` — `number`, e.g. `4.3`
- `totalRatings` — `number`, e.g. `8412`
- `distribution` — array of exactly 5 entries, one per star value, e.g.:
  - `{ stars: 5, count: 4883 }`
  - `{ stars: 4, count: 2019 }`
  - `{ stars: 3, count: 841 }`
  - `{ stars: 2, count: 421 }`
  - `{ stars: 1, count: 248 }`

Page passes the design's sample numbers verbatim as a hardcoded constant (§4) — not per-Pokémon
data.

---

## 6. File location

- `src/components/pokemon/CommunityRating.tsx`

---

## 7. Deliberate non-goals (this iteration)

- **Real data aggregation** — no `getPokemonRatingStats` query, no read from `UserPokemon.rating`.
  Deferred until the rating/review feature itself is built (that feature is what will populate the
  table this component would eventually query).
- **"Rate it" row** — the separate card directly below this one in the design (interactive star
  input, ranked/lists/likes stats); a separate iteration.
- **Base stats chart, top reviews, lists featuring this Pokémon** — separate sections of the same
  info column, separate iterations.
- **Interactivity** — nothing clickable or hoverable; the star fill is a static visual, not an
  input.
- **Mobile layout** — the two-column grid's responsive collapse is a separate concern, already
  deferred by the `PokemonArtwork` spec.
- **Extracting a shared star-rating component** — the two-layer partial-fill-star markup is
  duplicated inline across `Testimonials.tsx`, `Trending.tsx`, and `Marquee.tsx` already; this spec
  follows that existing convention rather than introducing a shared component unprompted.

---

## 8. Implementation order

1. `src/components/pokemon/CommunityRating.tsx` — the component (§2, §3), taking props per §5.
2. Wire into `src/app/(app)/p/[slug]/page.tsx`, directly below `<PokemonPhysicals />`, passing the
   hardcoded placeholder dataset from §5.

---

## 9. Testing

- `/p/charizard` (or any Pokémon, since data is static this iteration) → `4.3` average, star fill
  visually at 86%, `8,412 ratings`, five distribution rows in order 5★→1★ with bar widths
  `58/24/10/5/3%` and counts `4,883/2,019/841/421/248`, per-row colors matching §2.3.
- No console errors; `npm run build` passes.
- Visually pixel-matched against the Claude Design source's "Community rating" card.
