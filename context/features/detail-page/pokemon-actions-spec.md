# Spec — `PokemonActions` component

> **Status:** spec / pre-implementation
> **Scope:** the three-button action row directly beneath the `PokemonArtwork` card on `/p/[slug]` — "Write review" primary CTA, favorite (♥) toggle, add-to-list (+) button.
> **Out of scope:** click handlers and state (no auth, no favorite/wishlist mutations yet — buttons are static); the review form/modal; the add-to-list picker; toggled/active visual states; mobile layout.

---

## 1. Goal & scope

A single `PokemonActions` RSC that renders the row of three action buttons sitting directly
below the `PokemonArtwork` card, inside the same sticky left column (`392px` wide). Purely
presentational in this iteration — same "ship the visual layer first" pattern already used for
`PokemonArtwork` (see `pokemon-artwork-spec.md` §6).

---

## 2. Visual spec (from Claude Design)

Source: `PokeHub.dc.html`, Pokémon Detail screen, immediately after the artwork card — a flex
row of three elements (a "Write review" CTA, then a ♥ favorite button, then a `+` add-to-list
button). Exact values below.

### 2.1 Row container

| Property | Value |
|---|---|
| Display | `flex` |
| Gap | `10px` |
| Margin top | `14px` (gap between the artwork card and this row) |

### 2.2 Buttons

| Button | Width | Height | Background | Foreground | Border | Radius | Font |
|---|---|---|---|---|---|---|---|
| **Write review** | `flex:1` (fills remaining row width) | `42px` | `linear-gradient(135deg,#ff7a45,#c44fe0)` (brand gradient) | `#fff` | none | `11px` | `14px` / `700` weight, inherits body font (Hanken Grotesk) |
| **♥ favorite** | `46px` | `42px` | `rgba(255,255,255,0.06)` | `#e8a0c0` | `1px solid rgba(255,255,255,0.1)` | `11px` | glyph, no explicit size in source (inherits) |
| **+ add to list** | `46px` | `42px` | `rgba(255,255,255,0.06)` | `#9aa0ab` | `1px solid rgba(255,255,255,0.1)` | `11px` | glyph, no explicit size in source (inherits) |

All three: content centred (`align-items:center; justify-content:center`), `cursor:pointer`.

Icons are the literal glyphs `♥` and `+` (no icon library) — matches the source markup exactly.
`lucide-react` is in `package.json` but unused anywhere in the codebase so far; introducing it
here would be a new pattern this spec doesn't need to make.

Static across every Pokémon type — unlike the artwork card, this row has no per-type variation.

---

## 3. Props

None. The row is static markup in this iteration — no favorite/wishlist state, no rating, no
Pokémon data is needed to render it as designed.

---

## 4. Rendering rules

- Render the three actions as native `<button type="button">` elements, not `<span>` (the design
  file uses `<span>` because it's a non-interactive prototype). The global `button { cursor:
  pointer }` rule in `globals.css` already covers the hover affordance, and using real buttons
  avoids a span→button refactor the moment click handlers land in a later iteration.
- "Write review" is `flex:1`; the ♥ and `+` buttons are fixed `46px` wide — this is what makes
  the primary action visually dominant while the two icon buttons stay compact.
- The ♥ and `+` buttons are icon-only — give each an `aria-label` (`"Favorite"`, `"Add to list"`)
  since they carry no visible text. No such requirement exists for "Write review" since its own
  label is the accessible name.
- No hover/active/disabled states beyond the browser/Tailwind default — the design doesn't show
  any, and there's no state to reflect yet (see §6).

---

## 5. File location

`src/components/pokemon/PokemonActions.tsx`

---

## 6. Deliberate non-goals (this iteration)

- **Click handlers / mutations** — "Write review" opening a form, ♥ toggling a favorite,
  `+` opening a list picker are all separate, auth-gated iterations.
- **Active/toggled visual state** — e.g. a filled heart when already favorited. No favorite state
  is wired up yet, so there's nothing to reflect.
- **Auth gating** — whether these are visible/disabled for logged-out users is a later concern.
- **Mobile layout** — this row lives in the same sticky column as `PokemonArtwork`; the artwork
  spec already defers the responsive collapse of that column to a separate pass.

---

## 7. Testing

- `/p/charizard` → row renders directly under the artwork card with `10px` gap between buttons,
  `14px` margin above the row.
- "Write review" fills the remaining row width; ♥ and `+` are fixed-width squares beside it.
- Row renders identically regardless of Pokémon type (no per-type styling to verify per-species).
- All three are focusable via keyboard (native `<button>`) and show the pointer cursor on hover.
