# Spec — Rating 04 · "Your review" block

> **Status:** spec / pre-implementation
> **Scope:** displaying the signed-in user's own posted review back on `/p/[slug]`, in a dedicated card pinned above Top Reviews, with Edit and Delete affordances.
> **Out of scope:** Top Reviews' own placeholder-to-real-data migration, the review card interaction set (Helpful likes, Reply, Report, the "Read more" clamp for long text), the all-reviews page, markdown-lite rendering, Share.

---

## 1. Goal & scope

Rating 03 made the review composer write `rating` + `reviewText` to the user's `UserPokemon` row, but flagged that the review text itself had nowhere to render back on the page yet — a user could post a review, trust it round-tripped, and never see their own words again without reopening the composer. This slice closes that gap: once a signed-in user has review text saved for a Pokémon, it displays in a "Your review" card between Base Stats and Top Reviews, matching where the design source pins it.

Source design: `PokeHub-Review.dc.html`, **section 3 · "Your review" block** (the card itself plus its delete-confirmation dialog). Section 4 (general review card variants — Default/Hovered/"Helpful" active/"Read more" clamp), section 5 (empty states for Community Rating and Top Reviews), and section 6 (the all-reviews page) are separate artboards in the same file and stay out of scope, same as they were carved out of Rating 03.

---

## 2. When the card appears

Gated on `reviewText` being non-empty, not merely on a rating being set. A user who has only used the "Rate it" row (Rating 01) already sees their chosen rating reflected there — a second card with an empty body would be redundant. This also keeps the gating symmetric with the delete flow (§5): deleting the written review clears `reviewText` but leaves `rating` intact, so the card should disappear afterward while the star rating stays visible on the "Rate it" row.

Anonymous visitors and signed-in users with no review text never see this card — nothing new to gate here beyond what `page.tsx` already computes (`userReview`/`initialReviewText`).

---

## 3. Position on the page

Directly above `TopReviews`, below `BaseStats` — matching the design annotation ("pinned above Top Reviews"). This sits in the existing info-column stack in `page.tsx` alongside the other server-fetched sections.

---

## 4. Card contents

