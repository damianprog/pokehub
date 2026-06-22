# Landing Page — Phase 1 Overview

## Status

Planning — not started

## Goal

Ship the logged-out marketing/landing page (`/` route — see `project-overview_8.md` §6) as a static, visually complete page matching the Claude Design prototype. No real backend wiring in this phase: content is static/mock, and the auth modal is UI-only (non-functional).

This phase is broken into one spec file per page section. Implement and verify each section independently; this file tracks shared scope/decisions only.

## Source design

- Claude Design project "PokeHub UI Prototype" (`project_id: 0c1d47b5-6b08-4235-a5b5-cb2849651a1d`), file `PokeHub-Landing.dc.html`.
- Visual language per `project-overview_8.md` §15.2 (dark theme `#0c0e12`, orange→magenta gradient `#ff7a45→#c44fe0`, Space Grotesk + Hanken Grotesk).

## Prerequisite

[styling-foundation-spec.md](../styling-foundation-spec.md) — global color tokens, fonts, shadcn/ui init. Implement before nav-spec.md (or any section spec).

## Section specs

1. [Nav](./nav-spec.md)
2. [Hero](./hero-spec.md)
3. [Marquee](./marquee-spec.md)
4. [Features grid](./features-grid-spec.md)
5. [Trending this week](./trending-spec.md)
6. [Testimonials](./testimonials-spec.md)
7. [Pack tease](./pack-tease-spec.md)
8. [Final CTA](./final-cta-spec.md)
9. [Footer](./footer-spec.md)
10. [Auth modal](./auth-modal-spec.md)

## Shared scope decisions (apply to all sections)

- Use Tailwind v4 theme tokens (`@theme` in `globals.css`, per `coding-standards.md`) for palette/typography instead of copying the prototype's inline styles.
- Recreate animations as CSS/Tailwind — no animation library.
- Responsive down to ~375px width. The prototype is desktop-only with no mobile reference, so mobile layout is a pragmatic Tailwind responsive pass, not a pixel match.
- Marketing stats/testimonials/trending data stay exactly as shown in the design (placeholder content) — swap for real data once backend/seeding exists.
- No real authentication wiring in this phase — see [auth-modal-spec.md](./auth-modal-spec.md).
- Pokémon browse/detail, feed, profile, packs screens are separate features, not part of this phase.

## Build order (suggested)

Nav → Hero → Marquee → Features → Trending → Testimonials → Pack tease → Final CTA → Footer → Auth modal. Roughly top-to-bottom page order; auth modal last since it's the most complex interactive piece and is referenced by several earlier sections.

## History
