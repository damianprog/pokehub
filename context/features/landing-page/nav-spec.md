# Landing Page — Nav Section Spec

## Status

Planning — not started

## Goal

Sticky top navigation bar for the logged-out landing page.

## Design reference

`PokeHub-Landing.dc.html` — sticky nav block (top of page). See also [overview.md](./overview.md).

## Content & copy

- Logo: "P" gradient badge + "PokeHub" wordmark
- Nav link: instead of "Browse Pokémon" should be "Pokedex"
- Buttons: "Log in", "Sign up free"

## Layout & components

- Sticky positioned, full-width bar, dark background matching page bg with a subtle bottom border
- Logo left-aligned, nav link + auth buttons right-aligned
- "Sign up free" styled as the primary gradient button; "Log in" as a secondary/ghost button

## Interactions

- "Log in" / "Sign up free" open the [auth modal](./auth-modal-spec.md) in the corresponding state (no real submission — see that spec)
- "Pokedex" links to the Pokémon browse/discover route (`/discover` per `project-overview_8.md` §6, even though that page isn't built yet)

## Responsive notes

- Collapse or hide the nav link on narrow widths if needed; logo + auth buttons must remain visible and usable down to 375px

## Out of scope

- Real auth submission (see [auth-modal-spec.md](./auth-modal-spec.md))
- Mobile hamburger menu, unless needed to avoid overflow at 375px

## Acceptance criteria

- Nav renders and stays sticky on scroll
- Buttons open the modal in the correct state
- No layout break from 375px to 1920px

## History
