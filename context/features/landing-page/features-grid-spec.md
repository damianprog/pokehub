# Landing Page — Features Grid Spec

## Status

Planning — not started

## Goal

Three-column feature card grid below the marquee. Communicates the three core pillars of PokeHub (Rate & Review, Daily Packs, Lists & Discovery) to logged-out visitors with a centred heading block and icon cards.

## Design reference

`PokeHub-Landing.dc.html` — `<!-- FEATURES -->` block immediately below the marquee. See also [overview.md](./overview.md).

## Layout & structure

- `<section>` wrapper: `max-width: 1180px`, `margin: 90px auto 0`, `padding: 0 26px`
- Centred heading block: `text-align: center`, `margin-bottom: 50px`
- Card grid: `display: grid`, `grid-template-columns: repeat(3, 1fr)`, `gap: 22px`, `margin-bottom: 90px`

## Heading block

| Element | Value |
|---|---|
| `<h2>` text | "Everything for the Pokémon enthusiast" |
| `<h2>` font | Space Grotesk, 700, 36px, `letter-spacing: -0.025em` |
| `<h2>` margin | `0 0 12px` |
| `<p>` text | "One place to rate, collect, and obsess." |
| `<p>` font | Hanken Grotesk, 17px, `#7b818c` |
| `<p>` margin | `0` |

## Card anatomy (shared)

| Property | Value |
|---|---|
| Background | `#15181e` |
| Border | `1px solid rgba(255,255,255,0.06)` |
| Border-radius | `18px` |
| Padding | `28px` |

### Icon chip (shared)

| Property | Value |
|---|---|
| Size | `48×48px` |
| Border-radius | `13px` |
| Margin-bottom | `18px` |
| Icon font-size | `22px` |

### Card title (shared)

Space Grotesk, 700, 20px, `margin: 0 0 10px`, color `#e8eaed` (default body).

### Card body (shared)

Hanken Grotesk, 14.5px, `line-height: 1.65`, color `#8b919e`.

## Cards

### Card 1 — Rate & Review

| Property | Value |
|---|---|
| Icon symbol | `★` |
| Icon color | `#ff9a6b` |
| Icon bg | `linear-gradient(135deg, rgba(255,122,69,0.2), rgba(196,79,224,0.2))` |
| Icon border | `1px solid rgba(255,122,69,0.3)` |
| Title | "Rate & Review" |
| Body | "Write in-depth reviews for every Pokémon across all nine generations. Build your personal ratings and share your takes with the community." |

### Card 2 — Daily Packs

| Property | Value |
|---|---|
| Icon symbol | `◆` |
| Icon color | `#7fb6ff` |
| Icon bg | `linear-gradient(135deg, rgba(110,170,255,0.18), rgba(196,79,224,0.18))` |
| Icon border | `1px solid rgba(110,170,255,0.3)` |
| Title | "Daily Packs" |
| Body | "Unwrap a free pack of 3 Pokémon every day. Chase genuine 1-in-4,096 shinies, build your collection, and trade duplicates for dust." |

> **Copy note:** the body copy says "1-in-4,096" (classic mainline shiny rate). The spec (§4.1) defines shiny odds as a flat 0.5% (~1-in-200). This is an unresolved design vs spec discrepancy (see `project-overview_8.md` §15.4). Implement with the design's copy for now; resolve before launch.

### Card 3 — Lists & Discovery

| Property | Value |
|---|---|
| Icon symbol | `≡` |
| Icon color | `#5cb85c` |
| Icon bg | `linear-gradient(135deg, rgba(92,184,92,0.18), rgba(74,163,224,0.18))` |
| Icon border | `1px solid rgba(92,184,92,0.3)` |
| Title | "Lists & Discovery" |
| Body | "Curate ranked lists like \"Underrated Gen 1 Sweepers\" or \"Best Fairy designs.\" Follow trainers with your taste and see what's trending." |

## Implementation

- Component: `src/components/landing/FeaturesGrid.tsx` — Server Component, no `'use client'`
- Mount in `src/app/page.tsx` immediately after `<Marquee />`
- Icon symbols are plain Unicode characters — no icon library needed

## Responsive

- ≥ 768px: 3-column grid (as designed)
- < 768px: single column (pragmatic fallback — no mobile reference in the prototype)

## Out of scope

- Hover states on cards (not present in the design)
- Any interactivity

## Acceptance criteria

- Three cards render in a 3-column grid at desktop widths
- Heading and subheading are centred above the grid
- Each card's icon chip colour matches the per-card gradient and border spec above
- Layout collapses to single column below 768px with no overflow

## History
