# Spec — Auth 04 · Username gate as a single source of truth

> **Status:** spec / pre-implementation
> **Scope:** make `proxy.ts` the one and only place that enforces "a signed-in user must have a
> username", for page navigations *and* server actions alike; remove the per-mutation guard that
> duplicates it; narrow the session type so app code stops defensively handling a `null` username
> that the gate already prevents from reaching it.
> **Out of scope:** changing how or when a username is stored (the column stays nullable, the
> onboarding page and its API route are untouched), and anything about *other* users' data read
> from Prisma — see §6.

---

## 1. Problem

Every user must pick a username before doing anything else on PokeHub — that is a settled decision
(`project-overview_8.md` §14, "Username required at signup"). The column is nullable only because
OAuth and magic-link sign-ins create the `User` row before the user has had a chance to pick one;
the onboarding gate in `proxy.ts` then redirects anyone with `username === null` to
`/signup/username` from everywhere else.

Despite the gate, the codebase keeps re-checking the same thing:

- `src/lib/require-username.ts` exists as a guard to be called inside every future mutation route,
  returning a 403 if the session has no username. Nothing imports it today, but its documented
  intent is "call this in every server action" — a rule that has to be remembered on each new
  action and is silently broken the first time someone forgets.
- `Session.user.username` is typed `string | null`, so every server component and client
  component that touches the signed-in user's username adds a fallback: `?? name ?? "you"` in the
  Pokémon detail page, a `null` `profileHref` for the viewer's own review card, a conditional render
  around the "Profile" item in `NavAvatarMenu`, `?? name ?? "?"` for the avatar letter in
  `SignedInNav`. Each one handles a state that, for a signed-in user on any of those surfaces,
  cannot occur.

Two earlier suggestions — checking in every server action, or checking in every data-layer
function — both keep the "remember to check" problem and just move it. The goal here is a solution
where there is nothing to remember: new pages, actions, and routes are covered by default, and
opting *out* of the gate is the explicit act.

---

## 2. Key observation: the gate already covers server actions

A server action is not a call to some `/api/...` endpoint. The client sends a `POST` to the
**current page's URL** (e.g. `/p/charizard`) carrying a `Next-Action` header that identifies the
function, with the arguments in the body. Because it is an ordinary request to a page path, it
passes through `proxy.ts` exactly like a navigation would — the matcher does not distinguish HTTP
methods.

Today that means a signed-in user without a username who somehow triggers an action gets a
**redirect** response from the proxy. The browser's `fetch` follows it, receives the HTML of
`/signup/username`, and Next's action client fails to parse that as an action response and throws
an opaque error. The action function itself never runs — the gate already blocks the write, just
by accident and with a confusing failure. The doc comment in `require-username.ts` calling the
proxy "navigation UX only" is therefore wrong; that file guards against a request the proxy has
already rejected.

This is also not a security boundary. A rating or review row is keyed on `userId`, not username.
The only consequence of a username-less write would be a review card with no profile link — a
data-consistency and UX concern, which one gate at the front door is the right level for. The
actual security boundary — "is this request from a signed-in user, and never trust a client-supplied
user id" — stays inside every action, unchanged.

---

## 3. Part 1 — proxy answers server actions deliberately

`src/proxy.ts` keeps its existing structure (protected-path redirect to `/sign-in`, then the
username gate). Inside the username-gate branch, one addition: if the request carries a
`Next-Action` header, respond with a JSON body in the project's `{ success, error }` action-result
shape and a 403 status, instead of the redirect. Everything else about the branch — the pathname
exclusion for `/signup/username`, the redirect for normal navigations — is unchanged.

Behaviour matrix after the change:

| Request | Before | After |
|---|---|---|
| Navigation to any page, signed in, no username | redirect to `/signup/username` | unchanged |
| Server action POST, signed in, no username | redirect; action client throws a parse error | 403 JSON; action client throws ("An unexpected response was received from the server") — see the note below |
| Anything, signed in, username set | passes through | unchanged |
| Anything, signed out | passes through (or `/sign-in` redirect on protected paths) | unchanged |

