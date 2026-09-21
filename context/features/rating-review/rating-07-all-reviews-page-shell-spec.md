# Spec — Rating 07 · All reviews page (shell + real review list)

> **Status:** spec / pre-implementation
> **Scope:** the new `/p/[slug]/reviews` route — breadcrumb, a compact Pokémon identity header, the reused community rating card, a "Write review" entry point, the real list of every written review for the Pokémon with the viewer's own pinned on top, and the empty state. Also wires the detail page's dead "View all N →" text into a real link to this route, and — prompted directly during implementation — consolidates the "Write review" click handler that `PokemonActions`, `PokemonMobileActionBar`, and `TopReviewsEmptyState` each independently duplicated into the new shared button component (§4, §13).
> **Out of scope:** making the sort chips actually re-sort the list (Rating 08), "Load more" pagination (Rating 09), Helpful/Reply/Report, follower counts, star-count filtering, markdown-lite rendering.

---

## 1. Goal & scope

`TopReviews` on `/p/[slug]` has shown a capped, two-card preview of real reviews since Rating 05 (rating-05-top-reviews-real-aggregation-spec.md), with a "View all N →" line that has never gone anywhere — `project-overview_8.md` §6 has always listed `/p/[slug]/reviews` as a route, but nothing lives there yet. This slice builds that page: a dedicated screen showing every written review for a Pokémon, not just the two-card preview.

Source design: `PokeHub-PokemonReviews.dc.html` (desktop 1440 + mobile 375, populated and empty-state artboards for each), reviewed and corrected in-session — see the two design-review passes earlier in this history for what changed (mobile rating card matches desktop exactly, no invented rank text; the empty state keeps the real community rating card and only replaces the review list; empty-state copy matches `TopReviewsEmptyState`'s existing wording).

This slice is deliberately the page's shell plus its core content — not the whole design in one pass. The sort chips and "Load more" button are visually present (matching the design) but not yet functional; Rating 08 and Rating 09 wire them up in turn, the same incremental order this project has used for every other multi-piece feature.

---

## 2. Route & page structure

New route at `src/app/(app)/p/[slug]/reviews/page.tsx`, inside the existing `(app)` route group so it inherits `Nav`, the `.app-bg` background, and the shared container — no new layout code, same as `/u/[username]` and `/p/[slug]` before it. `notFound()` on an unknown slug, same as the detail page. `generateMetadata` sets a title along the lines of "{Pokémon name} reviews — PokeHub."

Top to bottom: breadcrumb, identity header block (§4), community rating card (§5), sort row (§7, static this slice), review list (§6) or empty state (§8), no pagination control this slice (§9's fetch returns everything — see the note there on why "Load more" isn't shown yet).

---

## 3. Data — qualifying rows, pinning, ordering, totals

A row counts as a displayable review under the same rule already used everywhere else in this feature: it belongs to the Pokémon and has non-null, non-empty `reviewText` (rating-05 §2, rating-04 §2). A rating with no written text isn't a review for this page's purposes.

The signed-in viewer's own review, when they have one, is pinned as the first item in the list — the same purple-bordered, "you"-labeled treatment `YourReview` already uses on the detail page, including its Edit/Delete menu. It does not also appear again further down the list. Every other qualifying row is ordered most-recently-reviewed first (`reviewedAt` descending — the only real "freshness" signal that exists, same reasoning as rating-05 §4) and none of them carry a "you" label, since the viewer's own is never among them.

This exclusion is scoped to this page's own query and doesn't touch `TopReviews`' existing query on the detail page. That preview intentionally includes the viewer's own review inline (marked "· you") rather than excluding it — a different, deliberate behavior for a short recency preview versus this page's pinned-then-everyone-else structure, not something this slice changes. Anonymous visitors and signed-in users with no review of their own see the ordered list unfiltered, with no pinned card above it.

The total review count used in the header (§4) and the detail page's "View all N" line (§9) counts every qualifying row, the viewer's own included — describing the Pokémon's total, same as rating-05 §5 already established for the preview.

---

## 4. Header — breadcrumb, identity, title/count, Write review

**Breadcrumb.** "Browse · {Type} · {Pokémon name} · Reviews," reusing the existing `Breadcrumb` component. "Browse" links to `/discover`, the type label stays plain text (no type-browse route exists, matching the detail page's own breadcrumb), the Pokémon name links back to `/p/[slug]` (this page is one level below the detail page, so — unlike on the detail page itself, where the name is the unlinked current crumb — here it's a real link back up), and "Reviews" is the current, unlinked page. Unlike the detail page's breadcrumb (desktop-only), this one shows at both desktop and mobile widths, matching the design source for this screen.

**Identity block.** A small Pokémon thumbnail (the same per-type radial-gradient background `PokemonArtwork` already uses via `TYPE_GRADIENTS`, sized down for a compact header rather than the full artwork treatment — no watermark, no wishlist badge, no crosshatch needed), next to the zero-padded dex number, the Pokémon's name, and its type badges (reusing `TYPE_BADGE_COLORS`, same rendering `PokemonHeader` already uses). This is new markup, not a reuse of `PokemonHeader` itself, since the layout is a horizontal compact row rather than `PokemonHeader`'s stacked full-size treatment.

**Title & count line.** An "Reviews" heading, with a line underneath reading "{N} reviews · {average} average" once at least one written review exists — {N} is the total from §3, {average} is the same average `getPokemonRatingStats` already computes for the community rating card below it (all ratings, not just written ones — these are two distinct numbers sitting next to each other, same distinction the rest of the page already draws between "reviews" and "ratings"). When there are zero written reviews, this line reads "No reviews yet" instead, independent of whether the Pokémon has star ratings with no text attached — see §8 for why the rating card still renders normally in that case.

**Write review.** A gradient button, same visual treatment as `PokemonActions`' existing one, opening the same composer every other entry point on the detail page already opens (`useReviewComposer`) — signed out, it opens the auth modal instead. This page needed its own instance of that behavior, and the identical `handleWriteReview` pattern already existed independently in `PokemonActions`, `PokemonMobileActionBar`, and `TopReviewsEmptyState` — three copies of the same six lines. Rather than adding a fourth, the new `WriteReviewButton` client component became the single implementation, and those three existing sites were refactored onto it: each keeps its own size, radius, and shadow via a `className` prop (those genuinely differ per call site — desktop sidebar vs. mobile sticky bar vs. empty-state CTA vs. this page's two instances), while the gradient background, text color, font, and the auth-gate-then-open-composer handler now live in exactly one place.

