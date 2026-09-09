# Spec — Rating 05 · real review-list aggregation for Top Reviews

> **Status:** spec / pre-implementation
> **Scope:** replacing `TopReviews`' static placeholder dataset on `/p/[slug]` with real reviews read from `UserPokemon`, plus the empty state that switching to real data immediately exposes.
> **Out of scope:** the all-reviews page, Helpful/Reply/Report interactions, follower counts, the "Read more" clamp for long text, markdown-lite rendering.

---

## 1. Goal & scope

`TopReviews` has rendered the same two hardcoded sample reviews since 2026-07-03. Rating 03 and Rating 04 gave the app a real place for review text to live (`UserPokemon.reviewText`) and a way for a user to see their own review back, but nothing yet reads other users' reviews off that table. This slice closes that gap: `TopReviews` reads real rows for the Pokémon being viewed, sorted and capped the way described below, with the placeholder dataset and its backing file removed.

Source design: `PokeHub-Review.dc.html`, **section 4 · "Review card variants"** (the card shape this component already follows) and **section 5 · "Empty states"** (the "Top Reviews · none yet" artboard, which real data makes reachable immediately — most Pokémon have zero written reviews right now). Section 6 ("All reviews page") is a distinct, much larger surface — sort/filter controls, pagination, a dedicated route — and stays a future slice, same as it was carved out of Rating 04.

---

## 2. Which rows qualify

A row counts as a displayable review when it belongs to the Pokémon being viewed and has non-null, non-empty `reviewText` — the same condition `YourReview` already gates on for the signed-in user's own row (rating-04 §2). A rating with no written text is not a "review" for this component's purposes, consistent with how the rest of the codebase already treats the two as related but distinct signals (`RateRow` vs. the composer vs. `YourReview`).

---

## 3. Excluding the viewer's own review

The signed-in user's own review is already shown immediately above, in the `YourReview` card (rating-04). The Top Reviews list should exclude it — showing it twice on the same page is redundant and, in the two-card layout this component currently renders, could crowd out every other reviewer entirely. Anonymous visitors and users with no review of their own see the list unfiltered.

This only affects which rows populate the small preview list. The **total count** used in the "View all N" line (§5) should still reflect every written review on the Pokémon, the viewer's own included — it's describing the Pokémon's community total, not the contents of the preview list sitting under it.

---

## 4. Ordering and how many to show

The design's default sort for the full reviews list (section 6) is "Most helpful," but that signal doesn't exist yet — nothing in the schema counts helpful votes until `ReviewLike` is wired against reviews, which rating-04 already deferred to a future slice (§4 there). For this preview list, order by most recently reviewed first (`reviewedAt` descending) instead — the same field `YourReview` already surfaces, and the only real signal currently available that approximates "freshest, most relevant" without fabricating a helpfulness score. Revisit once Helpful voting exists.

Keep showing the same number of cards the component already renders (two) — this is a capped preview feeding into a "View all" line, not the full list, and the existing two-card layout is what the design source shows for this position on the page.

---

## 5. "View all N" count

The count next to "Top Reviews" reflects the total number of written reviews on the Pokémon — every `UserPokemon` row for it with non-null `reviewText`, independent of the exclusion in §3. This text stays inert (not a link) exactly as it renders today; it becomes a real link once the all-reviews page (section 6) exists.

---

## 6. Card contents — what stays, what's dropped

The card shape (avatar, username, star rating, quote text) stays as-is; two pieces of the current placeholder card have no real data behind them and should be dropped rather than faked:

- **Follower count.** The "· 1.2k followers" segment next to the username depends on the follow graph, which has no working feature yet (`Follow` exists in the schema, unused everywhere else in the app). Drop the segment entirely rather than show a fabricated or permanently-absent number — the same reasoning rating-04 used to drop the design's Share menu item.
- **"♥ N found this helpful" footer.** This depends on `ReviewLike` being wired against reviews, which doesn't exist yet (§4, and rating-04 §4's identical deferral for the "Your review" card's own footer). Drop the row rather than render it frozen at zero or omit just the number.

**Star rendering.** `UserPokemon.rating` is stored in half-star units (1–10), not the 0–5 star scale the placeholder data used — convert through the existing `rating.ts` helpers (`toStars`/`toFillPercent`/`formatRatingValue`, already used by `CommunityRating`, `RateRow`, and `YourReview`) rather than the component's current inline `(rating / 5) * 100` math, which assumed star units.