**Note on the client side (found during implementation).** The first draft of this spec assumed
the thrown error would land in "the component's existing failure handling". It doesn't: none of
the six action call sites (`RatingRow` ×2, `FavoriteButton`, `WishlistButton`,
`ReviewComposerForm`, `DeleteReviewDialog`) wraps its `await action(...)` in a `try`/`catch` — they
all rely solely on the `{ success, error }` result. So a *transport* failure of any kind (network
drop, a 500, this 403) surfaces as an unhandled rejection, with no toast and the optimistic state
left un-reverted. That gap predates this feature and is not specific to the gate; fixing it is a
separate, small follow-up (a `try`/`catch` → generic toast + revert per handler, or one shared
wrapper). Practically the 403 path is only reachable when a session goes stale mid-page, since the
navigation gate redirects such a user before they ever see a star to click.

Then **delete `src/lib/require-username.ts`.** It has no importers and its purpose is now served by
the proxy.

**Why this removes the "remember to check" problem.** The matcher is a deny-list — it covers every
path except `_next/static`, `_next/image`, `favicon.ico`, and `api/auth`. A new action file, a new
page, a new route handler are all gated the moment they exist. To take something *out* of the
gate, someone has to consciously add an exclusion to the matcher, which is a visible, reviewable
decision. The default is safe; the exception is explicit. That is the inverse of a per-action
helper, where the default is unguarded and every guard is an act of remembering.

The session the proxy reads (`req.auth.user.username`) comes from the JWT cookie, with no database
round trip. The existing refresh path — `UsernameForm` calling `update({})` after a successful
pick, which triggers the `jwt` callback with `trigger === "update"` to reload the username into the
token — already handles the transition and is not touched.

---

## 4. Part 2 — the session type states the invariant the proxy guarantees

After Part 1 the following holds at runtime: **no code outside `/signup/username` and `/api/auth/*`
ever executes for a signed-in user whose username is `null`.** Keeping `Session.user.username` as
`string | null` forces every caller to handle a case that the gate makes impossible, which is
exactly the noise §1 describes.

Change in `src/types/next-auth.d.ts`: narrow **only** the `Session` augmentation's
`user.username` to `string`. The `User`, `AdapterUser`, and `JWT` augmentations keep
`string | null` — those types genuinely carry `null` between account creation and username
selection, and the token in particular must be able to represent that state. A comment on the
`Session` field states that the field is non-null by invariant rather than by schema, names
`proxy.ts` as the enforcer, and lists the two places (`/signup/username`, `/api/auth/*`) where
`null` can still be observed.

Change in `src/auth.ts`: the `session` callback assigns `token.username` (typed `string | null`) to
`session.user.username` (now `string`). This is the single boundary between "may be null" and "is a
string", and it needs one type assertion, with a comment pointing at the type augmentation for the
rationale. It is the only cast the whole change introduces; nothing else in `auth.ts` moves.

