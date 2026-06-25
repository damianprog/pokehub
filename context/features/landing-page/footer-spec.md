# Landing Page — Footer Spec

## Status

<!-- Completed -->
Completed

## Goal

Minimal single-row site footer appearing directly below the Final CTA. Logo mark + wordmark/year on the left, nav links on the right.

## Design reference

`PokeHub-Landing.dc.html` — `<!-- FOOTER -->` block at the very bottom of the page.

Note: §15.4 of `project-overview_8.md` documents that Blog and API links are out of scope for v1 — included for design fidelity only.

## Layout & structure

- `<footer>` — full width, no explicit background (inherits `#0c0e12` from page)
- `border-top: 1px solid rgba(255,255,255,0.05)`
- `padding: 28px 26px`
- Inner row: `max-width: 1180px`, `margin: 0 auto`, `display: flex`, `align-items: center`, `justify-content: space-between`

---

## Left side — Logo + year

Single flex row with badge + combined wordmark/year span:

| Property | Value |
|---|---|
| Badge size | `22px × 22px`, `border-radius: 7px` |
| Badge bg | `linear-gradient(135deg, #ff7a45, #c44fe0)` |
| Badge letter | "P", Space Grotesk, `font-size: 12px`, `font-weight: 800`, `color: #fff` |
| Left gap | `gap: 10px` between badge and span |
| Wordmark span | `"PokeHub · 2026"`, Space Grotesk, `font-size: 14px`, `font-weight: 600`, `color: #7b818c` |

Year is **merged into the wordmark span** — not a separate element.

---

## Right side — Links

Content: **About · Blog · API · Privacy · Terms**

| Property | Value |
|---|---|
| Layout | `display: flex`, `gap: 22px` |
| Font size | `13px` |
| Color | `#5c636e` |
| `href` | `"#"` for all links |

---

## Implementation

- Component: `src/components/landing/Footer.tsx` — Server Component, no `'use client'`
- Mounted in `src/app/page.tsx` immediately after `<FinalCta />`
- All links are static `href="#"` for now

## Responsive

Not specified in the design. No responsive treatment applied.

## Out of scope

- Real link destinations
- Hover/focus states
- Social media icons
- Multi-column link layout

## Acceptance criteria

- Footer renders directly below Final CTA with `rgba(255,255,255,0.05)` top border
- Left: 22×22 gradient "P" badge + `"PokeHub · 2026"` in one grey span
- Right: About, Blog, API, Privacy, Terms at 13px `#5c636e`, gap 22px
- Single-row layout at all widths (no responsive treatment)

## History

- 2026-06-25 Built and verified against design. Spec corrected from planning values to match actual design (badge 22px not 28px, border opacity 0.05 not 0.08, year merged into wordmark, right-link color #5c636e not #7b818c, padding 28px not 20px).
