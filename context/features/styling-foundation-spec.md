# Styling Foundation Spec

## Status

Planning — not started

## Goal

Set up the global visual foundation (color tokens, typography, shadcn/ui) that every later UI section — starting with [nav-spec.md](./landing-page/nav-spec.md) — will build on. This is a one-time, project-wide setup task, not tied to a single page/section.

## Design reference

- `project-overview_8.md` §15.2 (visual language) and §15 generally.
- Claude Design "PokeHub UI Prototype" (see `reference_pokehub_design.md`-style memory / earlier review) — dark theme, orange→magenta brand gradient, large border radii.

## Current state (as found)

- `src/app/globals.css` is the unmodified create-next-app default: just `@import "tailwindcss";`, no custom tokens.
- `src/app/layout.tsx` uses the default Geist / Geist Mono fonts via `next/font/google`.
- shadcn/ui is not yet initialized — no `components.json`, no `src/components/ui/`.
- `package.json` has no shadcn/Radix dependencies yet.

## Scope (this spec)

### 1. Color tokens

Add Tailwind v4 `@theme` tokens in `globals.css` (per `coding-standards.md` — CSS-based config only, no `tailwind.config.ts`) for the core palette used across the whole app:

- Background: `#0c0e12`
- Card/surface: `#15181e` (secondary surface `#13161b` if needed)
- Text: primary `#e8eaed`, muted `#9aa0ab` / `#8b919e`, dim `#7b818c` / `#5c636e`
- Brand gradient stops: `#ff7a45` → `#c44fe0` (orange → magenta)
- Gold (ratings/stars): `#e6b450`
- Border radius scale matching the design's soft-card look (~11–22px)
- Subtle border color: `rgba(255,255,255,0.06–0.1)`

**Deferred, not in this spec:** the full per-Pokémon-type color map (17 types) and shiny-specific gradients (`#ffd86b → #ff9ed8 → #7fb6ff`) — those are only needed once a section actually renders Pokémon type badges or shiny effects (e.g. trending grid, marquee, packs). Add them when that section's spec needs them, not speculatively now.

### 2. Typography

- Replace Geist / Geist Mono in `src/app/layout.tsx` with **Space Grotesk** (headings/numerics/stats) and **Hanken Grotesk** (body), both via `next/font/google`, matching `project-overview_8.md` §15.2.
- Expose both as CSS variables (`--font-space-grotesk`, `--font-hanken-grotesk`) and wire them into the `@theme` font tokens so Tailwind utility classes (`font-sans`, or a custom `font-heading`/`font-body` pair) resolve correctly.

### 3. Dark mode

- Dark-only for now — no light theme, no theme toggle/switcher. The color tokens above are the only palette; no `prefers-color-scheme` branching or `next-themes` setup in this phase.
- `coding-standards.md`'s "dark mode first, light mode as option" is satisfied by literally shipping dark first; light mode (if ever) is a separate future feature.

### 4. shadcn/ui initialization

- Run `npx shadcn@latest init`, configured for Tailwind v4 / CSS-variable-based theming, App Router.
- Base color mapped to the dark palette above (not shadcn's default neutral/slate).
- Do **not** bulk-install the component library. Add individual components (`npx shadcn add button`, etc.) only when a section spec actually needs one — e.g. nav-spec.md's buttons.

## Out of scope

- Per-type Pokémon color map and shiny gradients (deferred to whichever section first needs them)
- Light mode / theme switching
- Installing shadcn components beyond what's needed to verify the init worked (e.g. one throwaway `Button` import to confirm wiring, removed after verification — or skip verification component entirely and just confirm `components.json` + CSS variables are correct)
- Any actual page/section markup (that's nav-spec.md and onward)

## Acceptance criteria

- `globals.css` defines the `@theme` tokens listed above (background, surface, text scale, brand gradient stops, gold, radius scale, border color)
- `layout.tsx` uses Space Grotesk + Hanken Grotesk instead of Geist; both fonts visibly apply (verify in browser)
- `components.json` exists and `npx shadcn add <component>` succeeds without error
- `npm run build` passes
- No visual regressions — at this stage the only visible page is the default Next.js starter page, just confirm background/text colors and fonts changed correctly

## History
