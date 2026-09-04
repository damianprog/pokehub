# Spec — Rating 01 · Interactive "Rate it" row

> **Status:** spec / pre-implementation
> **Scope:** turning the existing static `RateRow` on `/p/[slug]` into a working star-rating control — set, change, and clear the signed-in user's own rating for one Pokémon, persisted to `UserPokemon.rating`.
> **Out of scope:** review text, the review composer, "Your review" block, Top Reviews, the all-reviews page, real community-rating aggregation, real rank/list/like stats.

---

## 1. Goal & scope

This is the first slice of the rating & review feature, and the **first real user-generated
mutation in the codebase** — everything shipped so far on `/p/[slug]` and `/u/[username]` is either
seeded Pokémon data or placeholder constants.

The slice is deliberately narrow: only the "Rate it" row changes. A signed-in user can click a star
to set their rating, click again to change it, and clear it. The value round-trips to the database
and survives a reload. Nothing else on the page reacts to it yet — the Community rating card above
keeps its placeholder distribution, and Top Reviews keeps its mocked cards. Those are later slices.

Source design: `PokeHub-Review.dc.html` in the Claude Design project, **section 1 · "Rate it" row**
(states a/b/c) plus the "Rate it — unset / rated" artboard in **section 7 · Mobile**. Sections 2–6
of that file describe later slices and are out of scope here.

---

## 2. States

The row has three visual states, all present in the design source. Pull exact colors, sizing, and
spacing from that source when implementing rather than from this spec.

| State | When | What changes vs. today's static row |
|---|---|---|
| **Unset** | Signed-in user with no rating for this Pokémon; also the anonymous view | Identical to the row as it renders today — "Rate it" label, five flat unset stars, full stats group on the right |
| **Hover preview** | Pointer is over the star control in the unset state (or in edit mode) | Card surface and border lift slightly; stars fill up to the hovered position — snapping to the nearest half (§3) — in the gold accent at reduced opacity so the fill reads as provisional; a small value chip appears next to the stars showing the numeric value and its word label |
| **Rated** | The user has a rating stored for this Pokémon | Label switches from "Rate it" to "Your rating"; border picks up a gold tint; stars render as a solid gold fill; the numeric value is printed next to them; an "Edit" button and a text-only "Clear" affordance appear; the stats group drops its trailing item to make room |

Notes on the states, taken from the design's own annotations:

- The hover fill is rendered at reduced opacity precisely so it cannot be confused with a committed
  rating. The value chip is part of the hover state only.
- In the **rated** state the star control is not directly clickable — the design gives it no pointer
  cursor, unlike the unset state. "Edit" is what puts the row back into an interactive
  (unset-like, hover-previewing) mode with the current value pre-filled. This keeps an accidental
  click from silently overwriting a rating the user already committed.
- "Clear" is styled as plain muted text rather than a button so it never competes visually with
  "Edit".

### Star value labels

The hover chip pairs the numeric value with a one-word label. Use the design's wording:
1 · Awful, 2 · Weak, 3 · Fine, 4 · Great, 5 · Peak. (The design shows "4 · Great"; the remaining
four follow the same pattern and should be confirmed against the source file when implementing.)
Half values reuse the label of the whole star they sit under unless the design source turns out to
define its own — check before inventing copy.

### Keyboard and accessibility

The control is a rating input, not decoration. It needs to be reachable and operable without a
pointer: focusable, arrow keys moving by one half-step, and an accessible name announcing the
current value. Half-step targets are small, so keyboard parity is not optional polish here.

---

## 3. Rating granularity — half stars

**Decided: half stars.** Ratings go from 0.5 to 5.0 in 0.5 increments — ten selectable values,
matching the design's `4.5` rated state and its "half-stars allowed" annotation. This overrides
`context/project-overview_8.md` §3's "1–5 stars", which should be corrected to say half stars.

### Storage

`UserPokemon.rating` stays `Int?` and stays the same column — **no migration** — but its unit
changes from whole stars to **half-star units, 1–10**, where `1` = 0.5★ and `10` = 5.0★. The schema
comment (currently "1-5, validated app-side") must be updated to say so.

Why an integer of half-units rather than the alternatives:

| Option | Verdict |
|---|---|
| `Int` in half-units (1–10) | **Chosen.** No migration, exact equality and grouping, `AVG()` works, no floating-point drift, and the community-rating distribution query stays a plain `GROUP BY`. |
| `Decimal @db.Decimal(2,1)` | Prisma returns a `Decimal` object, which is not serializable across the RSC → client component boundary without converting at every call site. Real cost, no benefit. |
| `Float` | Equality and grouping on floats is a trap. `4.5` is representable, but the class of bug is not worth inviting. |
| `Int` in tenths (5–50) | Only pays off if finer-than-half granularity is ever wanted. The input control is halves; tenths would be dead precision. |