A review with a null rating is possible in principle (a user could, in theory, clear their star rating via "Rate it" while review text survives — the same edge case `YourReview` already handles per rating-04 §2's fallback). Reuse that same fallback treatment here rather than inventing a second one.

---

## 7. Avatar

Reuse the pattern already established for the signed-in user's own avatar (`YourReview`, the nav avatar menu, profile pages): the real `User.image` when set, falling back to a gradient letter badge built from the username's first letter when it isn't. The placeholder data's per-review hardcoded gradient pairs (`avatarGradientFrom`/`avatarGradientTo`) go away along with the rest of the placeholder file — nothing in the schema stores a per-user color, so the letter-badge fallback needs some deterministic way to pick a background for different users (e.g. selecting from a small fixed set of gradients based on the user's id) rather than one flat color for everyone, so a list of several reviewers' avatars doesn't render identically. Any deterministic scheme is fine; nothing about the exact palette is prescribed here.

---

## 8. Empty state

Design section 5's "Top Reviews · none yet" artboard: the heading and count stay ("Top Reviews" / "View all 0" — or the heading's count simply reading zero), and the card list is replaced by a single dashed-border panel — a short icon, a "Be the first to review {Pokémon name}" heading, one line of supporting copy, and a "Write review" call to action that opens the same composer the rest of the page already opens (`useReviewComposer`, same store `YourReview`'s Edit action and `PokemonActions`' "Write review" button already use — no new entry point). This is expected to be the common case at launch, not a rare edge: most Pokémon have zero real reviews today.

---

## 9. Data model & persistence

No schema change. A new read-only query function alongside `getPokemonRatingStats`/`getUserPokemonReview` in `src/lib/user-pokemon.ts` (e.g. `getTopReviews(pokemonId, excludeUserId)`) that reads `UserPokemon` rows for the Pokémon with non-null `reviewText`, joined to `User` for username/image, ordered and capped per §3–§4, plus the total count from §5. Two numbers (the capped list and the total) can come from one function returning both, avoiding two round-trips for what's rendered as one section.

---

## 10. Fetch path

This is read-only page data, not a mutation — it belongs directly in `page.tsx`'s server-component fetch alongside `getPokemonRatingStats`, not behind a server action. Same category as the "no endpoint at all — server components read Prisma directly" rule in `project-overview_8.md` §6.1, and the same shape `getPokemonRatingStats` already established in rating-02.

---

## 11. Client/server split

No new client-side state. `TopReviews` stays a server component reading props computed in `page.tsx`; the only interactive element it gains is the empty state's "Write review" button, which needs to be a small client component to call `useReviewComposer` — the same scope of client boundary `YourReviewMenu` already draws for its own trigger.

---

## 12. Mobile

`TopReviews` already carries its own responsive classes (no separate mobile component exists for it, unlike the artwork/hero/action-bar split elsewhere on this page) — real data flows through the same markup at both widths. No new mobile-specific work; the empty state panel follows the same existing responsive pattern as the card list it replaces.

---

## 13. Deliberate non-goals (this slice)

- **The all-reviews page** (design section 6) — sort controls (Most helpful/Newest/Highest/Lowest), star-count filtering, pagination. A separate, much larger surface; "View all" stays inert until it exists.
- **Helpful votes, Reply, Report** (design section 4's card footer/menu). No `ReviewLike`/`Comment` wiring against reviews yet — same deferral rating-04 already made for the "Your review" card.
- **Follower counts** — depends on the follow graph, which has no working feature anywhere in the app yet.
- **The "Read more" clamp for long text** (design section 4) — not exercised by the two-card preview list any more than it was by `YourReview` in rating-04; worth building once the general review-card pattern gets reused somewhere text length is actually a problem (the all-reviews page).
- **Markdown-lite rendering** — unchanged from Rating 03/04's non-goals.

---

## 14. Implementation order

1. Data layer: `getTopReviews` (or similarly named) in `src/lib/user-pokemon.ts` (§9), returning the capped, ordered list plus the total count.
2. Update `TopReviews.tsx`'s props to match the real shape — drop `followerCount`/`helpfulCount`/the hardcoded gradient pair, add real avatar image + rating conversion via `rating.ts` (§6–§7).
3. Empty-state panel + its client "Write review" trigger (§8, §11).
4. Wire `page.tsx` to call the new data-layer function in place of `PLACEHOLDER_TOP_REVIEWS`; remove `src/lib/placeholder-top-reviews.ts`.
5. Verify the exclusion (§3) and total-count semantics (§5) together against a Pokémon with more than one real reviewer, including the viewer.

---

## 15. Testing

Manual, in the browser:

- Pokémon with zero written reviews → empty state renders, "Write review" opens the composer.
- Pokémon with one written review from another user, viewer has none → that review shows, count reads 1.
- Pokémon with the viewer's own review plus at least one other → viewer's own is excluded from the list (it's already visible in `YourReview` above), the other user's review shows, the count includes both.
- A reviewer with a real avatar image vs. one without → image renders for the former, a letter badge for the latter; two different reviewers without images get visibly different badge colors.
- A review whose rating was cleared but text survives → falls back the same way `YourReview` already does for that case.
- More written reviews on a Pokémon than the card cap → only the capped number render, "View all N" reflects the true total.
- Anonymous visitor → sees the same list (or empty state) as a signed-in user with no review of their own; no exclusion applies.
- 375px width → empty state and populated list both match the existing responsive card layout.
- No console errors; `npm run build`/`lint` pass.
