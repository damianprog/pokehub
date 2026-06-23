# Landing Page — Marquee Bar Spec

## Status

Planning — not started

## Goal

Auto-scrolling Pokémon strip between the hero and the features section, showing popular Pokémon with their community star ratings. Acts as an animated separator and social-proof signal.

## Design reference

`PokeHub-Landing.dc.html` — `<!-- MARQUEE -->` block immediately below the hero section. See also [overview.md](./overview.md).

## Layout & structure

- Full-width bar (`w-full`, outside the 1180px content max-width)
- `overflow: hidden`, vertical padding `14px 0`
- Top and bottom borders: `1px solid rgba(255,255,255,0.06)`
- Background: `rgba(255,255,255,0.015)`
- Inner track: `display: flex; gap: 8px; width: max-content` with `scrollLeft 42s linear infinite` animation

## Seamless loop

Content is duplicated (set 1 + identical set 2). The animation translates by `-50%` — when set 1 exits the viewport, set 2 is already in position and the loop restarts without a visible jump.

## Item anatomy

Each item: `[avatar 42×42] [name + rating]`, padding `0 14px`. Vertical hairline dividers `1px × 36px rgba(255,255,255,0.06)` between every item.

### Avatar

- `42×42px`, `border-radius: 10px`, `overflow: hidden`, unique `radial-gradient(circle at 50% 60%, <light>, <dark>)` background per Pokémon
- `next/image` official-artwork sprite, `object-fit: contain`, `padding: 3px`

### Text

- Name: Space Grotesk, bold, 13px, `#e8eaed`
- Rating: Space Grotesk, bold, 11.5px, `#e6b450`, prefixed with `★`

## Pokémon list and avatar colors

| Pokémon | ID | Gradient (center → edge) | Rating |
|---|---|---|---|
| Charizard | 6 | `#ff8a4c → #a83a1a` | ★ 4.3 |
| Gengar | 94 | `#8b6fd4 → #2e1e5a` | ★ 4.6 |
| Dragonite | 149 | `#e6a84a → #8a5a20` | ★ 4.7 |
| Gardevoir | 282 | `#e89ec8 → #7a2a6a` | ★ 4.4 |
| Rayquaza | 384 | `#2aaa6a → #1a5a3a` | ★ 4.8 |
| Garchomp | 445 | `#6a5acd → #3a2a7a` | ★ 4.5 |
| Gyarados | 130 | `#4aa3e0 → #2a5a8a` | ★ 4.5 |
| Espeon | 196 | `#c88ae8 → #7a3a9a` | ★ 4.2 |
| Ho-oh | 250 | `#ff9a3a → #b84a20` | ★ 4.6 |
| Snorlax | 143 | `#b8a878 → #6a5838` | ★ 4.4 |
| Mimikyu | 778 | `#e89ec8 → #4a2a5a` | ★ 4.4 |
| Tyranitar | 248 | `#7a8a9a → #3a4654` | ★ 4.3 |

Sprite URL pattern: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/{id}.png`

## Animation

Add to `globals.css`:

```css
/* inside @theme inline */
--animate-scroll-left: scrollLeft 42s linear infinite;

/* keyframe */
@keyframes scrollLeft {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
```

## Implementation

- Component: `src/components/landing/Marquee.tsx` — Server Component, no `'use client'`
- Mount in `src/app/page.tsx` immediately after `<Hero />`

## Out of scope

- Pause on hover
- Live data (Pokémon and ratings are hardcoded per design)

## Acceptance criteria

- Strip scrolls smoothly with no visible seam on loop restart
- No layout break from 375px to 1920px (full-width, overflow hidden)
- Pokémon images load via `next/image` without remote-pattern errors

## History