---

## 5. Community rating card

Reuse `CommunityRating` exactly as it exists today, fed by `getPokemonRatingStats(pokemon.id)` — no changes to that component or query. It already handles the zero-ratings case correctly (renders 0.0 and empty bars, verified in rating-02), which matters here since §8's empty state keeps this card visible.

---

## 6. Review list & card contents

Every card — pinned and unpinned — is `ReviewCard`, unchanged, the same component `YourReview` and `TopReviews` already share (rating-06). The pinned card additionally carries `YourReviewMenu` (Edit review / Delete) in its `menu` slot, identical to how `YourReview` wires it on the detail page — editing or deleting from this page should work the same way it does there, since it's the same underlying data.

No new card variant, no new props on `ReviewCard` — this page is a longer, unpaginated-for-now list of the same card shape already built.

---

## 7. Sort row (static this slice)

The three chips from the design ("Newest," "Highest rated," "Lowest rated") render with "Newest" shown active and the other two inert — clicking them does nothing yet. This matches the project's established pattern of shipping a section's static shell before wiring its behavior (`RateRow`, `PokemonActions`' favorite/wishlist buttons, the profile header's Follow button all shipped this way first). Rating 08 makes the other two real.

---

## 8. Empty state

When there are zero written reviews, the review list area is replaced by `TopReviewsEmptyState` — reused directly, unchanged, same copy it already has ("Be the first to review {name}," "Nobody's written about {name} yet — yours will be the first thing shown here," a "Write review" button opening the same composer). No new empty-state component needed; this is the same component the detail page's `TopReviews` already renders for the same condition.

Critically, the community rating card (§5) stays visible and real in this state rather than being replaced or hidden — a Pokémon can have plenty of star ratings with zero written reviews (the common case for most Pokémon right now), and those are separate signals. This was the main correction made to the design in the earlier review pass; the design's first draft conflated the two, showing a "nobody has rated yet" panel instead of the real histogram.

---

## 9. Linking the detail page in

`TopReviews.tsx` gains a `slug` prop (trivial — `page.tsx` already has `pokemon.slug` in scope) and its "View all N →" text becomes a real `<Link href={`/p/${slug}/reviews`}>`, replacing the inert `<span>` it's been since Rating 05. This is the one small change to existing code this slice makes outside the new route itself.

**Why no "Load more" button yet:** this slice's data fetch returns every qualifying review unpaginated (§11) rather than a capped page — real review counts per Pokémon are small right now, and showing an inert "Load more" button when everything is already on the page would be misleading (implying hidden content that isn't there). Rating 09 introduces a real capped/paginated fetch and the button becomes meaningful then.

---

## 10. Mobile

Reuses `PokemonMobileTopBar` (back arrow, centered title, inert "⋯"), with the title text "Reviews." That component's back arrow is currently hardcoded to `/`; it needs a `backHref` prop (defaulting to `/` so the detail page's existing usage is unaffected) so this page can pass `/p/[slug]` instead — going "back" from the reviews page should return to the Pokémon it belongs to, not home.

Everything else — identity block, title/count line, rating card, sort row, review list, empty state — uses the same responsive treatment already established across this page's sibling components (scaled-down text/spacing at the `md` breakpoint, not a separate mobile-only component tree), matching how `CommunityRating`, `ReviewCard`, and `TopReviewsEmptyState` already work today.

---

## 11. Data model & persistence

No schema change. A new read-only function in `src/lib/user-pokemon.ts`, e.g. `getAllReviews(pokemonId, viewerId)`, returning the viewer's own qualifying row (or `null`), the ordered list of everyone else's qualifying rows (unpaginated this slice), and the total count (§3) — reusing the existing `TopReviewItem` shape rather than inventing a parallel type for what's structurally the same row.

