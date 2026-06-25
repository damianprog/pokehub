# Auth Modal Spec

## Status

<!-- Planning — not started -->
Completed

## Goal

A single modal component with two views — **Login** and **Signup** — that renders as a centred overlay. Triggered from the Nav ("Log in" → login view, "Sign up free" → signup view) and from the Final CTA ("Create free account" → signup view). Views switch via in-modal footer links.

This spec covers **design / visual only**. Auth logic (NextAuth calls, form validation, error states, session handling) is out of scope.

## Design reference

`PokeHub-Landing.dc.html` — `<!-- MODAL -->` block. State machine at the bottom of the file:
- `modal: null` → closed
- `modal: 'login'` → login view
- `modal: 'signup'` → signup view

---

## Overlay

| Property | Value |
|---|---|
| Position | `fixed; inset: 0` |
| Background | `rgba(0,0,0,0.72)` |
| z-index | `200` |
| Layout | `flex; align-items: center; justify-content: center` |
| Click behaviour | clicking the overlay closes the modal |

---

## Dialog card

| Property | Value |
|---|---|
| Background | `#15181e` |
| Border | `1px solid rgba(255,255,255,0.1)` |
| Border-radius | `20px` |
| Padding | `36px` |
| Width | `420px`, `max-width: 92vw` |
| Position | `relative` (anchor for close button) |
| Entry animation | `modalIn 0.2s ease both` |
| Click behaviour | `stopPropagation` — does **not** close |

**`modalIn` keyframes:**
```css
@keyframes modalIn {
  from { opacity: 0; transform: translateY(14px) scale(0.97); }
  to   { opacity: 1; transform: none; }
}
```

---

## Close button

Absolutely positioned inside the card:

| Property | Value |
|---|---|
| Position | `absolute; top: 16px; right: 16px` |
| Size | `32×32px` |
| Border-radius | `8px` |
| Background | `rgba(255,255,255,0.06)` |
| Icon | `×`, `font-size: 18px`, `color: #8b919e` |
| Border | none |

---

## Logo mark (shared — both views)

Sits at the top of the card, `margin-bottom: 24px`:

| Property | Value |
|---|---|
| Layout | `flex; align-items: center; gap: 9px` |
| Badge | `26×26px`, `border-radius: 8px`, `linear-gradient(135deg,#ff7a45,#c44fe0)` |
| Badge letter | "P", Space Grotesk, `font-size: 13px`, `font-weight: 800`, `color: #fff` |
| Wordmark | "PokeHub", Space Grotesk, `font-weight: 700`, `font-size: 16px`, `letter-spacing: -0.015em` |

---

## Input field (shared style)

Used for all form fields in both views:

| Property | Value |
|---|---|
| Height | `46px` |
| Background | `rgba(255,255,255,0.05)` |
| Border | `1px solid rgba(255,255,255,0.1)` |
| Border-radius | `11px` |
| Padding | `0 14px` |
| Font size | `14.5px` |
| Color | `#e8eaed` |
| Width | `100%` |

Field labels: `font-size: 12.5px`, `font-weight: 600`, `color: #9aa0ab`, `margin-bottom: 7px`.

---

## Submit button (shared style)

| Property | Value |
|---|---|
| Width | `100%` |
| Height | `48px` |
| Border-radius | `12px` |
| Background | `linear-gradient(135deg,#ff7a45,#c44fe0)` |
| Font | `700`, `16px`, `color: #fff` |
| Shadow | `0 6px 20px rgba(196,79,224,0.32)` |
| Margin-bottom | `18px` |

---

## Login view

**Heading:** "Welcome back" — Space Grotesk, `700`, `24px`, `letter-spacing: -0.02em`, `margin: 0 0 6px`

**Subheading:** "Log in to your PokeHub account." — `color: #7b818c`, `font-size: 14.5px`, `margin: 0 0 26px`

**Fields:**

| Field | Placeholder | Notes |
|---|---|---|
| Username or email | `trainer@pokehub.gg` | `margin-bottom: 14px` |
| Password | `••••••••` | `margin-bottom: 22px`; label row has "Forgot?" link (`12px`, `#c44fe0`) right-aligned |

**Submit:** "Log in"

**Footer:** `"No account?"` + `"Sign up free"` link → switches to signup view
- Container: `text-align: center`, `font-size: 13.5px`, `color: #7b818c`
- Link: `color: #c44fe0`, `font-weight: 600`

---

## Signup view

**Heading:** "Join PokeHub" — same style as login heading

**Subheading:** "Free forever. No Pokémon expertise required." — same style

**Fields:**

| Field | Placeholder | Notes |
|---|---|---|
| Username | `ash_ketchum` | `margin-bottom: 14px` |
| Email | `you@example.com` | `margin-bottom: 14px` |
| Password | `••••••••` | `margin-bottom: 22px` |

**Submit:** "Create account"

**Footer:** `"Already a trainer?"` + `"Log in"` link → switches to login view
- Same style as login footer

---

## Triggers

| Location | Element | Opens |
|---|---|---|
| `Nav.tsx` | "Log in" button | Login view |
| `Nav.tsx` | "Sign up free" button | Signup view |
| `FinalCta.tsx` | "Create free account" button | Signup view |

The Nav is currently a Server Component. Making it trigger the modal requires either:
- Converting Nav to `'use client'` and lifting modal state up, or
- A thin client wrapper around the Nav buttons, or
- A global Zustand store (already in the stack) with a `useAuthModal` slice

Decision deferred to implementation.

---

## Implementation

- Component: `src/components/auth/AuthModal.tsx` — `'use client'` (overlay, animation, view switching)
- Mount once in `src/app/page.tsx` so it's available on the landing page
- State: Zustand store at `src/store/auth-modal.ts` — `mode: 'login' | 'signup' | null`, `open(mode)`, `close()`
- Triggers: Nav and FinalCta converted to `'use client'` to call `useAuthModal`
- Styling: **Tailwind CSS v4 classes only — no inline styles**. Design values from the tables below map to Tailwind arbitrary values (e.g. `rounded-[20px]`, `bg-[rgba(0,0,0,0.72)]`) and theme tokens (`bg-card`, `from-brand-from to-brand-to`, `text-muted-foreground`, `text-dim-foreground`)
- Animation: `modalIn` keyframe already in `globals.css`; exposed as `--animate-modal-in: modalIn 0.2s ease both` in `@theme inline` → used as `animate-modal-in` class

## Out of scope (this spec)

- Form submission / NextAuth calls
- Input validation and error states
- "Forgot password" flow
- OAuth provider buttons (not in design)
- Loading / pending states

## Acceptance criteria

- Overlay renders at `z-index: 200` over the full page with `rgba(0,0,0,0.72)` backdrop
- Card: `420px` wide, `20px` radius, `#15181e` bg, `modalIn` entry animation
- Close button: top-right, `32×32px`, `rgba(255,255,255,0.06)` bg, `×` icon
- Logo mark at top of card (both views)
- Login view: 2 fields + "Log in" button + footer link to signup
- Signup view: 3 fields + "Create account" button + footer link to login
- Clicking overlay closes; clicking card does not
- "Log in" in Nav → opens login view; "Sign up free" in Nav + "Create free account" in FinalCta → opens signup view
- View switches via in-modal footer links without closing the modal

## History
