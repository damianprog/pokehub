# Spec — `RateRow` component

> **Status:** spec / pre-implementation
> **Scope:** the "Rate it" row on `/p/[slug]` — the box directly below the Community rating card offering a personal star-rating control, plus ranked/lists/likes stats.
> **Out of scope:** authentication/signed-in gating, star input interactivity, real rank/list/like aggregation, mobile layout.

---

## 1. Goal & scope

A single `RateRow` RSC that renders the row sitting directly below `CommunityRating` and directly
above the still-unbuilt "Base Stats" box, in the info column of `/p/[slug]`. Same "ship the visual
layer first" pattern already used for `PokemonArtwork`, `PokemonActions`, `PokemonHeader`,
`PokemonPhysicals`, and `CommunityRating` — presentational, no interactivity.

Per the Claude Design source this row is where a *signed-in* user would set their own rating for
the Pokémon. Sign-in doesn't exist in this codebase yet (no NextAuth wiring, no session, no
`UserPokemon` write path), so this iteration renders the row exactly as it appears for a user with
no rating set — five empty/unset stars, no click handling, no state. It is purely presentational
this iteration.

The component is mounted in `src/app/(app)/p/[slug]/page.tsx`, directly below
`<CommunityRating />`, ahead of the remaining info-column placeholder.

---

## 2. Visual spec (from Claude Design)

Source: `PokeHub.dc.html`, Pokémon Detail screen, Info column — the "Rate it" row immediately
following the Community rating card, immediately before the Base Stats box. Pull exact spacing,
sizing, and color values from that source when implementing rather than from this spec — described
generally below.

A single-row card, narrower/lower-emphasis than the Community rating card above it: a slightly
darker surface than the standard card background used elsewhere on this page. Four elements laid
out left to right:

1. A small, muted "Rate it" label.
2. A row of five star glyphs, all rendered in one flat, unset/muted color — there's no rating value
   to visualize a fill against, so unlike `CommunityRating`'s two-layer partial-fill stars, this is
   a single uniformly-colored star string. The design shows a pointer cursor on this control as a
   forward-looking affordance, matching how `PokemonActions` already keeps `cursor:pointer` on its
   buttons ahead of click handlers landing in a later iteration.
3. A flexible spacer pushing the remaining content to the row's right edge.
4. A right-aligned stats group, small and muted overall, with three items separated by consistent
   gaps: "Ranked #_ of _{type}_" (the rank number in an accent/warm color), "In _ lists" (the count
   in an emphasized off-white), and "_ likes" (the count in the same emphasized off-white). The two
   numeric counts share the same emphasis treatment; the rank number uses a distinct accent color
   consistent with rank/ordinal styling used elsewhere in the design.

---

## 3. Content & formatting

The component receives raw values and derives display text itself — no caller does this
formatting, same principle as `CommunityRating` and `PokemonPhysicals`.

| Value | Formula | Example (from the design's sample data) |
|---|---|---|
| Rank text | `` `#${rank}` `` | `#3` |
| Type text | `typeLabel` as given | `Fire` |
| List count text | `listCount.toLocaleString()` | `1,240` |
| Like count text | `likeCount.toLocaleString()` | `6,109` |

---

## 4. Design decision — static placeholder data (this iteration)

None of `rank`, `listCount`, or `likeCount` have any real backing data yet: rank-within-type
requires a real rating distribution (the same missing `UserPokemon.rating` data `CommunityRating`
already defers — see that spec's §4/§7), list membership requires the Lists feature (unbuilt —
`List`/`ListItem` tables exist in the schema but have zero rows), and like count requires
`ReviewLike` (unbuilt for the same reason). All three follow `CommunityRating`'s precedent: **static
placeholder props**, passed as a hardcoded constant from the page, shaped like a real query's
eventual output rather than a live aggregation.

`typeLabel` is a partial exception — the Pokémon's primary type is real, already-seeded data, not
an invented number. It would be reasonable to pass the page's already-computed primary type instead
of hardcoding `"Fire"`. This iteration keeps it as part of the same static placeholder object as
the other three values for consistency (one dataset, one source of truth, no mixed
real/placeholder props on a single component) — worth revisiting once `rank`/`listCount`/
`likeCount` become real and the whole prop set is wired to live data at once (see §8).

---

## 5. Props

- `rank` — `number`, e.g. `3`
- `typeLabel` — `string`, e.g. `"Fire"`
- `listCount` — `number`, e.g. `1240`
- `likeCount` — `number`, e.g. `6109`

Page passes the design's sample numbers verbatim as a hardcoded constant (§4) — not per-Pokémon
data.

---

## 6. Rendering rules

- "Rate it" label and the star control are literal static markup — no props drive them.
- Render the star control as a single element of 5 unicode stars in one flat, unset color; do not
  build the two-layer fill structure used elsewhere, since there is no fill percentage to
  represent.
- No `onClick`/state on the star control this iteration — see §8.
- The stats group's two emphasized fragments (rank number, list count, like count) are each their
  own inline element nested inside the muted parent text, matching the design's nested-emphasis
  structure (§2).

---

## 7. File location

- `src/components/pokemon/RateRow.tsx`

---

## 8. Deliberate non-goals (this iteration)

- **Auth / signed-in gating** — whether this row is hidden, disabled, or replaced with a "log in to
  rate" prompt for anonymous users is undecided and depends on how sign-in gets built. Out of scope
  until authentication exists in the codebase at all.
- **Star input interactivity** — hover-preview, click-to-set, submitting a rating. Requires both
  auth and a `UserPokemon.rating` write path; a separate, later iteration.
- **Real rank/list/like aggregation** — no query against `UserPokemon.rating`, `ListItem`, or
  `ReviewLike`. Deferred until the Lists and rating/review features themselves are built (parallel
  to `CommunityRating`'s §7 deferral).
- **Wiring `typeLabel` to the page's real primary type** — flagged as reasonable in §4 but not done
  this iteration, to keep one static dataset rather than partially-real props.
- **Mobile layout** — the two-column grid's responsive collapse is a separate concern, already
  deferred by the `PokemonArtwork` spec.

---

## 9. Implementation order

1. `src/components/pokemon/RateRow.tsx` — the component (§2, §3), taking props per §5.
2. Wire into `src/app/(app)/p/[slug]/page.tsx`, directly below `<CommunityRating />`, passing the
   hardcoded placeholder dataset from §5.

---

## 10. Testing

- `/p/charizard` (or any Pokémon, since data is static this iteration) → "Rate it" label, five
  uniformly-unset stars, and a right-aligned stats line reading "Ranked #3 of Fire · In 1,240
  lists · 6,109 likes" (emphasis per §2).
- No console errors; `npm run build` passes.
- Visually pixel-matched against the Claude Design source's "Rate it" row.
