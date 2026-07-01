# Spec — `PokemonArtwork` component

> **Status:** spec / pre-implementation
> **Scope:** the sticky left-column artwork card on `/p/[slug]`.
> **Out of scope:** action buttons below the card (separate component); info column sections (name, types, height/weight, community rating, base stats, reviews); auth-gated review form; shiny toggle; mobile layout.

---

## 1. Goal & scope

A single `PokemonArtwork` RSC that renders the artwork card in the sticky left panel on the Pokémon detail page: a square with a per-type radial-gradient background, crosshatch texture overlay, ghosted Pokédex number watermark, and the official artwork image with a gentle floating animation.

The component sits inside the left column of the `grid-template-columns:392px 1fr` wrapper that exists on the page. The wrapper div is `position:sticky; top:90px` (90px clears the sticky nav). This spec covers only the artwork card itself; wiring it into the page grid is part of the page iteration.

---

## 2. Visual spec (from Claude Design)

### 2.1 Artwork card

| Property | Value |
|---|---|
| Container size | `aspect-ratio:1` (fills the 392px column) |
| Border radius | `22px` |
| Overflow | `hidden` |
| Background | per-type radial gradient — `circle at 50% 70%` (see §3) |
| Box shadow | per-type glow (see §3) |
| Texture overlay | `repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0 2px, transparent 2px 11px)` — `position:absolute; inset:0` |
| Pokédex watermark | `position:absolute; top:18px; left:20px` — Space Grotesk 700, `88px`, `rgba(255,255,255,0.09)`, `user-select:none`, zero-padded to 3 digits with a `#` prefix (e.g. `#006`) |
| Artwork image | `position:absolute; width:88%; height:88%; object-fit:contain; bottom:0; left:50%; transform:translateX(-50%)` — `filter:drop-shadow(0 18px 44px rgba(0,0,0,0.5))` and `floaty` animation |
| Float animation | `floaty 5s ease-in-out infinite` — already defined in `globals.css` from the hero section; do not redeclare |

---

## 3. Per-type gradient map

The card background and box-shadow tint are keyed to the Pokémon's **primary type** (first element of `pokemon.types`, lowercased). Unknown types fall back to a neutral dark gradient.

| Type | Gradient stops (light → dark) | Box-shadow colour |
|---|---|---|
| fire | `#ff7a2a → #8a2010` | `rgba(168,51,26,0.35)` |
| ghost | `#8b6fd4 → #4a3a8a` | `rgba(74,58,138,0.35)` |
| poison | `#8b6fd4 → #4a3a8a` | `rgba(74,58,138,0.35)` |
| water | `#4aa3e0 → #2a5a8a` | `rgba(42,90,138,0.35)` |
| electric | `#e6c84a → #8a7020` | `rgba(138,112,32,0.35)` |
| psychic | `#e89ec8 → #7a3a6a` | `rgba(122,58,106,0.35)` |
| fighting | `#d04a4a → #7a2828` | `rgba(122,40,40,0.35)` |
| dragon | `#e6a84a → #8a5a20` | `rgba(138,90,32,0.35)` |
| normal | `#b8a878 → #6a5838` | `rgba(106,88,56,0.35)` |
| grass | `#78c850 → #3a6820` | `rgba(58,104,32,0.35)` |
| ice | `#98d8d8 → #3a7880` | `rgba(58,120,128,0.35)` |
| rock | `#b8a038 → #6a5818` | `rgba(106,88,24,0.35)` |
| ground | `#e0c068 → #887030` | `rgba(136,112,48,0.35)` |
| bug | `#a8b820 → #506010` | `rgba(80,96,16,0.35)` |
| dark | `#5a5878 → #2a2838` | `rgba(42,40,56,0.35)` |
| steel | `#b8b8d0 → #585878` | `rgba(88,88,120,0.35)` |
| fairy | `#ee99ac → #8a4060` | `rgba(138,64,96,0.35)` |
| flying | `#a890f0 → #5a4098` | `rgba(90,64,152,0.35)` |
| _(fallback)_ | `#3a3f4a → #1e2228` | `rgba(0,0,0,0.35)` |

All gradients use `radial-gradient(circle at 50% 70%, <light>, <dark> 80%)`. Box-shadow is `0 24px 60px <colour>`.

---

## 4. Props

The component receives the fields it needs from the `Pokemon` record the page already holds:

- `id` — Pokédex number, used for the watermark
- `name` — used for the `<img>` alt text
- `artworkUrl` — URL of the official artwork image
- `types` — string array; primary type is `types[0]`

No user-state props in this iteration (buttons are static).

---

## 5. File location

`src/components/pokemon/PokemonArtwork.tsx`

---

## 6. Deliberate non-goals (this iteration)

- **Action buttons** ("Write review", ♥, +) — separate component, separate iteration.
- **Shiny toggle** — a shiny artwork variant exists in the schema (`shinyArtworkUrl`) and design but is out of scope here.
- **Mobile layout** — the two-column grid collapses to a single column on small screens; that responsive pass is a separate concern.

---

## 7. Testing

- `/p/charizard` → fire gradient card, `#006` watermark, floating artwork, all three buttons visible.
- `/p/gengar` → ghost/purple gradient, `#094` watermark.
- `/p/magikarp` → water gradient, `#129` watermark.
- Any Pokémon with an unrecognised primary type → dark fallback gradient, no crash.