**Call sites that then simplify** (all about the *signed-in viewer's own* username):

- `src/app/(app)/p/[slug]/page.tsx` — the `username` for the review composer and "Your review"
  card no longer falls back through `name` to `"you"`; only the signed-out case (`session` itself
  being `null`) still needs a fallback. `profileHref` for the viewer becomes non-null whenever a
  session exists.
- `src/components/pokemon/YourReview.tsx` — `profileHref` prop becomes `string`, dropping the
  "viewer somehow has no username" comment and the unlinked-render branch for that case.
- `src/components/landing/SignedInNav.tsx` — avatar letter derives from `username` directly, no
  `?? name ?? "?"` chain; the `username` prop passed down is `string`.
- `src/components/landing/NavAvatarMenu.tsx` — the "Profile" item renders unconditionally; the
  `username` prop becomes `string`.

Nothing about the rendered output changes for any user who can actually reach these surfaces —
this is a removal of dead branches, not a behaviour change.

---

## 5. The two places where the type is wider than runtime

These are the only risk Part 2 introduces, and they must be understood rather than papered over:

1. **`src/app/signup/username/page.tsx`** — excluded from the gate by the pathname check. It reads
   the session and redirects to `/` if a username is already set. At runtime the value *is* `null`
   for its intended visitors while the type says `string`. Its existing truthiness check behaves
   correctly (`null` is falsy) and needs no code change, but any future edit that treats the value
   as a real string (e.g. taking its first character) would compile and then fail at runtime.
2. **`src/app/api/auth/username/route.ts`** — excluded via the `api/auth` matcher exception. Same
   situation: it truthiness-checks the session's username to return 409 for already-onboarded
   users, which keeps working unchanged.
3. **`src/components/landing/Nav.tsx`** — found during implementation: the root layout renders the
   Nav on `/signup/username` too, so it observes the `null` username through `useSession()`. The
   first pass narrowed `SignedInNav` to derive the avatar letter from `username` directly, which
   threw on that page (500). Fix: `Nav` renders `SignedInNav` only when `session.user.username` is
   set; a signed-in session without one gets just a "Sign out" button in its place (all of
   `SignedInNav`'s links would only bounce that user back through the gate, and sign-out from the
   step was part of the original onboarding verification). This keeps `SignedInNav` and
   `NavAvatarMenu` themselves unreachable for a null username, so their `string` props stay honest.

All three are named in the type comment from §4 so the exceptions are discoverable from the type
itself. If another gate-exempt surface is ever added, it joins that list.

---

## 6. What this deliberately does not change

- **Other users' usernames read from Prisma.** `getTopReviews` and `getRecentReviews` in
  `src/lib/user-pokemon.ts` select `user.username` from the database, where the column is nullable
  by schema; their `?? name ?? "trainer"` and `profileHref: null` fallbacks stay. Those handle a
  real (if unreachable-in-practice) database state, not a session state, and the honest fix for
  them would be a different, larger change: making the column `NOT NULL` with a generated
  placeholder username at account creation and moving the onboarding flag to a single-purpose
  field. That was considered and set aside for now — it needs a migration with backfill, an adapter
  `createUser` override, and a revision of the §14 decision in `project-overview_8.md`. It remains
  the follow-up if the display-side fallbacks for other users ever become a real burden.
- **The schema.** `User.username` stays `String? @unique`.
- **Onboarding.** `/signup/username`, `UsernameForm`, `POST /api/auth/username`, and the
  `jwt`-callback refresh are untouched.
- **Per-action auth checks.** Every action keeps its `auth()` + `session.user.id` check and Zod
  validation. Only the *username* check is centralised.

---

## 7. Implementation order

1. `src/proxy.ts` — add the `Next-Action` branch returning 403 JSON inside the username gate (§3).
2. Delete `src/lib/require-username.ts`.
3. `src/types/next-auth.d.ts` — narrow `Session.user.username` to `string` with the invariant
   comment (§4).
4. `src/auth.ts` — the single assertion in the `session` callback (§4).
5. Simplify the four call sites listed in §4; let TypeScript surface any remaining now-redundant
   branches.
6. Run `npm run lint` and `npm run build`.

---

## 8. Testing

Manual, in the browser, plus one crafted request:

- **Gate still works for navigation.** Sign in as a user with `username === null` (register a fresh
  credentials user and stop before the onboarding form, or temporarily null the column on a test
  user and clear/refresh the session). Visiting `/`, `/p/charizard`, `/u/anyone` all redirect to
  `/signup/username`; the page itself renders.
- **Gate rejects actions with a clean failure.** With that same session, send a server-action POST
  to `/p/charizard` (a `Next-Action` header with any value is enough to exercise the branch, since
  the proxy answers before Next resolves the action). Expect a 403 with the `{ success: false,
  error }` body and **no** row written to `UserPokemon`.
- **Client receives the 403 on a real action.** Trigger a real action from a page while the session
  lacks a username (load `/p/magikarp` with a username-bearing session cookie, swap the cookie for a
  null-username one without reloading, nudge the "Rate it" slider). The action POST must be
  answered 403 by the proxy and no row written. *Known, pre-existing:* the client surfaces this as
  an unhandled "unexpected response" error rather than a toast — see the §3 note; not fixed here.
- **Onboarding completes and the gate releases.** Pick a username on `/signup/username`; land on
  `/` and stay there; the nav avatar menu shows "Profile" linking to `/u/[username]`; rating a
  Pokémon succeeds.
- **No regression for fully onboarded users.** Detail page "Your review" card links to the
  viewer's profile, composer shows "Posting as @username", top reviews by other users still render
  with their own fallbacks intact.
- **Signed-out visitors** are unaffected on public pages; protected paths still redirect to
  `/sign-in`.
- No console errors; `npm run lint` and `npm run build` pass.
