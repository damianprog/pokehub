# Landing Page — Hero Section Spec

## Status

Planning — not started

## Goal

Above-the-fold hero for the logged-out landing page: headline, supporting copy, primary/secondary CTAs, trust stats, and a floating Pokémon card-stack visual.

## Design reference

`PokeHub-Landing.dc.html` — hero `<section>` immediately below the nav. See also [overview.md](./overview.md).

## Content & copy

- Eyebrow badge (pill): "214,000 trainers & counting"
- Headline (3 lines): "Rate every" / "Pokémon." / "Chase every shiny." — third line styled with the brand gradient text treatment
- Subheading: "The community Pokédex — write reviews, build ranked lists, open daily packs, and track your shiny luck across all 1,302."
- Primary CTA: "Start for free"
- Secondary CTA: "Browse Pokedex"
- Stat row (3 stats, divided by vertical hairlines):
  - "8.4M" — reviews written
  - "1,302" — Pokémon rated
  - "1 in 4,096" — shiny odds
- Floating notification pill (part of the visual, not the stat row): "✦ Shiny pull! damian · 1 in 4,096"

> **Known discrepancy (unresolved, see `project-overview_8.md` §15.4):** the "1 in 4,096" shiny-odds stat and notification pill match the design's classic-mainline-rate concept, but the spec (§4.1) documents a flat 0.5% per-slot shiny rate with no shiny-specific pity counter. Per `overview.md`'s shared scope decision, marketing stats stay exactly as shown in the design for this static phase — implement "1 in 4,096" as literal placeholder copy. Do not wire it to real pack logic; that discrepancy must be resolved before the pack-opening feature is built.

## Layout & components

- Two-column grid: text column (left, flexible width) + visual column (right, fixed ~500px), vertically centered, max content width matching nav (1180px)
- Text column: eyebrow badge → headline → subheading → CTA row (primary gradient button + secondary outline button) → stat row
- Visual column: a stack of three Pokémon "cards" (rounded rectangles with artwork, name, and a type/rarity caption) layered with rotation/offset to look hand-fanned:
  - Back-left card, rotated, dimmed (Gengar, "GHOST · RARE")
  - Back-right card, rotated opposite direction, dimmed (Gardevoir, "FAIRY · ULTRA RARE")
  - Front-center card, upright, full opacity, shiny treatment (shimmer sweep + soft pulsing glow), elevated above the other two (Charizard, "✦ SHINY · ULTRA RARE")
  - A small floating pill anchored at the bottom of the stack showing the "Shiny pull!" notification
- Card artwork: official-artwork sprites from `raw.githubusercontent.com/PokeAPI/sprites` (per `project-overview_8.md` §8.2) — use `next/image`. **Prerequisite:** `next.config.ts` has no `images.remotePatterns` yet; add an entry for `raw.githubusercontent.com` as part of this spec (first section that needs it).
- Recreate the shimmer sweep, pulsing glow, and gentle float as CSS/Tailwind keyframe animations (per overview.md shared scope decisions — no animation library)

## Interactions

- "Start for free" opens the [auth modal](./auth-modal-spec.md) in signup state
- "Browse Pokedex" links to `/discover` (per `project-overview_8.md` §6)
- Card stack and notification pill are decorative/static — no click interaction

## Responsive notes

- Below the two-column breakpoint, stack the visual under the text column (or hide it if it causes excessive scroll height — use judgment, no mobile reference in the design)
- Stat row and CTA buttons must remain on screen and usable down to 375px; wrap or shrink as needed without overlapping text

## Out of scope

- Any real stats/data wiring (counts are static placeholder copy)
- Resolving the shiny-odds discrepancy noted above
- Auth modal implementation (see [auth-modal-spec.md](./auth-modal-spec.md))

## Acceptance criteria

- Hero renders with headline gradient text, both CTAs, stat row, and the three-card stack with shiny animation
- "Start for free" / "Browse Pokedex" behave per Interactions
- No layout break from 375px to 1920px
- Pokémon sprite images load via `next/image` without remote-pattern console errors

## History
