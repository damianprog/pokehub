# Pokédex — Feature Overview

> **Status:** planning
> **Route:** `/pokedex` (decided 2026-09-25 — `/discover` keeps its `project-overview_8.md` §6 meaning: trending lists, top reviewers, popular Pokémon)
> **Design source:** `PokeHub-Pokedex.dc.html` in the Claude Design project (desktop 1440 signed in / logged out / no results / loading, mobile 375 page + filters sheet)

---

## 1. What it is

A browsable catalogue of every seeded Pokémon (1,025 today). The page is a card grid with search, filters and sort, and it's the target of every "Pokedex" link in the app (logged-out nav, landing hero, signed-in nav, detail-page breadcrumbs). It's meant as the Letterboxd "films" browse page for Pokémon: fast to scan, with the community rating on every card.

---

## 2. Slice plan

Built one slice at a time, with one spec per slice. Each spec gets written only after the previous slice has shipped. The order below is the current plan and can change as slices land.

| # | Slice | Summary |
|---|---|---|
| 01 | Page shell + grid | `/pokedex` route, title + total count, "Surprise me", card grid (dex order) with community rating, "Load more", loading skeleton, all "Pokedex" links pointed at the new route |
| 02 | Search | Name / dex-number search input, driven by a URL param |
| 03 | Type & generation filters | Type chip panel, Generation menu, active-filter chips + "Clear all", "Showing N of 1,025", no-results empty state; breadcrumb type crumb links to a type-filtered Pokédex |
| 04 | Rarity filter | Rarity menu (tier mapping per §3 below) |
| 05 | Sort | Dex number / Name A–Z / Highest rated / Most rated |
| 06 | Personal layer (signed in) | "You rated" line, favorite/wishlist indicators, desktop hover quick-toggle buttons, "My status" filter |
| 07 | Mobile filters sheet | "Filters" button with count badge, bottom sheet, Reset / Show N |

---

## 3. Design review

**Fixed in the design (revision of 2026-09-25).** After the first review pass, the design was updated to:

- label the nav item "Pokedex" in both navs, with an active state. The signed-in nav uses a pill and the logged-out nav a gradient underline.
- correct the Rarity menu: Uncommon covers starters, pseudo-legendaries and fan favorites, Rare means Legendary, and Ultra rare means Mythical.
- drop the hand-picked per-Pokémon art gradients. Every card now uses its primary type's gradient.
- match the favorite/wishlist colors on cards to the detail page's buttons.
- change the nav search placeholder to 1,025.
- add a logged-out mobile filters sheet with no "My status" section.
- add mobile no-results and loading artboards.
- note that mobile cards are tap-to-open, with heart/bookmark shown only as indicators.

**Still handled in code, not in the design:**

- **Colors come from the existing maps.** The design keeps its own copy of the per-type colors. Implementation uses the real `TYPE_GRADIENTS` and `TYPE_BADGE_COLORS` maps, and small differences from the artboard's hex values are expected.
- **The design's sample numbers are placeholders.** Ratings like "4.8 · 11,240" are mock data. Real counts are tiny today, and most Pokémon will show "No ratings yet".
- **`SignedInNav`'s own search placeholder still says 1,302.** That's the nav search box, not part of this feature. Fix it whenever the nav is next touched.
