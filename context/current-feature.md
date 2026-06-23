# Current Feature

<!-- Feature name and short description -->

## Status

<!-- Not Started | In Progress | Completed -->

## Goals

<!-- Goals and requirements -->

## Notes

<!-- Any extra notes -->

## History

<!-- Keep this updated. Earliest to latest -->

- Initial Next.js project setup (Create Next App) with Tailwind CSS configured.
- Added dark-theme `@theme` color tokens, brand fonts (Space Grotesk + Hanken Grotesk), and shadcn/ui setup.
- Built the landing page nav section (`src/components/landing/Nav.tsx`): sticky header, gradient logo badge, "Pokedex" link, "Log in" / "Sign up free" buttons, pixel-matched to the Claude Design prototype. Verified at desktop and 375px widths.
- Built the landing page hero section (`src/components/landing/Hero.tsx`): two-column layout with eyebrow badge, gradient headline, subheading, CTA row, stat row, and a three-card Pokémon stack (Gengar, Gardevoir, shiny Charizard) with shimmer/pulse/float animations and a floating "Shiny pull!" notification pill. Added `raw.githubusercontent.com` to `next.config.ts` image remote patterns. Page-wide radial-gradient glow applied via a `.landing-glow` wrapper in `page.tsx` — not `body`, because a body background propagates to the canvas and shifts the gradient's positioning area, producing a hard visible edge below the hero; values taken verbatim from the Claude Design source. Verified at 1366x768, 1920x1080, and 375px widths.
