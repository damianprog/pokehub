# Current Feature

<!-- Feature name and short description -->


## Status

<!-- Not Started | In Progress | Completed -->
Not Started

## Goals

<!-- Goals and requirements -->

## Notes

<!-- Any extra notes -->

## History

<!-- Keep this updated. Earliest to latest -->

- 2026-06-22 Initial Next.js project setup (Create Next App) with Tailwind CSS configured.
- 2026-06-23 Added dark-theme `@theme` color tokens, brand fonts (Space Grotesk + Hanken Grotesk), and shadcn/ui setup.
- 2026-06-23 Built the landing page nav section (`src/components/landing/Nav.tsx`): sticky header, gradient logo badge, "Pokedex" link, "Log in" / "Sign up free" buttons, pixel-matched to the Claude Design prototype. Verified at desktop and 375px widths.
- 2026-06-23 Built the landing page hero section (`src/components/landing/Hero.tsx`): two-column layout with eyebrow badge, gradient headline, subheading, CTA row, stat row, and a three-card Pokémon stack (Gengar, Gardevoir, shiny Charizard) with shimmer/pulse/float animations and a floating "Shiny pull!" notification pill. Added `raw.githubusercontent.com` to `next.config.ts` image remote patterns. Page-wide radial-gradient glow applied via a `.landing-glow` wrapper in `page.tsx` — not `body`, because a body background propagates to the canvas and shifts the gradient's positioning area, producing a hard visible edge below the hero; values taken verbatim from the Claude Design source. Verified at 1366x768, 1920x1080, and 375px widths.
- 2026-06-24 Polish pass on hero card stack: reduced card border-radius to match design (16px back cards, 18px front), fixed Charizard float animation by separating centering wrapper from animation, fixed shimmer clipping with `relative` on PokemonCard, added `cursor-pointer` globally to buttons.
- 2026-06-24 Built landing page marquee bar (`src/components/landing/Marquee.tsx`): full-width auto-scrolling strip of 12 Pokémon with avatars and star ratings, seamless loop via duplicated sets, `scrollLeft 42s linear infinite` animation.
- 2026-06-24 Built landing page features grid (`src/components/landing/FeaturesGrid.tsx`): 3-column card grid with centred heading block and per-card icon chips (Rate & Review ★, Daily Packs ◆, Lists & Discovery ≡), each with unique gradient background and border. Collapses to single column below 768px. Verified at 1366px and 375px widths.
- 2026-06-24 Built landing page trending grid (`src/components/landing/TrendingGrid.tsx`): 6-column ranked grid (3-col on mobile) with hardcoded top-6 Pokémon (Rayquaza–Gyarados), per-Pokémon gradient backgrounds, rank badges, star ratings, and a static "Rate all 1,302 Pokémon →" CTA. Mounted in `page.tsx` after `<FeaturesGrid />`.
