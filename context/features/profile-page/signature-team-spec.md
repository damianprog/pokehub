# Profile Page — Signature Team Spec

## Status

Planning — not started

## Goal

The "Signature Team" section on `/u/[username]`, sitting directly below the stats row built in
[bio-and-stats-spec.md](./bio-and-stats-spec.md) — a section heading plus a six-card grid of the
profile owner's pinned Pokémon.

## Design reference

`PokeHub.dc.html`, `SCREEN 2 · PROFILE` — the "📌 Signature Team · 6 pinned" heading and the
six-column card grid directly beneath it, immediately above the Recent Activity / stats sidebar
section.

## Scope

In scope: the section heading (pin icon, "Signature Team" label, pinned count) and the six-card
Pokémon grid.

Out of scope (later sections of the same screen): Recent Activity feed and the stats sidebar that
follow it.

## Content & copy

- **Heading** — a small pin icon, "Signature Team" label, and a "· N pinned" count.
- **Cards** — six cards in a row, each showing: a square artwork tile with a per-type background
  tint (reuse the existing `TYPE_GRADIENTS` map already used on `PokemonArtwork`, not a new color
  set), the Pokémon's name, and a "{Type} · ★ {rating}" line.
- **Data source** — `User.signatureTeam` (an `Int[]` of Pokémon IDs, schema already supports up to
  6) is real but empty for every account today, since the editing UI (`/settings/signature-team`
  per the routing convention) doesn't exist yet. Rather than rendering an empty section for every
  profile, use a fixed mock team of six Pokémon IDs (the same six shown in the design — Charizard,
  Gengar, Alakazam, Dragonite, Snorlax, Gyarados) for every profile this iteration. Name, type, and
  artwork for those six should come from the real `Pokemon` table (already seeded — no need to
  hardcode strings/URLs the way the design's raw HTML does), matching how `PokemonHeader` and
  `PokemonArtwork` already source their data. Only the star rating is placeholder, following the
  same "no rating feature yet" reasoning as `CommunityRating`.
- Once `/settings/signature-team` exists, swap the mock ID list for the real `user.signatureTeam`
  and the placeholder ratings for real aggregation — not this iteration.

## Layout & components

- Section sits directly below the stats row, with the same left/right inset as the rest of the
  identity column content.
- Six cards in a single row on desktop; collapse to fewer columns (matching how other multi-column
  sections on this site already collapse, e.g. `Features`/`Trending` on the landing page) rather
  than shrinking cards into illegibility at narrow widths.
- Server component — no client state needed for a static six-item grid.

## Interactions

- Each card links to that Pokémon's detail page (`/p/[slug]`), matching the design's clickable
  cards. This is plain navigation through an already-built route (no new logic, no client
  component required) — different from the header's Follow/"⋯" buttons, which stay inert because
  they'd need real backend logic that doesn't exist yet.

## Responsive notes

No fixed-width elements that would overflow 375px–1920px; the six-column grid should reduce its
column count at narrower widths rather than causing horizontal scroll or illegible tiny cards.

## Out of scope

- Real `user.signatureTeam` data and the `/settings/signature-team` editing UI.
- Real star ratings (placeholder, same reasoning as `CommunityRating`).
- Empty-state handling for a profile with fewer than 6 pinned Pokémon (every profile shows the
  same fixed mock team of 6 this iteration).
- Recent Activity feed and the stats sidebar — separate, later sections.

## Acceptance criteria

- `/u/[username]` shows the "📌 Signature Team · 6 pinned" heading and a six-card grid below the
  stats row, using real Pokémon name/type/artwork data for the six mock IDs.
- Each card links to the correct `/p/[slug]` page for that Pokémon.
- No layout break from 375px to 1920px.

## History