The trade-off accepted: a bare `rating: 7` in the database is not self-explaining. Mitigated by
never passing the raw value around loosely — see below.

### Conversion helpers

A small module (e.g. `src/lib/rating.ts`) owns the unit, following the `stat-colors.ts` /
`type-badge-colors.ts` precedent of one concern per lib file:

- constants for the min/max half-unit values and the step,
- half-units → display stars (divide by two) and the reverse,
- half-units → fill percentage for the existing two-layer star renderers,
- the Zod schema for a valid stored rating.

Nothing outside this module should divide or multiply by two inline.

### What this affects

- **Display is already compatible.** Every star renderer shipped so far (`CommunityRating`,
  `Testimonials`, `Trending`, `Marquee`, `RecentActivity`) uses the two-layer partial-fill pattern
  driven by a percentage, not by whole-star counts. A 90% fill for 4.5★ needs no new technique.
- **Input is the new work.** The star control must resolve which half of a glyph the pointer is
  over — left half sets the `.5`, right half sets the whole value — for both hover preview and
  click.
- **The value chip** (§2) shows one decimal place when the value is a half (`4.5`), and may show
  either `4` or `4.0` for whole values — pick one and be consistent; the design's rated state
  prints `4.5`.
- **Word labels** (§2) are defined per whole star in the design. Halves should reuse the label of
  the whole star they sit under, or the design source should be checked for half-specific copy
  before inventing any.

---

## 4. Data model & persistence

No schema change. The slice writes to the existing `UserPokemon` row for the
`(userId, pokemonId)` pair:

| Field | On set / change | On clear |
|---|---|---|
| `rating` | The chosen value in half-star units, 1–10 (§3) | `null` |
| `reviewedAt` | Timestamp of the write | Left as-is when review text exists; otherwise `null` |
| `updatedAt` | Handled by Prisma | Handled by Prisma |

The write is an **upsert** on the `userId_pokemonId` composite unique key — a user can rate a
Pokémon they have never caught, favourited, or reviewed, so the row very often will not exist yet.
Creating it must not disturb the collection fields (`isCaught`, `count`, `shinyCount` keep their
defaults).

Clearing sets `rating` to `null` rather than deleting the row, since the same row may carry
favourite/wishlist/collection state.

**`reviewedAt` on a bare rating:** a rating with no text is still a review in this data model
(`UserPokemon` holds both), and `reviewedAt` is what the global review feed is indexed on. Setting
it on a rating-only write keeps that index meaningful. Called out here because it is a judgement
call, not something the schema dictates.

---

## 5. Mutation path

A **Server Action** in `src/actions/` — per `context/coding-standards.md`, server actions are the
default for simple mutations and API routes are reserved for webhooks, uploads, long-running work,
specific HTTP semantics, and external clients. None of those apply here: the only consumer is this
page's own UI, and the slice needs optimistic UI plus revalidation, which actions integrate with
directly.

### Layering — the part that matters

The rating logic does **not** live in the action. It lives in a plain, transport-agnostic function
alongside the other data helpers, and the action is a thin wrapper that does four things: read the
session, validate input, call the function, revalidate.

This is what makes the deviation below a non-issue. If a mobile client or CLI ever needs
`PUT /api/pokemon/[id]/rate`, that route becomes a handful of lines calling the same function — no
duplicated validation, no duplicated write path, no migration of logic between layers.

### Requirements

- **Auth check server-side.** Read the session inside the action; never trust a user id sent from
  the client. A server action is a real, publicly reachable POST endpoint — being import-callable
  from a component does not make it private.
- **Zod validation** of the Pokémon id and the rating value (integer in half-star units 1–10 per
  §3, or null for clear) at the action boundary. Reuse the Zod schema from the rating helper module
  rather than redeclaring the bounds.
- **`{ success, data, error }`** return shape per `context/coding-standards.md`, `try`/`catch`
  around the Prisma work, failures surfaced through the existing `sonner` toast.
- **Revalidate** the Pokémon detail path so a subsequent server render reflects the new value.

Two actions (set / clear) or one taking a nullable value — implementer's call.

> **Deviation from the overview:** `context/project-overview_8.md` §6 lists
> `PUT /api/pokemon/[id]/rate` in its route table. That table was written as an up-front REST API
> design, before `coding-standards.md` existed and before any mutation existed in the codebase. The
> route list should be corrected to mark which of its entries are actually server actions — not
> just this one; the same applies to most of the `/api/likes/*`, `/api/follows`, `/api/comments`
> and `/api/lists*` entries. Flagged, not silently changed.

---

## 6. Anonymous users

The row renders in its unset state for signed-out visitors — the design has no separate
"logged out" artboard for it, and hiding the row would leave a hole in the info column.

