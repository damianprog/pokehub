# Auth UI - Sign In & Register Pages

## Overview

Two full custom pages, `/sign-in` and `/register`, replacing NextAuth's default auth page, matching the Claude Design source `PokeHub-SignIn.dc.html` and `PokeHub-Register.dc.html`. These sit alongside the existing `AuthModal` (landing-page quick access stays as-is); the full pages are the canonical destination for direct navigation and for `proxy.ts` redirects, which currently point unauthenticated users at NextAuth's default `/api/auth/signin`.

## Sign In page (`/sign-in`)

Centered single-column form over the app's dark gradient background, under a minimal header (just the gradient "P" badge + "PokeHub" wordmark, linking to `/` — not the full site Nav, since arriving here already implies a mid-auth-flow context).

- Heading "Welcome back" with subheading "Log in to keep rating & collecting."
- Card contains: an optional form-level error banner shown above the fields on a failed submit, an Email field, a Password field with an inline "Forgot?" link on its label row, and a "Log in" submit button.
- Below the submit button: an "OR" divider, then a "Sign in with GitHub" button with the GitHub mark, reusing the already-configured GitHub provider from auth-01.
- Each field shows its own inline error below it on failed validation (email required + format check, password required); the invalid field's border switches to the design's error color, and the card does a brief shake.
- Below the card: "No account? Sign up free" linking to `/register`.
- Submit calls `signIn("credentials", …)`; the GitHub button calls `signIn("github")`.

## Register page (`/register`)

Same minimal header and background treatment as sign-in; the card is slightly wider to fit four fields.

- Heading "Join PokeHub" with subheading "Free forever. Rate, collect, obsess."
- Form state fields, in order: Name, Email, Password, Confirm password — matching what `/api/auth/register` (auth-02) already expects.
- Same inline-error + form-level-banner pattern as sign-in. Validation rules should reuse the Zod shape already enforced server-side in `/api/auth/register` rather than being re-derived from the design's demo logic (name required; email required + format; password required + minimum length; confirm password required + must match).
- On a successful POST, immediately sign the new user in with the same credentials (no separate login step) and swap the card to a success state: checkmark icon, "Account created", "Signing you in…", and a "Continue →" button linking to `/`. This also happens automatically after a short delay, in addition to the manual link. This is a deliberate deviation from the design's static demo copy ("Redirecting you to log in…" / "Go to sign in →"), which predates real auth wiring — the design never accounted for an actual authenticated session existing at this point.
- If the auto sign-in call fails for any reason (should be rare right after a successful registration), fall back to the original design behaviour: show the success state pointing at `/sign-in` instead ("Redirecting you to log in…" / "Go to sign in →"), so the user isn't stranded.
- Below the card (form state only): "Already a trainer? Log in" linking to `/sign-in`. The success state doesn't repeat this, since it already has its own CTA.
- A small Terms/Privacy footnote sits under the submit button in the form state. No Terms/Privacy pages exist yet, so it renders as static text for now.

## Notes

- Both pages should reuse the input and button styling already established for `AuthModal` (`src/components/auth/AuthModal.tsx`) rather than re-deriving it — the design values are identical across the modal and these full pages.
- Structure as Server Component page routes (`src/app/sign-in/page.tsx`, `src/app/register/page.tsx`) with a client component for the interactive form, consistent with `AuthModal` already being `'use client'`.
- Update `proxy.ts` to redirect unauthenticated users to `/sign-in` instead of `/api/auth/signin` once the page exists.
- The design's "Forgot?" link has no destination — out of scope here (see project-overview §12); render inert or pointing at `#` until a reset flow is built.
- Sign-out isn't covered by either design file provided, so it isn't part of this spec.

## Testing

1. Visit `/sign-in` directly, and via a redirect from a protected route (e.g. `/settings` while logged out) — verify the custom page renders instead of NextAuth's default.
2. Submit sign-in with empty/invalid fields — verify inline and form-level errors.
3. Sign in with valid credentials — verify redirect to an authenticated state.
4. Click "Sign in with GitHub" — verify OAuth flow still works.
5. Visit `/register`, submit invalid data — verify inline errors match `/api/auth/register`'s validation.
6. Register a new account — verify the success state renders, the user ends up in an authenticated session, and the link (and auto-redirect) to `/` works.
7. Simulate an auto sign-in failure after a successful registration (e.g. temporarily break the credentials call) — verify the fallback success state pointing at `/sign-in` renders instead of leaving the user stuck.
8. Register with an already-used email — verify the existing 409 from `/api/auth/register` surfaces as a form-level error.
