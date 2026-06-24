# Landing Page — Testimonials (Reviews) Spec

## Status

Planning — not started

## Goal

Three-column grid of community review cards directly below the trending grid. Shows real-looking trainer reviews with ratings and Pokémon thumbnails — social proof that the platform has genuine opinion content.

## Design reference

`PokeHub-Landing.dc.html` — `<!-- REVIEWS -->` block immediately below the trending section. See also [overview.md](./overview.md).

## Layout & structure

- `<section>` wrapper: `max-width: 1180px`, `margin: 0 auto`, `padding: 0 26px 90px`
- `<h2>` heading directly above the grid, `margin-bottom: 24px`
- Card grid: `display: grid`, `grid-template-columns: repeat(3, 1fr)`, `gap: 16px`

## Section heading

| Property | Value |
|---|---|
| Text | "What trainers are saying" |
| Element | `<h2>` |
| Font | Space Grotesk, 700, 26px, `letter-spacing: -0.02em` |
| Margin | `0 0 24px` |

## Card anatomy (shared)

Each card is an `<article>`:

| Property | Value |
|---|---|
| Background | `#15181e` |
| Border | `1px solid rgba(255,255,255,0.06)` |
| Border-radius | `16px` |
| Padding | `22px` |

### 1 — Header row

`display: flex`, `align-items: center`, `gap: 11px`, `margin-bottom: 14px`. Three children:

**User avatar (left)**
- `width: 38px`, `height: 38px`, `border-radius: 50%`, `flex: none`
- Background: per-user gradient (see data table)
- Content: first letter of username, `font-weight: 800`, `color: #fff`, `font-size: 14px`
- Centered with `display: flex; align-items: center; justify-content: center`

**User info (middle, `flex: 1`)**
- Username: `font-weight: 700`, `font-size: 14px`, `color: #e8eaed`
- Sub-line: `font-size: 12px`, `color: #9aa0ab` — text "reviewed ", then `<span>` with Pokémon name in per-card accent color

**Pokémon thumbnail (right)**
- `flex: none`, `width: 38px`, `height: 38px`, `border-radius: 9px`, `overflow: hidden`
- Background: per-card `radial-gradient` matching the Pokémon's palette
- `next/image` official-artwork sprite: `width: 100%`, `height: 100%`, `object-fit: contain`, `padding: 2px`

### 2 — Star rating row

`display: flex`, `align-items: center`, `gap: 8px`, `margin-bottom: 12px`

**Partial-fill star technique** — two overlapping `★★★★★` strings inside a `position: relative; display: inline-block`:
- Base layer: `color: #363b45`, `font-size: 15px`, `letter-spacing: 2px`, `font-family: Arial`
- Gold overlay: `position: absolute; left: 0; top: 0; color: #e6b450; overflow: hidden; white-space: nowrap; width: <percent>%` (see data table)

**Numeric rating** beside the stars: Space Grotesk, 700, 13px, `color: #e6b450`

### 3 — Review text

`font-size: 14px`, `line-height: 1.6`, `color: #cdd2da`, `margin: 0 0 12px`

### 4 — Helpful count

`font-size: 12.5px`, `color: #7b818c`. Format: `♥ N found this helpful`

## Review card data

| # | Username | Avatar letter | Avatar gradient | Pokémon | Pokémon ID | Pokémon name color | Thumbnail gradient | Rating | Star fill % | Review text | Helpful |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | anna_g | A | `#e85b9e → #b89ee0` | Gardevoir | 282 | `#e89ec8` | `#e89ec8 → #7a2a6a` | 4.5 | 90% | "Elegance incarnate. Mega Gardevoir turns a graceful fairy into a wallbreaker with actual menace — the design earns every bit of its fandom." | 134 |
| 2 | ghosttype_andy | G | `#8b6fd4 → #4a3a8a` | Gengar | 94 | `#b6a0e6` | `#8b6fd4 → #2e1e5a` | 5.0 | 100% | "Peak ghost-type design. That grin has haunted me since 1998 and I would not change a single pixel. Hands-down the most characterful silhouette in Kanto." | 98 |
| 3 | kanto_kris | K | `#4aa3e0 → #2a5a8a` | Magikarp | 129 | `#7fb6ff` | `#4aa3e0 → #2a5a8a` | 2.0 | 40% | "Splash does nothing. Tackle barely registers. But I respect the grind — there's a dragon hiding in there and I'd flop for it any day." | 61 |

Thumbnail gradient is `radial-gradient(circle at 50% 60%, <light>, <dark>)`.

Sprite URL pattern: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/{id}.png`

## Implementation

- Component: `src/components/landing/Testimonials.tsx` — Server Component, no `'use client'`
- Mount in `src/app/page.tsx` immediately after `<TrendingGrid />`
- Content is fully hardcoded — no data fetching

## Responsive

- ≥ 768px: 3-column grid (as designed)
- < 768px: 1-column stack (pragmatic fallback — no mobile reference in the prototype)

## Out of scope

- Hover states on cards (not present in the design)
- Functional "found this helpful" button (static text only)
- Live review data (content is hardcoded per design)

## Acceptance criteria

- Section heading "What trainers are saying" renders in Space Grotesk above the grid
- Three cards render side-by-side at desktop widths, each with: gradient avatar, username + "reviewed [Pokémon]" line, partial-fill star rating + numeric value, review quote text, helpful count
- Pokémon thumbnails use correct artwork and matching radial-gradient backgrounds
- Layout stacks to 1-column below 768px with no overflow

## History
