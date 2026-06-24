# Landing Page — Pack Tease Spec

## Status

Planning — not started

## Goal

A full-width promotional card directly below the Testimonials section. Two-column layout: left side is copy + CTA, right side is three mini pack cards (Magikarp COMMON, Gengar RARE, Shiny Charizard) staggered at different vertical heights. Acts as a teaser for the daily pack mechanic.

## Design reference

`PokeHub-Landing.dc.html` — `<!-- PACK TEASE -->` block immediately below the reviews section. See also [overview.md](./overview.md).

## Layout & structure

- `<section>` wrapper: `max-width: 1180px`, `margin: 0 auto`, `padding: 0 26px 90px`
- Inner card: `position: relative`, `overflow: hidden`, `border-radius: 22px`, `padding: 48px 52px`
  - `display: grid`, `grid-template-columns: 1fr 460px`, `gap: 48px`, `align-items: center`
  - Background: `linear-gradient(120deg, #1a1626, #221836 50%, #1a1626)`
  - Border: `1px solid rgba(196,79,224,0.2)`
- Decorative glow orb (non-interactive): `position: absolute`, `top: -80px`, `right: 180px`, `width: 320px`, `height: 320px`, `border-radius: 50%`, `background: rgba(196,79,224,0.06)`, `pointer-events: none`

## Text column (left, `position: relative; z-index: 1`)

### Eyebrow badge

| Property | Value |
|---|---|
| Layout | `display: inline-flex`, `align-items: center`, `gap: 7px`, `height: 26px`, `padding: 0 11px` |
| Border-radius | `7px` |
| Background | `linear-gradient(135deg, rgba(255,216,107,0.15), rgba(255,158,216,0.15))` |
| Border | `1px solid rgba(255,200,150,0.3)` |
| Margin | `margin-bottom: 18px` |
| Text | `✦ FREE DAILY PACK` |
| Text style | `font-size: 11px`, `font-weight: 800`, `letter-spacing: 0.1em` |
| Text fill | gradient text `linear-gradient(90deg, #ffd86b, #ff9ed8)` via `background-clip: text` |

### Heading

| Property | Value |
|---|---|
| Text | "Open a pack,\nevery single day." |
| Font | Space Grotesk, 800, 34px, `letter-spacing: -0.025em`, `line-height: 1.1` |
| Margin | `0 0 14px` |

### Body copy

| Property | Value |
|---|---|
| Text | "Three Pokémon per pack, free forever. Chase real 1-in-4,096 shiny odds, earn dust from duplicates, and track your pity counter across every pull." |
| Font | Hanken Grotesk, 16px, `line-height: 1.65`, `color: #9aa0ab` |
| Max-width | `380px` |
| Margin | `0 0 28px` |

### CTA button

| Property | Value |
|---|---|
| Text | "Claim your first pack" |
| Height | `48px` |
| Padding | `0 28px` |
| Border-radius | `12px` |
| Border | none |
| Background | `linear-gradient(135deg, #ff7a45, #c44fe0)` |
| Font | Hanken Grotesk, 700, 15px, `color: #fff` |
| Box-shadow | `0 8px 24px rgba(196,79,224,0.35)` |
| Action | Opens signup modal (static `<button>` for now) |

## Pack cards column (right)

Container: `display: flex`, `gap: 12px`, `align-items: flex-end`, `justify-content: center`, `position: relative`, `z-index: 1`

All three cards share: `width: 136px`, `height: 190px`, `border-radius: 13px`, `overflow: hidden`, `flex: none`, `position: relative`

Inside every card:
- **Texture overlay** (absolute, inset 0, z-index below artwork): `repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0 2px, transparent 2px 11px)`
- **Artwork** (`next/image`): `position: absolute`, `width: 76%`, `height: 52%`, `object-fit: contain`, `bottom: 32px`, `left: 50%`, `transform: translateX(-50%)`, `filter: drop-shadow(0 6px 12px rgba(0,0,0,0.45))`
- **Name label**: `position: absolute`, `bottom: 14px`, `left: 11px`, `font-weight: 700`, `font-size: 12px`, `color: #fff`
- **Rarity label**: `position: absolute`, `bottom: 3px`, `left: 11px`, `font-size: 9px`, `font-weight: 700`, `letter-spacing: 0.08em`

### Card data

| Card | Pokémon | ID | Sprite | Background | Border | Box-shadow | Vertical offset | Rarity text | Rarity color | Extra |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Magikarp | 129 | `/{id}.png` | `radial-gradient(circle at 50% 70%, #4aa3e0, #1a3050)` | `1px solid rgba(140,170,200,0.22)` | — | `top: 12px` (pushed down) | COMMON | `#9ec0e0` | — |
| 2 | Gengar | 94 | `/{id}.png` | `radial-gradient(circle at 50% 70%, #8b6fd4, #2e1e5a)` | `1px solid rgba(150,120,220,0.38)` | `0 0 18px rgba(139,111,212,0.25)` | none (center) | RARE | `#c4aaf0` | — |
| 3 | Shiny Charizard | 6 | `/shiny/{id}.png` | `radial-gradient(circle at 50% 70%, #ffd07a, #c44fe0 78%)` | none | — | `top: -8px` (raised up) | ✦ SHINY | `#fff` (with `text-shadow: 0 1px 3px rgba(0,0,0,0.4)`) | shimmer + shinyPulse animations; ✦ sparkle at `top: 8px; right: 9px; font-size: 12px` |

Sprite URL base: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork`

### Shiny card animations (card 3)

Both `shimmer` and `shinyPulse` keyframes already exist in `globals.css` (used by the Hero component).

- **Shimmer overlay** (absolute, inset 0, `z-index: 2`, `pointer-events: none`): `background: linear-gradient(115deg, transparent 38%, rgba(255,255,255,0.52) 50%, transparent 62%)`, `background-size: 300% 100%`, `animation: shimmer 2.8s linear infinite`
- **Card pulse**: `animation: shinyPulse 2.6s ease-in-out infinite`
- **Name label** gets `text-shadow: 0 1px 3px rgba(0,0,0,0.3)`, `z-index: 3`
- **Rarity label** gets `font-weight: 800`, `z-index: 3`
- **Artwork** gets `z-index: 1`

## Implementation

- Component: `src/components/landing/PackTease.tsx` — needs `'use client'` only if CTA is wired to modal state; keep as static `<button>` for now → Server Component
- Mount in `src/app/page.tsx` immediately after `<Testimonials />`

## Responsive

- ≥ 768px: 2-column grid (`1fr 460px`) as designed
- < 768px: single column — text column stacked above cards column; cards row stays as a flex row (they're narrow enough to fit 3-wide at 375px: 3×136 + 2×12 = 432px, which overflows slightly — reduce card widths to `110px` and gap to `8px` on mobile as a pragmatic fix)

## Out of scope

- Functional CTA (auth modal wired in a later spec)
- Hover/click states on pack cards (not in design)

## Acceptance criteria

- Purple-tinted card renders full-width within the `1180px` container with decorative glow orb
- Left column: eyebrow badge with gradient text, heading, body copy, gradient CTA button — all matching spec
- Right column: three staggered mini pack cards; Magikarp pushed down 12px, Charizard raised 8px, Gengar centered
- Shiny Charizard card shows shimmer sweep and pulse glow animations, ✦ sparkle in top-right
- Name and rarity labels visible at bottom of each card
- Layout stacks vertically on mobile with cards fitting without horizontal scroll

## History
