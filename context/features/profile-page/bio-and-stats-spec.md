# Profile Page — Bio & Stats Spec

## Status

Planning — not started

## Goal

The bio paragraph and the Reviews/Lists/Followers/Following stats row on `/u/[username]`, sitting
directly below the identity block built in [header-spec.md](./header-spec.md).

## Design reference

`PokeHub.dc.html`, `SCREEN 2 · PROFILE` — the paragraph and four-item stats row directly beneath
the name/username/joined-date block and the Follow/⋯ buttons, immediately above the Signature Team
section.

## Scope

In scope: bio paragraph, stats row (Reviews, Lists, Followers, Following counts).

Out of scope (later sections of the same screen): the Follow/⋯ action buttons above this block
(still not built — see header-spec.md's out-of-scope list), Signature Team grid, Recent Activity
feed, and the stats sidebar.

## Content & copy

- **Bio** — `User.bio`, rendered verbatim as a short paragraph. The field already exists on the
  schema but nothing writes to it yet (no profile-editing feature exists), so most accounts will
  have it `null`. When it's `null`, omit the paragraph entirely rather than showing empty space or
  an invented "add a bio" prompt — editing isn't in scope for this section.
- **Stats row** — four items, each a bold count plus a muted label: Reviews, Lists, Followers,
  Following, in that order. None of the underlying features exist yet (no review-writing UI wired
  to counts, no lists feature, no follow graph), so these are mock/placeholder counts this
  iteration — the same "ship the visual layer first" approach already used for `CommunityRating`,
  `RateRow`, `TopReviews`, and `AppearsInLists` on the Pokémon detail page. Use plausible varied
  numbers (not all zero) so the row reads correctly in review; real aggregation is deferred until
  each underlying feature (reviews, lists, follows) is actually built.

## Layout & components

- Bio sits directly below the identity block, capped to a comfortable reading width rather than
  spanning the full profile width (per the design).
- Stats row sits below the bio, a single horizontal row of the four items with even spacing
  between them.
- Server component, receiving the profile owner's `bio` from the same `User` row the header
  already fetches (`getUserByUsername`) — no new data fetch needed for the bio. Stats come from a
  placeholder data source (mirroring `src/lib/placeholder-*.ts` on the Pokémon detail page) rather
  than a live query, until reviews/lists/follows are real features.
- No client interactivity — this is fully static/presentational, same as the header section.

## Interactions

None. No clickable stats (e.g. linking Followers to a followers list) this iteration — those
destinations don't exist yet.

## Responsive notes

Bio and stats should scale down gracefully at narrow widths, consistent with how the header
section already handles 375px–1920px — no fixed-width elements that would overflow on mobile.

## Out of scope

- Follow/⋯ buttons (deferred from header-spec.md, still not built).
- Editing the bio, or any empty-state prompt encouraging a user to add one.
- Real aggregation for any of the four stats — all placeholder data until reviews, lists, and
  follows are real features.
- Making the stats clickable/navigable.
- Signature Team, Recent Activity, and the stats sidebar — separate, later sections.

## Acceptance criteria

- A user with a `bio` set shows it as a paragraph below the identity block; a user without one
  shows no paragraph and no visible gap/placeholder in its place.
- The stats row always shows four items (Reviews, Lists, Followers, Following) with mock counts,
  regardless of the profile owner's real activity.
- No layout break from 375px to 1920px.

## History
