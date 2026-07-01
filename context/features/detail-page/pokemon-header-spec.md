# Spec — `PokemonHeader` component

> **Status:** spec / pre-implementation
> **Scope:** the top of the right-hand "Info" column on `/p/[slug]` — Pokédex number label, Pokémon name heading, and the row of type badges.
> **Out of scope:** everything else in the Info column (height/weight/base XP bar, community rating, rate-it row, base stats, top reviews, lists featuring this Pokémon); mobile layout; interactivity.

---

## 1. Goal & scope

A single `PokemonHeader` RSC that renders the first three stacked elements inside the right
column of the `/p/[slug]` grid: the small grey Pokédex number, the large Pokémon name heading,
and the row of uppercase type badges below it. Same "ship the visual layer first" pattern already
used for `PokemonArtwork` and `PokemonActions` — purely presentational, real data props, no
interactivity yet.

The component is mounted at the top of the currently-empty info column placeholder in
`src/app/(app)/p/[slug]/page.tsx` (`{/* info column — next iterations */}`). It renders no
wrapping container of its own beyond what's needed to stack its three children — the parent info
column `<div>` already exists on the page.

---

## 2. Visual spec (from Claude Design)

Source: `PokeHub.dc.html`, Pokémon Detail screen, "Info" column, immediately following the
`392px 1fr` grid split — the three elements before the height/weight/base-XP bar.

### 2.1 Pokédex number label

| Property | Value |
|---|---|
| Font | Space Grotesk |
| Font size | `14px` |
| Color | `#7b818c` |
| Letter spacing | `0.05em` |
| Content | zero-padded to 3 digits with a `#` prefix (e.g. `#006`) — same formatting already used for the artwork watermark in `PokemonArtwork` |

### 2.2 Name heading

| Property | Value |
|---|---|
| Element | `<h1>` |
| Margin | `2px 0 12px` (2px top, 12px bottom) |
| Font | Space Grotesk, weight `700` |
| Font size | `52px` |
| Letter spacing | `-0.03em` |
| Line height | `1` |
| Content | `pokemon.name` verbatim (already display-cased at seed time, e.g. "Charizard") |

### 2.3 Type badges row

| Property | Value |
|---|---|
| Container | `display:flex; gap:8px; margin-bottom:18px` |
| One badge per entry in `pokemon.types` (1 or 2 badges) |

Each badge:

| Property | Value |
|---|---|
| Display | `inline-flex; align-items:center; justify-content:center` (implicit via height) |
| Height | `26px` |
| Padding | `0 12px` |
| Border radius | `7px` |
| Font size | `12px` |
| Font weight | `700` |
| Letter spacing | `0.04em` |
| Text transform | `uppercase` |
| Background / text color | per-type, see §3 |

---

## 3. Type badge color map

This is a **different** color pair per type than the radial-gradient artwork card background
(`TYPE_GRADIENTS` in `src/lib/type-gradients.ts`) — badges use a flat, low-opacity background
tint with a matching saturated text color, not gradient stops. Needs its own map.

| Type | Background | Text color |
|---|---|---|
| fire | `rgba(255,122,69,0.18)` | `#ff9a6b` |
| flying | `rgba(138,168,224,0.18)` | `#a8c4f0` |
| water | `rgba(74,163,224,0.18)` | `#7fb6ff` |
| psychic | `rgba(232,91,158,0.18)` | `#e889c0` |
| ghost | `rgba(139,111,212,0.18)` | `#b6a0e6` |
| dragon | `rgba(106,90,205,0.18)` | `#9a8ee0` |
| electric | `rgba(230,200,74,0.18)` | `#e6c84a` |
| poison | `rgba(160,64,160,0.18)` | `#c080c0` |
| ground | `rgba(224,192,104,0.18)` | `#d4aa50` |
| rock | `rgba(184,160,56,0.18)` | `#c8a840` |
| ice | `rgba(152,216,216,0.18)` | `#90d0d0` |
| fighting | `rgba(192,48,40,0.18)` | `#e05050` |
| bug | `rgba(168,184,32,0.18)` | `#a8b820` |
| steel | `rgba(184,184,208,0.18)` | `#a0a0c0` |
| normal | `rgba(168,168,120,0.18)` | `#b0b080` |
| dark | `rgba(112,88,72,0.18)` | `#907060` |
| fairy | `rgba(232,158,200,0.18)` | `#e890b8` |
| grass | `rgba(120,200,80,0.18)` | `#80c860` |
| _(fallback)_ | `rgba(255,255,255,0.1)` | `#fff` |

Each type also carries a display `label` in the design source (`Fire`, `Flying`, etc. — Title
Case, redundant with the CSS `uppercase` transform but kept as the underlying text content for
accessibility/copy-paste). For an unrecognized type, the design source falls back to the raw type
string itself as the label (not a fixed placeholder word) alongside the fallback colors above —
worth preserving since `pokemon.types` are lowercase slugs from PokeAPI and this keeps the
fallback path lossless rather than showing a generic "Unknown" badge.

Introduce this as a new lib file, `src/lib/type-badge-colors.ts`, following the existing
`TYPE_GRADIENTS` / `FALLBACK_GRADIENT` pattern in `src/lib/type-gradients.ts` (`Record<string, T>`
map + named fallback), rather than extending that file — the two maps serve visually unrelated
purposes (radial gradient stops vs. flat badge fill/text) and are consumed by different
components.

---

## 4. Props

The component receives the fields it needs from the `Pokemon` record the page already holds —
the same subset `PokemonArtwork` already takes:

- `id` — Pokédex number, used for the `#006`-style label
- `name` — used as the `<h1>` content
- `types` — string array; renders one badge per entry, in array order

No user-state props in this iteration.

---

## 5. File location

- `src/components/pokemon/PokemonHeader.tsx`
- `src/lib/type-badge-colors.ts` — new `TYPE_BADGE_COLORS` map + fallback (§3)

---

## 6. Deliberate non-goals (this iteration)

- **Height/weight/base-XP bar, community rating, rate-it row, base stats, top reviews, lists
  featuring this Pokémon** — all separate sections of the same Info column, separate iterations.
- **Interactivity** — no rating input, no clickable type badges (e.g. linking to a type-filtered
  browse page) this iteration.
- **Mobile layout** — the two-column grid's responsive collapse is a separate concern, already
  deferred by the `PokemonArtwork` spec.

---

## 7. Testing

- `/p/charizard` → `#006` label, "Charizard" at 52px, two badges ("Fire" orange-tinted, "Flying"
  blue-tinted) in that order.
- `/p/gengar` → `#094` label, two badges ("Ghost", "Poison") both using the ghost/poison purple
  tint (same bg/color pair, matches design — not a bug).
- `/p/magikarp` → `#129` label, single "Water" badge (only one type — row still renders correctly
  with one child).
- Any Pokémon with an unrecognized type string → fallback white-on-translucent badge, no crash.
