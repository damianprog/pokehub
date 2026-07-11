# Landing Page — Signed-In Nav Spec

## Status

Planning — not started

## Goal

Signed-in variant of the top navigation bar, shown at `/` (and generally site-wide) once a user
is authenticated, replacing the logged-out nav's "Log in" / "Sign up free" buttons with the
authenticated navigation and account menu.

## Design reference

`PokeHub.dc.html` — the sticky header at the top of the main app (Feed screen). See also
[nav-spec.md](./nav-spec.md) for the logged-out counterpart and [overview.md](./overview.md).

## Content & copy

- Logo: same "P" gradient badge + "PokeHub" wordmark as the logged-out nav
- Nav links: "Feed", "Browse", "Packs"
- Search box (placeholder text per design)
- Pack currency pill (◆ icon + count)
- Circular avatar showing a single uppercase letter derived from the signed-in user's username
- Avatar dropdown with a single item: "Sign out"

## Layout & components

- Reuses the existing sticky header shell (logo left-aligned, same height/background/border as
  today's `Nav`). The signed-in content replaces the logged-out auth buttons once a session is
  present, rather than being a separate header element.
- Logo, nav links, search box, and currency pill sit left-to-right per the design; avatar is the
  rightmost element.
- Avatar is a filled circular badge with a gradient background (matching the design's purple
  gradient), single letter centered inside.
- Determining whether a session exists (and reading the signed-in user's username) is an
  implementation detail — follow whatever pattern the rest of the app already uses for reading
  session state client-side.

## Interactions

- "Feed", "Browse", and "Packs" all navigate to `/` for now — their real destinations
  (`/discover`, `/packs`, etc. per `project-overview_8.md` §6) don't exist yet. No active-tab
  state is implied by this since all three currently point at the same place.
- Search box and pack currency pill are presentational only this iteration — no real search, no
  real dust balance. Static/placeholder content is acceptable, matching how other not-yet-built
  features have been staged in prior sections.
- Clicking the avatar opens a dropdown menu anchored to it, containing a single "Sign out" item.
- Selecting "Sign out" signs the user out and returns them to a logged-out state (redirecting to
  `/`, consistent with how sign-in flows elsewhere in the app already redirect to `/`).
- Dropdown should close on an outside click, on selecting the item, and (ideally) on Escape —
  standard dropdown behavior, no need to hand-roll if a suitable existing UI primitive covers it.

## Responsive notes

- Below the existing mobile breakpoint, collapse to just the logo/wordmark on the left and the
  avatar on the right — nav links, search box, and currency pill are hidden entirely, not
  shrunk or wrapped.
- The avatar's dropdown behavior (open on click, "Sign out" item) is unchanged on mobile.

## Out of scope

- Real search functionality
- Real dust/pack balance (static placeholder value is fine)
- Any account-menu items beyond "Sign out" (profile link, settings, etc. — future work)
- Active/current-tab highlighting for Feed/Browse/Packs, since they all resolve to the same route
  right now
- Building out the actual `/discover` or `/packs` destinations

## Acceptance criteria

- Signed-in users see this nav instead of the logged-out "Log in" / "Sign up free" nav, on `/` and
  anywhere else the shared nav renders
- Feed/Browse/Packs links all navigate to `/`
- Avatar shows the correct first-letter-of-username, opens a dropdown on click, and "Sign out"
  actually signs the user out
- Mobile view shows only branding + avatar, with the dropdown still functional
- No layout break from 375px to 1920px

## History
