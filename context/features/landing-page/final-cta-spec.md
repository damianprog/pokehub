# Landing Page — Final CTA Spec

## Status

Planning — not started

## Goal

Full-width centred call-to-action section directly below the Pack Tease. Heading, subheading, primary + secondary buttons, and a "Log in" fallback line. Acts as the conversion close for logged-out visitors at the bottom of the page.

## Design reference

`PokeHub-Landing.dc.html` — `<!-- FINAL CTA -->` block immediately below the pack tease section. See also [overview.md](./overview.md).

## Layout & structure

- `<section>` — full width, no `max-width` wrapper
- `border-top: 1px solid rgba(255,255,255,0.06)`
- `padding: 90px 26px`
- `text-align: center`
- Background: `radial-gradient(1000px 400px at 50% 0%, rgba(196,79,224,0.07), transparent)` — subtle purple top-glow, no solid fill

## Heading

| Property | Value |
|---|---|
| Text | "Your Pokédex.\nYour opinions." (line break between the two sentences) |
| Element | `<h2>` |
| Font | Space Grotesk, 800, 48px, `letter-spacing: -0.03em` |
| Margin | `0 0 14px` |

## Subheading

| Property | Value |
|---|---|
| Text | "Free forever. Join 214,000 trainers already tracking their collection." |
| Element | `<p>` |
| Font | Hanken Grotesk, 18px, `color: #7b818c` |
| Max-width | `420px`, `margin: 0 auto 34px` (centred) |

## Button row

`display: flex`, `align-items: center`, `justify-content: center`, `gap: 12px`, `margin-bottom: 20px`

### Primary — "Create free account"

| Property | Value |
|---|---|
| Element | `<button>` |
| Height | `52px` |
| Padding | `0 34px` |
| Border-radius | `13px` |
| Border | none |
| Background | `linear-gradient(135deg, #ff7a45, #c44fe0)` |
| Font | Hanken Grotesk, 700, 17px, `color: #fff` |
| Box-shadow | `0 10px 30px rgba(196,79,224,0.38)` |
| Action | Opens signup modal (static `<button>` for now) |

### Secondary — "Browse as guest"

| Property | Value |
|---|---|
| Element | `<a>` (or `<button>`) |
| Height | `52px` |
| Padding | `0 28px` |
| Border-radius | `13px` |
| Border | `1px solid rgba(255,255,255,0.14)` |
| Background | `rgba(255,255,255,0.05)` |
| Font | Hanken Grotesk, 600, 16px, `color: #e8eaed` |
| Layout | `display: inline-flex`, `align-items: center` |
| Action | Static link for now (no target — wired in later) |

## Login fallback line

Below the button row, `font-size: 13px`, `color: #7b818c`:

> Already a trainer? **Log in**

"Log in" text: `color: #c44fe0`, `font-weight: 600`, `cursor: pointer`. Opens login modal (static for now).

## Implementation

- Component: `src/components/landing/FinalCta.tsx` — Server Component, no `'use client'`
- Mount in `src/app/page.tsx` immediately after `<PackTease />`
- All buttons/links are static for now; modal wiring is deferred to the auth-modal spec

## Responsive

- All content is already centred and max-width on the text is 420px — works at any width with no extra changes
- No layout changes needed for mobile; padding shrinks naturally

## Out of scope

- Functional auth modal wiring (separate spec)
- Hover states (not present in the design)

## Acceptance criteria

- Section renders with a subtle purple radial glow at the top and a `rgba(255,255,255,0.06)` top border
- Space Grotesk 800 48px heading with line break between "Your Pokédex." and "Your opinions."
- Subheading centred below, max 420px wide
- Primary gradient button and secondary ghost button side-by-side, centred
- "Already a trainer? Log in" line below the buttons with "Log in" in brand purple
- Section appears correctly above the footer at all viewport widths

## History
