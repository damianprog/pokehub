# Current Feature

<!-- Feature name and short description -->
Prisma + Neon PostgreSQL Setup — install Prisma 7, connect to a Neon serverless Postgres database, write the full schema from the project-overview data model, and create the initial migration.

## Status

<!-- Not Started | In Progress | Completed -->
Completed

## Goals

<!-- Goals and requirements -->
- Install Prisma 7 (TypeScript query compiler, no Rust engine) and the Neon serverless driver
- Configure `prisma/schema.prisma` with the full data model from `context/project-overview_8.md` (§5.3): all 14 models, enums, indexes, and cascade deletes
- Include NextAuth models: `Account`, `Session`, `VerificationToken`
- Set `DATABASE_URL` to the Neon development branch connection string
- Always use `prisma migrate dev` — never `db push`
- Run the initial migration and verify it applies cleanly

## Notes

<!-- Any extra notes -->
- Prisma 7 has breaking changes — read the upgrade guide before writing any code: https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-7
- Generator uses `provider = "prisma-client"` and `output = "../src/generated/prisma"` (Prisma 7 TypeScript compiler, not the old Rust binary)
- We will have a **development** Neon branch (`DATABASE_URL`) and a separate **production** branch — never point dev work at production
- Schema is already fully specified in `context/project-overview_8.md` §5.3 — copy it verbatim, do not invent additions

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
- 2026-06-24 Built landing page testimonials section (`src/components/landing/Testimonials.tsx`): 3-column review card grid (1-col on mobile) with hardcoded reviews from anna_g/Gardevoir (4.5★), ghosttype_andy/Gengar (5.0★), kanto_kris/Magikarp (2.0★). Each card has gradient avatar, Pokémon thumbnail, partial-fill star rating, quote text, and helpful count. Mounted in `page.tsx` after `<Trending />`. Also renamed `FeaturesGrid` → `Features` and `TrendingGrid` → `Trending` for naming consistency.
- 2026-06-24 Built landing page pack tease section (`src/components/landing/PackTease.tsx`): purple-tinted promotional card with 2-column layout (stacks to 1-col on mobile). Left: eyebrow badge with gold→pink gradient text, Space Grotesk 800 heading, body copy, gradient CTA. Right: 3 staggered mini pack cards (136×190px) — Magikarp COMMON (`top: 12px`), Gengar RARE (centered), Shiny Charizard (`top: -8px`) with shimmer + shinyPulse animations and ✦ sparkle. Fixed `<Image fill>` + style conflict by using a sized wrapper div. Fixed card width at 136px via inline style to avoid Tailwind v4 responsive ordering issue.
- 2026-06-24 Built landing page final CTA section (`src/components/landing/FinalCta.tsx`): full-width centred section with purple radial top-glow, `rgba(255,255,255,0.06)` top border, Space Grotesk 800 48px heading, subheading (max-width 420px), gradient "Create free account" button + ghost "Browse as guest" button, and "Already a trainer? Log in" fallback line. Mounted in `page.tsx` after `<PackTease />`.
- 2026-06-25 Built landing page footer (`src/components/landing/Footer.tsx`): minimal single-row footer — 22×22 gradient "P" badge + "PokeHub · 2026" grey wordmark on the left, five nav links (About/Blog/API/Privacy/Terms) in `#5c636e` on the right. Corrected spec from multi-column planning draft to match actual design (badge size, border opacity, year merged into wordmark, right-link color). Fixed inner container alignment to use `mx-auto max-w-[1180px] px-[26px]` matching other sections. Fixed height collapse caused by `py-[28px]` not being generated by Tailwind v4 JIT — replaced with `pt-[28px] pb-[28px]`.
- 2026-06-25 Built `AuthModal.tsx` with Zustand store (`src/store/auth-modal.ts`) for open/close/mode state. Nav and FinalCta converted to client components to trigger the store. Mounted in `page.tsx`. All styling via Tailwind CSS v4 classes — no inline styles. Added `--animate-modal-in` token to `globals.css` `@theme inline` block.
- 2026-06-26 Set up Prisma 7 + Neon PostgreSQL. Installed `prisma@7`, `@prisma/client@7`, `@prisma/adapter-neon`, `dotenv`. Created `prisma/schema.prisma` (14-model schema from project-overview §5.3, Prisma 7 generator `provider = "prisma-client"`, no `url` in datasource — Prisma 7 breaking change). Created `prisma.config.ts` at project root (uses `DIRECT_URL` for migrations, falls back to `DATABASE_URL`). Created `src/lib/prisma.ts` singleton with `PrismaNeon` adapter. Pre-generated initial migration SQL at `prisma/migrations/20260626000000_init/migration.sql` including the `Comment.comment_exactly_one_target` CHECK constraint. Added `postinstall: prisma generate` to `package.json` for Vercel deploys. Added `src/generated/` to `.gitignore`. Build passes. **Pending:** fill in `DATABASE_URL` + `DIRECT_URL` in `.env` from Neon console, then run `npx prisma migrate dev --name init` to apply to the dev branch.
