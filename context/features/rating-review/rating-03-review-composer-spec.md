# Spec — Rating 03 · Review composer

> **Status:** spec / pre-implementation
> **Scope:** wiring the inert "Write review" button on `/p/[slug]` to a modal (full-screen sheet on mobile) that lets a signed-in user set their star rating and write review text for one Pokémon, persisted to the existing `UserPokemon` row.
> **Out of scope:** displaying the posted review anywhere on the page ("Your review" block), editing/deleting an existing review from a review card, the spoiler-blur toggle, markdown-lite rendering, Top Reviews, the all-reviews page, replies/likes on reviews.

---

## 1. Goal & scope

Rating 01 made the star control on the "Rate it" row real. Rating 02 made the community aggregate above it real. Neither slice touched `UserPokemon.reviewText` — the "Write review" button in `PokemonActions` has been static markup since it was first built. This slice makes it work: clicking it opens a composer where a signed-in user picks a star rating and (optionally) writes review text, and submitting persists both to their existing `(userId, pokemonId)` row.

This is deliberately still a narrow slice. The composer writes data that has, for now, nowhere to render back on the page — `CommunityRating`'s aggregate already reflects a newly-set rating (Rating 02), but the review *text* itself isn't displayed anywhere yet (`TopReviews` stays on its placeholder cards, and the design's "Your review" block is a separate artboard). A user who posts review text today gets a success toast and can trust it round-tripped to the database and survives a reload, but won't see their own words on the page until a later slice builds that display. Flagged here so it doesn't read as a bug during testing.

Source design: `PokeHub-Review.dc.html` in the Claude Design project, **section 2 · "Review composer"** (empty and filled desktop states) and the composer artboard within **section 7 · Mobile**. Section 3 ("Your review" block, including its edit/delete affordances and the delete-confirmation dialog) and sections 4–6 (review card variants, empty states, the all-reviews page) are separate artboards in the same file and are out of scope here, same as they were carved out of Rating 01.

---

## 2. Entry point & auth gating

The composer's only entry point this slice is the existing "Write review" button in `PokemonActions` (desktop sticky column) — there's no second entry point yet, since the "Your review" block's own "Edit review" menu item (section 3) isn't being built. On mobile, the equivalent action lives on `PokemonMobileActionBar`; check that surface for the same button and wire it identically.

Anonymous visitors: clicking "Write review" opens the existing auth modal (`src/store/auth-modal.ts`), matching the pattern already established for the "Rate it" row (Rating 01 §6) — no redirect, no inline "log in to review" copy.

---

## 3. Composer contents

One modal, two logical states, both in the same design artboard:

- **Star control** at the top — the same half-star input already built for the "Rate it" row (`RatingStars`, `src/components/pokemon/RatingStars.tsx`), not a re-implementation. That component already takes its value, hover/commit callbacks, and interactivity as plain props with no dependency on `RateRow`'s layout, so it mounts directly in the composer with its own local state and commit handler. Reuse avoids re-deriving the half-star hit-detection math (measuring against each glyph's own rendered rect) a second time.
- **Review text** — a plain multi-line text field below the stars, capped at 1,000 characters, with a live counter. No markdown parsing on the input side; the design's "Markdown-lite: *italic*, **bold**" hint is about how review text renders elsewhere (Top Reviews, the all-reviews page), which are both out of scope — the composer itself just stores the raw text.
- **Submit / Cancel** — "Post review" commits both fields to the `UserPokemon` row and closes the modal; "Cancel" discards any unsaved edits and closes without writing anything.

Opening the composer pre-fills both fields from the signed-in user's current `UserPokemon` row for this Pokémon, if one exists — a user who already set a bare rating via the "Rate it" row and then opens "Write review" to add text should see their existing rating already selected, not a blank control.

**Submit gating:** "Post review" is disabled until a rating is selected — this mirrors the design's own empty-state annotation ("Pick a rating to post") and means the composer cannot be used to write text-only feedback with no star attached. Review text itself may be left blank; a rating with no text is already a valid review in this data model (per the schema notes in `project-overview_8.md` §5.4), so submitting a chosen rating with empty text is allowed and simply behaves like using the "Rate it" row directly.

