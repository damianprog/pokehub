# Current Feature

<!-- Feature name and short description -->

Styling Foundation — global color tokens, typography, and shadcn/ui setup that all later UI sections build on. Full spec: @context/features/styling-foundation-spec.md

## Status

<!-- Not Started | In Progress | Completed -->

In Progress

## Goals

<!-- Goals and requirements -->

- Add Tailwind v4 `@theme` color tokens in `globals.css` (background, surface, text scale, brand gradient, gold, radius scale, border color) matching the design palette
- Replace Geist / Geist Mono fonts in `layout.tsx` with Space Grotesk (headings) + Hanken Grotesk (body)
- Dark-only for now — no light theme/toggle
- Initialize shadcn/ui (Tailwind v4, CSS-variable theming, App Router), base color mapped to the dark palette; install components on demand only, not in bulk

## Notes

<!-- Any extra notes -->

- Per-type Pokémon color map and shiny gradients are deferred to whichever section first needs them (not part of this feature)
- Prerequisite for `landing-page/nav-spec.md` and all subsequent landing page section specs

## History

<!-- Keep this updated. Earliest to latest -->

- Initial Next.js project setup (Create Next App) with Tailwind CSS configured.
