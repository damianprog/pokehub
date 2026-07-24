# Profile Page — Header Spec

## Status

Planning — not started

## Goal

The identity block at the top of `/u/[username]`: a decorative cover/background banner with the
user's avatar overlapping it, plus display name, username, and joined date. This is the first
real content on the currently-empty profile page shell.

## Design reference

`PokeHub.dc.html`, `SCREEN 2 · PROFILE` — the banner + avatar + name block at the very top of the
profile screen, before the bio paragraph, stats row, Follow/⋯ buttons, Signature Team grid, and
Recent Activity sidebar (all separate, later sections).

## Scope

In scope: cover/background banner, avatar, display name, username, joined date.

Out of scope (later sections of the same screen): bio text, Follow/⋯ action buttons, the
Reviews/Lists/Followers/Following stats row, Signature Team grid, Recent Activity feed, and the
stats sidebar.

## Content & copy

- **Cover/background banner** — purely decorative, the same for every profile. There's no schema
  field or upload path for a per-user cover image, and none is planned this iteration, so this is
  a static gradient treatment taken from the design source rather than user data.
- **Avatar** — reuses the same pattern already shipped for the nav avatar (`NavAvatarMenu`): show
  the *profile owner's* `User.image` when set (e.g. GitHub OAuth users), otherwise a gradient
  letter badge showing the first letter of their username. The design's static "D" badge is just
  that fallback state, not a fixed default — sized and shaped per the design (larger, more
  rounded-square than the nav's circular badge), overlapping the bottom edge of the banner.
- **Display name** — `User.name`. Fall back to `User.username` if `name` is null (OAuth doesn't
  always populate a display name).
- **Username line** — `@username`, plus joined date. The design also shows a "· Kanto ·" location
  segment and a "PRO" badge — both are skipped this iteration since there's no `location` field on
  `User` and `isPro` gating isn't part of this section's scope.
- **Joined date** — derived from `User.createdAt`, formatted like the design's "joined Mar 2023"
  (month + year, no day).

## Layout & components

- Banner sits above the avatar/name block, full width of the profile content area, with rounded
  corners matching the card language used elsewhere on the site.
- Avatar overlaps the bottom edge of the banner (the design achieves this via a negative margin
  pulling the content row up under the banner) and sits to the left of the name/username block, per
  the design.
- Name and the "@username · joined {date}" line stack vertically next to the avatar, name on top.
- This is a server component fetching the profile owner's `User` row by `username` (the page
  already receives `username` via the route param) — no client interactivity needed for this
  section.

## Interactions

None — this section is fully static/presentational. No edit affordance for the banner or avatar
this iteration (no upload feature exists yet).

## Responsive notes

Follow the same general pattern as other pages that already have a mobile layout treatment
(detail page): banner and avatar scale down at narrow widths rather than breaking, avatar stays
anchored to the banner. Exact breakpoint behavior is an implementation detail — pull from the
design source if it shows a mobile variant of this screen, otherwise keep it simple (shrink
proportionally) since no mobile mock is confirmed to exist for this screen yet.

## Out of scope

- Bio paragraph, Follow/⋯ buttons, stats row, Signature Team grid, Recent Activity, stats sidebar
  — all separate sections of the same profile screen, future iterations.
- Cover/avatar upload or editing of any kind.
- `location` field and "PRO" badge — no backing data this iteration.
- Viewing your own profile vs. someone else's differing in any way (e.g. an "Edit profile" button)
  — not part of this section.

## Acceptance criteria

- Visiting `/u/[username]` for a real, existing user shows the banner, their avatar (real image or
  letter fallback), display name, `@username`, and a correctly formatted joined date.
- A user with `User.image` set shows that image as the avatar; a user without one shows the letter
  fallback — consistent with how the nav avatar already behaves.
- A user with no `name` set falls back to showing their username as the display name instead of
  leaving it blank.
- No layout break from 375px to 1920px.

## History