**Deviation — word label copy:** the design's filled-state example prints "4.5 · Excellent" next to the stars, but the word labels already shipped for the "Rate it" row's hover chip (Rating 01 §2, `src/lib/rating.ts`'s `toWordLabel`) are Awful/Weak/Fine/Great/Peak, and 4.5 maps to "Peak" there. Reusing the existing labels for consistency across the app is the call made here — the composer should not introduce a second, different label vocabulary for the same value. Flagged rather than silently resolved in case "Excellent" was meant as a deliberate composer-specific tone.

---

## 4. Character limit & validation

1,000 characters, enforced in both places: the textarea/counter in the UI, and a Zod `max(1000)` check at the server action boundary — client-side enforcement alone isn't a guarantee, per the project's standard of validating all inputs server-side.

---

## 5. Data model & persistence

No schema change — `UserPokemon.reviewText` already exists. The write is the same upsert-on-`(userId, pokemonId)` pattern Rating 01 established for `rating`, extended to also set `reviewText`:

| Field | On submit |
|---|---|
| `rating` | The chosen half-star-unit value (required — see §3) |
| `reviewText` | The submitted text, or `null` if left blank |
| `reviewedAt` | Timestamp of the write |

Creating the row via this path must not disturb collection fields (`isCaught`, `count`, `shinyCount`) any more than the existing rating upsert already doesn't.

---

## 6. Mutation path

A new server action (e.g. `postReview`) alongside the existing `setRating`/`clearRating` in `src/actions/rating.ts`, or its own `src/actions/review.ts` — implementer's call, but keep the layering Rating 01 established: the action is a thin auth-check + Zod-validate + call + `revalidatePath` wrapper, and the actual write lives in a transport-agnostic function in `src/lib/user-pokemon.ts` next to `setUserRating`/`clearUserRating`. Whether that's a new function or an extended `setUserRating` that optionally takes review text is also the implementer's call — but don't duplicate the upsert logic between the two.

Requirements carried over from Rating 01 §5 unchanged: session read server-side (never a client-supplied user id), Zod validation of both fields, `{ success, data, error }` return shape, `revalidatePath` on the Pokémon's detail route so `CommunityRating` and the "Rate it" row both reflect the change on next render.

---

## 7. Client/server split

The composer is a new client component (modal state, form state, the reused `RatingStars` control). It's triggered from `PokemonActions`, which becomes a client component itself if it isn't already effectively one once it owns open/close state for the modal — check whether that state belongs on `PokemonActions` directly or in a small store, consistent with how `AuthModal` uses `src/store/auth-modal.ts` for the same kind of global open/close need. Per the project's one-component-per-file rule, expect at least the modal shell and the mobile full-screen-sheet variant to be separate files if their markup diverges enough to not share one component cleanly.

**Optimistic behavior:** unlike the "Rate it" row's per-star optimistic fill, a full-form submission is a reasonable place to show a pending/disabled "Post review" state while the action is in flight rather than optimistically closing the modal before the write confirms — revert to the open, editable state with a toast on failure.

---

## 8. Mobile

Section 7 of the design source shows the composer as a full-screen sheet rather than a centered modal — same fields and gating, different chrome (a top bar with "Cancel"/"Review"/"Post" instead of a header + Post/Cancel button row, and a bottom drag-handle treatment). Pull the exact layout from that artboard when implementing; functionally it's the same component logic as the desktop modal, just a different presentational shell, matching how `PokemonMobileTopBar`/`PokemonMobileActionBar` already reuse desktop logic behind mobile-specific markup elsewhere on this page.

---

## 9. Deliberate non-goals (this slice)

- **The "Your review" block** (design section 3) — where a posted review would actually display back on the page, along with its "Edit review" / "Share" / "Delete" menu and the delete-confirmation dialog. Next slice.
- **The spoiler toggle.** It appears in every composer state in the design, but there's no schema field for it (`UserPokemon` has no `containsSpoilers` column) and nothing yet renders a review's text in a way a spoiler-blur could apply to (the "Your review" block and review cards are both out of scope). Adding a column for a flag nothing reads yet is the same anti-pattern the project already avoided once (see `project-overview_8.md` §14's reasoning for keeping `isCaught` a boolean instead of an unused `SEEN` enum value). The toggle is omitted from this slice's composer entirely rather than shipped as an inert control — flagged as a deviation from the design source, not a silent drop.
- **Markdown-lite rendering.** Only matters once review text is displayed somewhere (Top Reviews, the all-reviews page, the "Your review" block) — none of which exist yet.
- **Local draft autosave.** The mobile artboard's "Draft saved" text is treated as a design annotation for that specific example, not a requirement to persist unsaved composer state (to `localStorage` or otherwise) across an accidental close.
- **Top Reviews, the all-reviews page, review replies/likes.** Unchanged, per Rating 01 §10 and Rating 02 §9.
- **Reopening the composer pre-filled from a review card's "Edit" action.** The only entry point this slice is `PokemonActions`' "Write review" button (§2) — there is no review card to edit from yet.

---

## 10. Implementation order

1. Extend the data layer: either a new `postUserReview` function or an extended `setUserRating` in `src/lib/user-pokemon.ts` that also accepts `reviewText` (§5).
2. Server action(s): auth check, Zod validation (rating required, text optional and ≤1,000 chars), `revalidatePath` (§4, §6).
3. Composer component: reused `RatingStars` control, text field with counter, Cancel/Post, pre-filled from the current `UserPokemon` row, submit gated on a rating being selected (§3).
4. Wire "Write review" in `PokemonActions` (and its mobile equivalent) to open the composer; anonymous visitors get the auth modal instead (§2).
5. Mobile full-screen-sheet variant (§8).

---

## 11. Testing

Manual, in the browser, signed in as a real user:

- No existing rating → "Write review" opens the composer with an unset star control and empty text; "Post review" stays disabled until a star is picked.
- Pick a rating, leave text blank, submit → the row's `UserPokemon.rating` is set, `reviewText` stays `null`, matches what the plain "Rate it" row would have done.
- Pick a rating and write text, submit → both persist; reload the page and reopen the composer → both are pre-filled with what was saved.
- Already-rated Pokémon (via the "Rate it" row) → opening the composer shows that rating already selected, not blank.
- 1,000-character boundary → the 1,001st character is rejected client-side and server-side.
- Cancel after making changes → nothing is written; reopening shows the prior saved state, not the discarded edits.
- Failure path → a toast surfaces the error and the modal stays open with the user's input intact.
- Anonymous → clicking "Write review" opens the auth modal, nothing is written.
- 375px → the full-screen sheet variant matches the mobile artboard.
- `CommunityRating` (Rating 02) reflects a rating set via the composer after reload, same as one set via the "Rate it" row.
- No console errors; `npm run build` passes.
