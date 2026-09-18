# Spec — Fix · Server-action transport failures are unhandled on the client

> **Status:** spec / pre-implementation
> **Scope:** every client component that awaits a server action — six handlers across
> `RatingRow`, `FavoriteButton`, `WishlistButton`, `ReviewComposerForm`, `DeleteReviewDialog` —
> so that a failure of the *call itself* (network drop, non-2xx from the proxy or server, an
> unparseable response) is handled the same way a failure *reported by* the action already is:
> optimistic state reverted, busy flag cleared, a toast shown, nothing left uncaught.
> **Out of scope:** the server side of actions (`src/actions/*`, `src/lib/*`), which already
> catches its own errors; the `fetch`-based auth forms (`UsernameForm`, login/register/reset),
> which have their own error handling; anything that changes what the proxy or the actions return.

---

## 1. Problem

Every mutation in the app follows the same client-side shape (`project-overview_8.md` §6.1,
`coding-standards.md` → Error Handling): the handler optionally applies an optimistic update,
awaits the action, and branches on `result.success` — reverting and toasting `result.error` on
failure. That covers every failure the action *returns*: not signed in, Zod rejection, a Prisma
error caught inside the action's own `try`/`catch`.

It does not cover the case where the action call never resolves to a result at all. A server
action is a `fetch` under the hood, and that `fetch` can fail or come back with something the
action client can't decode — the network is down, the request is answered by `proxy.ts` with a
403 (auth-04), the server 500s before the action body runs, a deploy swaps the action id out from
under an open tab. In all of those cases the awaited call **throws**, and none of the six handlers
has a `try`/`catch` around it, so:

- the throw escapes the event handler as an unhandled rejection (Next's dev overlay reports "1
  Issue"; in production it's a silent console error);
- the `if (!result.success)` branch — the one place that knows the previous value — never runs,
  so an optimistic update stays applied. `RatingRow` shows a star rating that was never saved;
  `FavoriteButton` and `WishlistButton` show a toggled state (and, for wishlist, a count) the
  database doesn't have;
- `ReviewComposerForm` and `DeleteReviewDialog` set a busy flag before the await and clear it
  after. The clear never runs, so the "Post review" / "Delete" button stays disabled with no way
  to retry short of closing and reopening;
- no toast, so the user gets no signal anything went wrong.

This was surfaced by auth-04's verification (its spec §3 note and §8 record the observation) but
it predates that feature and is independent of it — any offline click reproduces it today.

---

## 2. Current state

The six call sites and what each does on a *returned* failure:

| Handler | Optimistic? | On `!result.success` today | Busy flag |
|---|---|---|---|
| `RatingRow.commitRating` | yes (`committedValue`, `isEditing`) | revert both, toast `result.error` | — |
| `RatingRow.handleClear` | yes | revert both, toast | — |
| `FavoriteButton.handleClick` | yes (`isFavorite`) | revert, toast | — |
| `WishlistButton.handleClick` | yes (Zustand store: flag + count) | revert store; `atCapacity` → capacity notice, else toast | — |
| `ReviewComposerForm.handleSubmit` | no | toast, stay open | `isSubmitting` cleared after await |
| `DeleteReviewDialog.handleDelete` | no | toast, stay open | `isDeleting` cleared after await |

Every one of them already has the right recovery logic. The defect is purely that a thrown call
bypasses it.

The three action modules each declare their own local `ActionResult<T>` union (`rating.ts`,
`favorite.ts`, and `wishlist.ts` — the last with an extra `atCapacity` flag on the failure arm).
They are not exported and there is no shared type in `src/types/`.

---

## 3. Approach: route a throw into the failure branch that already exists

The revert and the busy-flag reset are inherently per-handler — only the handler knows the
previous value and owns the flag — so no global mechanism (an `unhandledrejection` listener, a
React error boundary) can do the recovery. What *can* be shared is the conversion: turn "the call
threw" into "the call returned a failure result", so each handler's existing `if
(!result.success)` branch handles both cases without knowing which one it got.

Concretely, one small client-side helper in `src/lib/` that takes the pending action call, awaits
it, and either passes the result through unchanged or, if it rejects, logs the underlying error to
the console (so it isn't swallowed) and resolves to a failure result carrying a generic
user-facing message — something on the order of "Something went wrong. Try again." The client
cannot see *why* the call failed (Next's action client throws the same opaque "unexpected
response" error for a 403 and a dropped connection alike), so a generic message is the honest
one; a more specific message would be guessing.

Each of the six handlers then wraps its `await action(...)` in the helper — a one-line change per
site — and nothing else in the handler moves. In particular:

- `ReviewComposerForm` and `DeleteReviewDialog` keep clearing their busy flag right after the
  await; since the await no longer throws, that line now always runs.
- `WishlistButton`'s `atCapacity` branch keeps working: the helper passes a *returned* failure
  through untouched, so the flag is still there when the action set it; a *thrown* failure
  produces a result without the flag and falls into the plain toast branch, which is correct.

**Typing.** The helper should be generic over whatever result shape the action it wraps resolves
to, widening it with the generic failure arm. That way it needs no shared `ActionResult` type and
the three action modules are not touched. Hoisting the duplicated local `ActionResult` unions into
`src/types/` is a reasonable cleanup but is *not* part of this fix — keep it out unless it turns
out to be necessary to type the helper at all.

**Why a helper and not six inline `try`/`catch` blocks.** The inline version duplicates the same
four lines (catch, log, build a failure result, fall through) at every site and has to be
re-derived for each new mutation. The helper reduces "remember to handle transport failures" to
the same one-line discipline every handler already follows for `result.success`, and forgetting it
degrades to today's behaviour rather than introducing anything new.

**Why not swallow it centrally.** A global `unhandledrejection` listener could toast, but it
cannot revert an optimistic value or clear a busy flag, and it would fire for every unrelated
rejection on the page. It is not a substitute for the per-handler path; it isn't needed once the
per-handler path exists.

---

## 4. Behaviour after the fix

For any of the six mutations, when the action call itself fails:

| Surface | Expected |
|---|---|
| `RatingRow` | Stars return to the previous value (or to the unrated/editing state if there was none); error toast. |
| `FavoriteButton` | Heart flips back; error toast. Success toast is *not* shown. |
| `WishlistButton` | Bookmark and "N of 3" count return to their previous values; error toast; capacity notice is *not* opened. |
| `ReviewComposerForm` | "Post review" re-enables; composer stays open with the draft intact; error toast; no `router.refresh()`. |
| `DeleteReviewDialog` | "Delete" re-enables; dialog stays open; error toast; no `router.refresh()`. |
| All | No unhandled rejection in the console, no Next dev overlay issue. |

When the action call succeeds or returns its own failure, nothing changes from today.

---

## 5. Deliberate non-goals

- **Retry logic, offline queues, or optimistic-update libraries.** A toast and a clean revert is the
  established pattern; this fix makes it hold in one more case, it does not redesign it.
- **Distinguishing failure causes on the client.** See §3 — the client can't, so it shouldn't
  pretend to.
- **A shared `ActionResult` type.** Out of scope unless the helper cannot be typed without it.
- **Server-side changes.** The actions and `proxy.ts` already behave correctly for their layer.
- **The `fetch`-based forms** under `src/components/auth/`, which already handle request failures
  in their own way and don't go through server actions.

---

## 6. Implementation order

1. Add the helper in `src/lib/` with a console log of the caught error and the generic failure
   result (§3).
2. Wrap the action call in each of the six handlers (§2 table), in place, without moving any
   surrounding line.
3. `npm run lint`, `npm run build`.
4. Verify per §7.

Branch naming per `ai-interaction.md`: this is a fix, so `fix/...`.

---

## 7. Testing

Manual, in the browser, signed in as a real user, for each of the six handlers. Two ways to make
the call itself fail — either is fine, the second is easier to script:

- **Offline:** DevTools → Network → Offline (or a Playwright `route.abort()` on `POST` requests
  carrying a `Next-Action` header), then trigger the mutation.
- **Gated session (the auth-04 reproduction):** load `/p/[slug]` with a session cookie for an
  onboarded user, swap the cookie for one whose `username` is `null` *without reloading*, then
  trigger the mutation — the proxy answers 403.

For every handler, check the row in the §4 table: state reverted, busy flag cleared, one error
toast, no console error or dev-overlay issue. Then restore the network / cookie and confirm the
same mutation succeeds normally and, for `WishlistButton`, that a genuine at-capacity failure
still opens the capacity notice rather than a toast (i.e. the pass-through of returned failures is
intact).

`npm run build` and `npm run lint` pass.