- **Identity row** — avatar, username, and a relative marker distinguishing it as the viewer's own review (the design's literal text is "· you · {date}"). Reuse the avatar pattern already established for the signed-in user elsewhere on the app (real `session.user.image` when set, falling back to a gradient letter badge) rather than the plain static letter avatar the design mock uses — this card has a real signed-in user backing it, unlike `TopReviews`' placeholder cards.
- **Star rating** — the existing two-layer partial-fill star display plus the numeric value, same visual pattern already used in `CommunityRating`/`TopReviews`/`RateRow`.
- **Overflow menu ("⋯")** — opens a small menu with two items: **Edit review** and **Delete**. The design's third item, **Share**, is dropped rather than shipped inert — there's no share feature in the codebase to back it, the same reasoning Rating 03 used to drop the spoiler toggle entirely instead of shipping a control with nothing behind it. Flagged as a deviation, not a silent omission.
- **Review text** — plain paragraph, preserving line breaks, no markdown rendering (unchanged from Rating 03 — markdown-lite still only matters once it's needed in more than one place).
- **Deviation — no Helpful/Replies footer row.** The design shows "♥ N found this helpful" / "💬 N replies" beneath the text. Both require wiring `ReviewLike` and `Comment` against this review, which is out of scope here — same class of decision as dropping the spoiler toggle: no interaction exists yet to attach the row to, so it's omitted rather than rendered as inert pills or as a permanently-zero counter. Deferred to a future review-interactions slice.
- **Deviation — no "Edited Xd ago" indicator.** `UserPokemon` has no field distinguishing "first posted at" from "last edited at" — `reviewedAt` is overwritten on every write (Rating 01/03 both set it to `new Date()` on save), so there's nothing to diff against to know whether a review counts as "edited." The visible date is just `reviewedAt`, shown once, with no edited badge.

---

## 5. Edit

"Edit review" reopens the same composer built in Rating 03 (`ReviewComposer`/`ReviewComposerForm`), pre-filled from the current row exactly as it already is when opened from `PokemonActions`. The composer's open/close state already lives in `src/store/review-composer.ts` (`useReviewComposer`) — "Edit review" just needs to call the same `open()` the "Write review" button already calls. No new store, no new composer variant.

---

## 6. Delete

"Delete" opens a confirmation dialog (design section 3, the second artboard in that section) before anything is written:

- Heading naming the Pokémon being deleted from ("Delete your {Name} review?").
- Body copy making clear the rating is not affected — only the written text is removed, and the action can't be undone.
- Two actions: a neutral "Keep it" that just closes the dialog, and a destructive "Delete review" that commits the change.

Confirming clears `reviewText` only. `rating` and `reviewedAt` are left as-is, mirroring the existing convention in `clearUserRating` (`src/lib/user-pokemon.ts`) where `reviewedAt` survives a change as long as *some* review activity — a rating or review text — still exists on the row. After a successful delete, the card disappears (per the gating in §2) and the Pokémon's rating stays visible on the "Rate it" row and in `CommunityRating`'s aggregate, unchanged.

---

## 7. Data model & persistence

No schema change. A new data-layer function alongside `setUserRating`/`postUserReview`/`clearUserRating` in `src/lib/user-pokemon.ts` — e.g. `deleteUserReviewText(userId, pokemonId)` — that updates the row's `reviewText` to `null` and leaves every other field untouched. Same upsert-adjacent pattern already established; no new indexes or columns needed.

---

## 8. Mutation path

A new server action (e.g. `deleteReview`) alongside `setRating`/`clearRating`/`postReview` in `src/actions/rating.ts`, following the same thin wrapper shape: session read server-side, Zod validation of `pokemonId`/`slug`, call into the data layer, `revalidatePath` on the Pokémon's detail route, `{ success, data, error }` return shape. No new fields to validate beyond what `clearRating` already validates, since delete takes no input besides identifying the row.

---

## 9. Client/server split

The card itself can be a server component — it only reads props computed in `page.tsx` (the same `userReview`/`session` values already fetched there for the composer) and has no local state of its own beyond the overflow menu's open/closed state and the delete-confirmation dialog's open/closed state, both of which are local UI state scoped to a small client component. Per the one-component-per-file convention, expect at least: the card itself, the overflow menu, and the delete-confirmation dialog as separate files if their markup doesn't share cleanly.

---

## 10. Mobile

Section 7 of the design source doesn't include a dedicated mobile artboard for the "Your review" block specifically — only a generic "mobile review card" (the same `ghosttype_andy` example used elsewhere, not a "you" variant) and the mobile "Rate it" / composer artboards already covered by Rating 01/03. Reuse that generic mobile review card's layout (avatar + name/stars stacked, "⋯" trigger, 32px-pill action row) but keep the section 3 desktop card's "you" treatment (the magenta accent, "· you" label, Edit/Delete-only menu) — same adapt-the-closest-artboard approach already used elsewhere on this page when a mobile-specific mock doesn't exist for one variant.

---

## 11. Deliberate non-goals (this slice)

- **Top Reviews real data.** `TopReviews` stays on its placeholder cards this slice — connecting it to real reviews (and its own empty state from design section 5) is a separate, self-contained piece of work and shouldn't be bundled into this one just because both read from the same table.
- **Helpful likes, replies, Report.** No `ReviewLike`/`Comment` wiring against reviews yet (§4). A future slice.
- **The all-reviews page** (design section 6) and **markdown-lite rendering** — unchanged from Rating 03's non-goals; nothing renders review text anywhere new that would need it.
- **The "Read more" clamp for long text** (design section 4). The example "Your review" card in section 3 isn't itself clamped, and the composer already caps input at 1,000 characters — a clamp is worth revisiting once the general review-card pattern (section 4) is built for Top Reviews / the all-reviews page, not for a single card that's always the viewer's own.

---

## 12. Implementation order

1. Data layer: `deleteUserReviewText` in `src/lib/user-pokemon.ts` (§7).
2. Server action: `deleteReview` in `src/actions/rating.ts` (§8).
3. `YourReview` card component (or similarly named) — server component reading the already-fetched `userReview`/session data in `page.tsx`, gated per §2.
4. Overflow menu (Edit review / Delete) and delete-confirmation dialog as client components; Edit wires into the existing `useReviewComposer` store (§5), Delete wires into the new action (§6).
5. Wire into `page.tsx` between `BaseStats` and `TopReviews` (§3).
6. Mobile layout pass (§10).

---

## 13. Testing

Manual, in the browser, signed in as a real user:

- No review text saved → no card renders, regardless of whether a bare rating exists.
- Post a review with text via the composer → the card appears immediately after the page revalidates, showing the correct rating, text, and date.
- "Edit review" → opens the composer pre-filled with the current rating/text (unchanged behavior from Rating 03, just a second entry point).
- "Delete" → confirmation dialog shows the correct Pokémon name and rating; "Keep it" closes with nothing changed; "Delete review" clears the text, the card disappears, and the rating remains on the "Rate it" row and in `CommunityRating`.
- Reload after delete → confirms the clear persisted, not just an optimistic UI change.
- Rate-only user (no text) → still sees their star reflected in "Rate it" row, no "Your review" card.
- Anonymous visitor → no card, no menu.
- 375px → mobile layout matches the adapted generic review-card pattern (§10).
- No console errors; `npm run build` passes.
