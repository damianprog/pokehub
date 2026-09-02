# Profile Page — Recent Activity Section Spec

## Status

Planning — not started

## Goal

The "Recent activity" section on `/u/[username]`, sitting directly below the Signature Team grid
built in [signature-team-spec.md](./signature-team-spec.md) — a heading plus a short feed of the
profile owner's review-style activity cards.

## Design reference

`PokeHub.dc.html`, `SCREEN 2 · PROFILE` — the "Recent activity" heading and its two review-style
cards sit in the left column of a two-column row, paired with a "Favorite types" stats sidebar on
the right. That sidebar is a separate, later section — not part of this spec.

## Scope

In scope: the "Recent activity" heading and its activity card feed.

Out of scope (later section of the same screen): the "Favorite types" stats sidebar that sits
beside it.

## Content & copy

- **Heading** — "Recent activity" label. Unlike Signature Team's heading, the design gives this no
  pinned-style count suffix.
- **Activity card** — one per feed item, each showing:
  - A square Pokémon artwork thumbnail with a per-type gradient background (reuse the existing
    `TYPE_GRADIENTS` map, not a new color set).
  - An activity line: "reviewed {Pokémon name}", where the Pokémon name is colored with its
    primary type's accent (reuse the existing `TYPE_BADGE_COLORS` map's color value, not a new
    one), followed by a relative-time label (e.g. "1d", "3d").
  - A star rating, reusing the existing two-layer partial-fill-star markup pattern already used in
    `CommunityRating`/`TopReviews`.
  - A short quoted line of review text.
- **Data source** — this is effectively the profile owner's own review history, which would come
  from `UserPokemon` (`reviewText`/`rating`/`reviewedAt`) once the rating/review feature exists. It
  doesn't yet (zero real rows), so — same reasoning as `TopReviews` and `SignatureTeam` — ship with
  a fixed mock activity feed (the same two items shown in the design: a Charizard review and a
  Gengar review) on every profile this iteration. Name, type, and artwork for those Pokémon IDs
  come from the real, already-seeded `Pokemon` table (the `getPokemonsByIds` helper added for
  Signature Team already does this lookup); the activity line's relative-time label, the star
  rating, and the quoted text are mock.

## Layout & components

- Section sits directly below Signature Team, with the same left/right inset as the rest of the
  identity column content.
- The design pairs this column with a fixed-width stats sidebar to its right. Since that sidebar
  is a separate, not-yet-built section, this iteration can render the activity feed as the sole
  column — no visual regression either way, since nothing else occupies that space yet.
- The activity cards are a simple vertical stack, not a grid.
- Server component — no client state needed.

## Interactions

- The design scopes the click target to the Pokémon artwork thumbnail only (not the full card),
  linking to that Pokémon's `/p/[slug]` page — narrower than Signature Team's whole-card link.
  Match that scoping.
- The rest of the card (activity line, rating, quote) stays static, no handlers.

## Responsive notes

No fixed-width elements that would overflow 375px–1920px; cards should stay readable and not
overflow at narrow widths.

## Out of scope

- The "Favorite types" stats sidebar — separate, later section.
- Real activity data (a live query against `UserPokemon` or `FeedEvent`).
- Pagination, "view all", or a "load more" control — the design shows a fixed two-item feed.
- Non-review activity types (list creation, rare pack pulls, new follows, etc.) — the design only
  shows reviews here; a broader `FeedEvent`-driven feed is a bigger future feature.

## Acceptance criteria

- `/u/[username]` shows the "Recent activity" heading and two activity cards below Signature Team,
  using real Pokémon name/type/artwork data for the two mock Pokémon IDs.
- Each card's artwork thumbnail links to the correct `/p/[slug]` page.
- No layout break from 375px to 1920px.

## History
