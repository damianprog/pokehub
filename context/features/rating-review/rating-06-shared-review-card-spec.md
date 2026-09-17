# Rating & Review 06 — Shared Review Card Spec

## Status

Planning — not started

## Goal

Extract the review markup that `YourReview` and `TopReviews` currently duplicate byte-for-byte
(avatar, username/date/"you" meta line, star rating + numeric chip, review text) into one
`ReviewCard` component, so both surfaces render from a single source instead of two hand-kept-in-sync
copies. This is a refactor, not a behavior change — both surfaces should look and act exactly as
they do today after this ships.

## Why

`YourReview.tsx` and `TopReviews.tsx` each render an identical inner card: image-or-letter avatar,
`{username} · {date}` meta line, the two-layer partial-fill star row + `formatRatingValue` numeric
chip (or a "Not yet rated" fallback), and the review text paragraph. The last few rounds of tweaks
to this markup (dropping the wrapping quote marks, adding the date, adding the "you" label) each had
to be hand-applied to both files, and one inconsistency has already crept in from that duplication
(`TopReviews`' paragraph is missing the `whitespace-pre-line` class `YourReview`'s has). Consolidating
removes that drift risk without changing what either surface does.

## Explicitly not in scope

`RecentActivity` on the profile page renders a visually similar rating+chip block, but its card
shape is structurally different — a Pokémon artwork thumbnail instead of a user avatar, and a
"reviewed {Pokémon name}" meta line instead of a username — so it isn't a third copy of this same
card and doesn't get pulled into this component. Leave it as-is.

## Scope

- New `ReviewCard` component (colocated with `YourReview`/`TopReviews` under `src/components/pokemon/`)
  rendering exactly the inner `<article>` markup both surfaces already have: avatar, meta line,
  rating display, review text.
- `YourReview` and `TopReviews` both render `ReviewCard` for their per-review markup. Each keeps its
  own section heading, subtext/count line, and (for `TopReviews`) the empty state and `.map()` —
  none of that is shared, since it's genuinely different between the two surfaces.

## Component shape

`ReviewCard` takes the data every review card already needs — username, avatar image, rating,
review text, reviewed-at date — plus three things that vary by call site:

- **Border/shadow variant.** `YourReview`'s pinned purple border + inset shadow vs. `TopReviews`'
  plain white-alpha border. Two fixed variants, not an open style prop — matches the two real cases,
  not a hypothetical third.
- **The "you" label.** `YourReview` never shows it today (the section heading already says "Your
  review"); `TopReviews` shows it per-row only when that row is the viewer's own review. A boolean
  the caller controls per-render, not a computed default inside the card.
- **The edit/delete menu.** Only `YourReview` renders `YourReviewMenu`; `TopReviews` never does,
  even for the viewer's own row inline in its list — that's existing, intentional behavior (editing
  happens from the pinned card, not from the list preview) and doesn't change here. `ReviewCard`
  takes this as an optional slot rather than importing `YourReviewMenu` itself, so it doesn't need
  to know that component's props — `TopReviews` simply never passes it.

Spacing between cards in a list (`TopReviews`' `mb-[12px] md:mb-[13px]` per row) is the caller's
concern, not the card's — `ReviewCard` shouldn't hardcode margin that only one of its two callers
needs.

## Out of scope

- Any visual or behavioral change to either surface — this ships pixel-identical to today.
- `RecentActivity` (see "Explicitly not in scope" above).
- Extracting the section-level heading/wrapper markup — only the per-review card moves.

## Acceptance criteria

- `YourReview` and `TopReviews` render identically to their current output (pinned purple card with
  menu and no "you" label; plain list cards with per-row "you" label when owned, no menu) — verified
  by comparing screenshots before/after on a Pokémon with both an own review and other users' reviews.
- No duplicated avatar/rating/text markup remains between the two files.
- `npm run build` passes.

## History