Interacting with it opens the existing auth modal (`src/store/auth-modal.ts` → `AuthModal`), which
is already mounted and already has a login view. No redirect to `/sign-in`, no inline "log in to
rate" copy — reusing the modal keeps the user on the Pokémon page.

Hover preview for anonymous users: allowed. It costs nothing and advertises what the control does.

---

## 7. Client/server split

`RateRow` is a server component today. Star interaction needs client state (hover index, pending
state), so the interactive star control becomes a client component while the row's static parts —
the label and the stats group — can stay server-rendered.

Per the project's one-component-per-file rule, expect at least:

- the row shell (existing `RateRow`, kept as an RSC),
- an interactive star control client component,
- the row's own state is driven by props from the page (current user's rating, fetched server-side).

The exact split is the implementer's call as long as `'use client'` is confined to what genuinely
needs it and each component lives in its own file.

**Optimistic update:** the star fill should reflect the click immediately rather than waiting for
the round-trip, reverting with a toast if the action fails.

---

## 8. Reading the current rating

`/p/[slug]`'s page component fetches the signed-in user's `UserPokemon` row for this Pokémon
(`rating` only is needed for this slice) alongside the existing `getPokemon` call, and passes the
value down. For anonymous visitors the fetch is skipped entirely.

Add the helper next to the existing data helpers rather than querying inline in the page, matching
how `getPokemon` / `getPokemonsByIds` / `getUserByUsername` are organised.

---

## 9. Mobile

The design's mobile artboard (375px) keeps the same two states but restructures the row:

- The label moves to its own line above the stars.
- Stars grow substantially so each tap target clears the 44px minimum. With half-star input
  (§3) each glyph carries **two** targets, so the design's enlarged mobile stars are a requirement,
  not a nicety — verify the half-width target is still comfortably tappable, and if it is not, say
  so rather than shipping a control that misfires on touch.
- The stats group moves below a horizontal rule instead of sitting alongside the stars, and keeps
  only two items.
- In the rated state, "Edit" and "Clear" sit on the label's line, right-aligned, at a larger touch
  size than desktop.

Today's `RateRow` already hides the stats group below the `md` breakpoint. That hiding rule needs
revisiting against the design, which shows the stats present on mobile under a rule.

---

## 10. Deliberate non-goals (this slice)

- **Review text / the composer.** Sections 2 and 3 of the design source. Next slice.
- **Community rating reacting to the new rating.** `CommunityRating` keeps reading
  `placeholder-rating.ts`. Real aggregation over `UserPokemon.rating` is its own slice and needs a
  decision on how a Pokémon with three ratings should present.
- **Real rank / list / like stats** in the row's right-hand group — still placeholder, unchanged.
- **Top Reviews, the all-reviews page, empty states, "helpful" likes.** Sections 4–6 of the design
  source.
- **Profile stats.** The Reviews count on `/u/[username]` stays mocked.
- **Feed events.** `REVIEW_CREATED` events are not written yet; there is no feed to show them on.
- **Rate limiting / abuse controls.**

---

## 11. Implementation order

1. Rating helper module — units, conversions, fill percentage, Zod schema (§3). Update the
   `UserPokemon.rating` comment in `prisma/schema.prisma` to state the half-unit range.
2. Data helper for reading the current user's rating for a Pokémon, and the transport-agnostic
   write function (§5, §8).
3. Server action(s) for set and clear — auth check, Zod validation, revalidate (§5).
4. Interactive star control client component (§2, §7): half-step hit detection, hover preview,
   value chip, keyboard support.
5. Rework `RateRow` into the three states and wire the control in (§2).
6. Wire the page: fetch the current rating, pass it down, revalidate on write.
7. Anonymous path → auth modal (§6).
8. Mobile layout (§9).

---

## 12. Testing

Manual, in the browser, signed in as a real user:

- Unset row → click the right half of the 4th star → commits 4.0, label switches to "Your rating".
- Click the **left** half of the 4th star → commits 3.5, and the star renders half-filled.
- Reload the page → the rating is still there (it came from the database, not local state), and a
  half value round-trips as a half, not rounded to a whole star.
- The stored value is in half-units: a 4.5★ rating is `9` in `UserPokemon.rating`.
- Keyboard: focus the control, arrow through the range in half steps, commit without a pointer.
- "Edit" → stars interactive again with the current value pre-filled → pick a different value →
  it persists.
- "Clear" → row returns to the unset state; reload confirms `rating` is null.
- A Pokémon with no existing `UserPokemon` row → rating it creates the row without touching the
  collection fields.
- Signed out → hovering previews, clicking opens the auth modal, nothing is written.
- Failure path → action error surfaces a toast and the optimistic fill reverts.
- 375px → matches the mobile artboard; tap targets are comfortable.
- No console errors; `npm run build` passes.
