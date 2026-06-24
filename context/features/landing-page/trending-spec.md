# Landing Page — Trending This Week Spec

## Status

Planning — not started

## Goal

Six-column ranked grid of the most-rated Pokémon this week, directly below the features grid. Acts as social proof and a browse teaser for logged-out visitors.

## Design reference

`PokeHub-Landing.dc.html` — `<!-- TRENDING -->` block immediately below the features grid. See also [overview.md](./overview.md).

## Layout & structure

- `<section>` wrapper: `max-width: 1180px`, `margin: 0 auto`, `padding: 0 26px 90px`
- Header row: `display: flex`, `align-items: baseline`, `justify-content: space-between`, `margin-bottom: 24px`
- Card grid: `display: grid`, `grid-template-columns: repeat(6, 1fr)`, `gap: 14px`
- CTA row: `text-align: center`, `margin-top: 24px`

## Header row

| Element | Value |
|---|---|
| `<h2>` text | "Trending this week" |
| `<h2>` font | Space Grotesk, 700, 26px, `letter-spacing: -0.02em` |
| `<h2>` margin | `0` |
| caption text | "Based on 214k trainer ratings" |
| caption font | Hanken Grotesk, 13px, `#7b818c` |

## Card anatomy (shared)

| Property | Value |
|---|---|
| Background | `#15181e` |
| Border | `1px solid rgba(255,255,255,0.07)` |
| Border-radius | `14px` |
| Padding | `14px` |
| Text-align | `center` |
| Cursor | `pointer` |

### Rank badge

Space Grotesk, 700, 11px, color `#5c636e`, `margin-bottom: 8px`. Text: `#1` … `#6`.

### Image container

- `aspect-ratio: 1`, `border-radius: 10px`, `overflow: hidden`, `margin-bottom: 10px`
- Per-Pokémon `radial-gradient(circle at 50% 60%, <light>, <dark>)` background
- `next/image` official-artwork sprite: `width/height 100%`, `object-fit: contain`, `padding: 5px`

### Name

Hanken Grotesk, 700, 13.5px, `margin-bottom: 4px`, color `#e8eaed`.

### Rating

Space Grotesk, 700, 13px, color `#e6b450`. Format: `★ X.X`.

## Pokémon data

| Rank | Name | ID | Gradient (center → edge) | Rating |
|---|---|---|---|---|
| #1 | Rayquaza | 384 | `#2aaa6a → #1a5a3a` | ★ 4.8 |
| #2 | Dragonite | 149 | `#e6a84a → #8a5a20` | ★ 4.7 |
| #3 | Gengar | 94 | `#8b6fd4 → #2e1e5a` | ★ 4.6 |
| #4 | Ho-oh | 250 | `#ff9a3a → #b84a20` | ★ 4.6 |
| #5 | Garchomp | 445 | `#6a5acd → #3a2a7a` | ★ 4.5 |
| #6 | Gyarados | 130 | `#4aa3e0 → #2a5a8a` | ★ 4.5 |

Sprite URL pattern: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/{id}.png`

## CTA button

| Property | Value |
|---|---|
| Text | "Rate all 1,302 Pokémon →" |
| Height | `44px` |
| Padding | `0 26px` |
| Border-radius | `12px` |
| Border | `1px solid rgba(255,255,255,0.12)` |
| Background | `rgba(255,255,255,0.05)` |
| Font | Hanken Grotesk, 600, 14px, `#e8eaed` |
| Action | Opens signup modal (wire up when auth modal is implemented) |

## Implementation

- Component: `src/components/landing/TrendingGrid.tsx` — Server Component, no `'use client'`
- Mount in `src/app/page.tsx` immediately after `<FeaturesGrid />`
- CTA button needs `'use client'` only if wired to modal state; keep as static `<button>` for now

## Responsive

- ≥ 768px: 6-column grid (as designed)
- < 768px: 3-column grid (pragmatic fallback — no mobile reference in the prototype)

## Out of scope

- Hover states on cards (not present in the design)
- Live data (Pokémon and ratings are hardcoded per design)
- Functional CTA (auth modal wired in a later spec)

## Acceptance criteria

- Six cards render in a 6-column grid at desktop widths
- Each card shows rank badge, Pokémon artwork with correct gradient bg, name, and star rating
- "Rate all 1,302 Pokémon →" button appears centred below the grid
- Layout collapses to 3-column below 768px with no overflow

## History