This is a new function rather than an extension of `getTopReviews` — that function is capped at a small preview size and (as it stands today) doesn't exclude the viewer's own row the way this page needs to, and widening its contract risks changing behavior on the detail page it already serves. Keeping them separate avoids that risk entirely.

The page also needs `getUserPokemonState(userId, pokemon.id)` (already exists) to seed the review composer's initial rating/text, exactly as the detail page already does — the composer is the same component, opened from a different page.

**Revalidation.** `src/actions/rating.ts`'s four mutations (`setRating`, `clearRating`, `postReview`, `deleteReview`) previously only called `revalidatePath(`/p/${slug}`)`, which was sufficient when the detail page was the only surface showing this data. Now that this page shows the same rows, each of those four gained a second `revalidatePath(`/p/${slug}/reviews`)` call — without it, editing or deleting from the detail page and then soft-navigating (e.g. "View all N →") to this page could serve a stale prefetched payload from the client Router Cache, the same class of staleness this codebase already hit once (`context/current-feature.md`'s 2026-07-20 history entry). A same-page edit was already fine regardless, since the composer/delete dialog both call `router.refresh()` on success, which re-fetches the current route's payload independent of which path was revalidated.

---

## 12. Fetch path

Read-only page data, fetched directly in `page.tsx` alongside the other queries — same category as every other read on this page (`project-overview_8.md` §6.1), no server action, no API route.

---

## 13. Client/server split

The page and its new header/list components stay server components. The only new client component this slice adds is `WriteReviewButton` (§4); the pinned card's `YourReviewMenu` (§6) and `TopReviewsEmptyState` (§8) are reused as-is. A side effect of consolidating onto `WriteReviewButton`: `PokemonActions`, `PokemonMobileActionBar`, and `TopReviewsEmptyState` no longer own a handler or call a hook directly, so all three drop `"use client"` and become server components themselves — they now just render `WriteReviewButton` as a child, the same relationship `page.tsx` has to it.

---

## 14. Deliberate non-goals (this slice)

- **Real sort behavior** — the chips are visual only this slice (§7); Rating 08.
- **Pagination / "Load more"** — the fetch is unpaginated this slice (§9); Rating 09.
- **Helpful/Reply/Report, follower counts** — same deferrals already made in rating-04/rating-05, nothing here changes that.
- **Star-count filtering** — not in the design, not planned.
- **Changing `TopReviews`' own inclusion behavior on the detail page** — its preview intentionally includes the viewer's own review inline rather than excluding it (§3); not a defect, not touched by this slice.

---

## 15. Implementation order

1. `getAllReviews` in `src/lib/user-pokemon.ts` (§11).
2. `backHref` prop on `PokemonMobileTopBar` (§10).
3. New route + `page.tsx`: fetch pokemon, session, `getUserPokemonState`, `getPokemonRatingStats`, `getAllReviews`; assemble the header, rating card, sort row, list/empty-state, and mount `ReviewComposer` the same way the detail page does.
4. New header component(s): breadcrumb wiring, identity block, title/count line, the client "Write review" button (§4).
5. New list component: pinned card (`ReviewCard` + `YourReviewMenu`) + mapped default cards, or `TopReviewsEmptyState` (§6, §8).
6. Static sort row markup (§7).
7. `TopReviews.tsx`: add `slug` prop, turn "View all N" into a real link (§9).
8. Bundled in once `WriteReviewButton` existed, prompted by a direct question about `PokemonActions` rather than planned up front: refactor `PokemonActions`, `PokemonMobileActionBar`, and `TopReviewsEmptyState` onto it, deleting their three duplicated handlers (§4, §13).

---

## 16. Testing

Manual, in the browser:

- A Pokémon with several written reviews including the viewer's own → viewer's own renders pinned at top with a working Edit/Delete menu, everyone else follows ordered newest-first, none of them duplicate the viewer's own.
- A Pokémon with written reviews but the viewer has none → ordered list only, no pinned card.
- A Pokémon with star ratings but zero written reviews → community rating card renders real (non-empty) data; the list area shows the empty state, not a rating-related message.
- A Pokémon with zero ratings and zero reviews → rating card shows its existing zero-state, empty state below it.
- Header count line reads correctly in both the populated and "No reviews yet" cases.
- From the detail page, "View all N →" navigates to the correct Pokémon's reviews page.
- Editing or deleting the pinned review from this page behaves identically to doing so from the detail page (same underlying row).
- Mobile back arrow returns to the Pokémon's detail page, not home.
- Anonymous visitor → sees the same list/empty state as any signed-out visitor; "Write review" opens the auth modal instead of the composer.
- 375px and desktop widths both match the corrected design source (breadcrumb visible at both).
- After the `WriteReviewButton` consolidation: `PokemonActions` (desktop sidebar), `PokemonMobileActionBar` (mobile sticky bar), and `TopReviewsEmptyState` (both surfaces it renders on) each render pixel-identical to their pre-refactor appearance — verified via Playwright screenshots, no visual regression from the shared component absorbing them.
- No console errors; `npm run build`/`lint` pass.
