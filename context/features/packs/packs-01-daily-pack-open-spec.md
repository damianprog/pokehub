# Spec — Packs 01 · Daily pack open + reveal

> **Status:** spec / pre-implementation
> **Scope:** the new `/packs` route with the stage card in its daily-pack states (closed, opening, error, reveal, already opened today), the "Open daily pack" mutation, the roll engine (tier weights, uniform pick inside the tier, shiny roll), the transactional `Pack` / `PackRoll` / `UserPokemon` writes, the four tier card looks plus shiny, the loading skeleton, the "Packs" nav link and the `DEV_UNLOCK_ALL` daily bypass.
> **Out of scope:** the mobile tab bar and Packs badge (02), pity and the sidebar (03), the wishlist boost (04), tabs, duplicates and every dust UI including the header dust pill (05), the "Your packs" shelf and earned packs (06), the shop (07), streaks (08), feed events (09) and history, including the reveal's "View history" link (10). See `overview.md`.

---

## 1. Goal & scope

Today the "Packs" nav item goes to `/`, and `/packs` doesn't exist. This slice makes the core loop real: once per UTC day a signed-in user opens a free pack, sees three Pokémon revealed one by one, and those Pokémon land in their collection. Everything else in the feature builds on this transaction.

Mechanics come from `project-overview_8.md` §4.1, §4.2 and §10.3. Layout comes from `PokeHub-Packs.dc.html`, using these artboards:

- 01 (closed): only the stage card
- 02 (reveal)
- 02 (card tiers + shiny)
- 03 (already opened today)
- 12 (loading, opening in progress, couldn't open)

The design's numbers are placeholders (`overview.md` §4).

---

## 2. Route & page structure

New route `src/app/(app)/packs/page.tsx` inside the `(app)` group, so it inherits `Nav`, `.app-bg` and the container. `proxy.ts` already sends logged-out visitors to `/sign-in` and username-less users to the username step, so the page can assume a session with a username. The metadata title is along the lines of "Packs — PokeHub".

From top to bottom:

- **Header.** The "Packs" heading and the design's one-line subtitle. The dust pill on the right is **not** rendered yet. Dust arrives in slice 05, and showing a fake balance would be worse than showing none.
- **No tabs yet.** There's only one view until Duplicates exists (slice 05). An inert tab bar would look broken, so it isn't rendered.
- **Stage card.** The large rounded card described in §3 and §5, spanning the full content width. The design's right sidebar (pity, streak, shop) and the "Your packs" shelf under the stage aren't rendered. They arrive in slices 03, 06, 07 and 08.

---

## 3. Stage: daily pack states

The stage shows the daily pack in exactly one of these states. Copy follows the design's daily-pack variant.

- **Closed** (the daily pack is available). The "FREE TODAY" kicker and a "Daily pack" title sit above the pack art, a single foil booster wrapper in the daily pack's green tint:
  - crimped, serrated seals along the top and bottom edges, with a diagonal gloss sheen over the whole wrapper;
  - the "P" badge and a "PokeHub" wordmark near the top;
  - a rounded window in the middle with three fixed, decorative Pokémon artworks (Gengar and Dragonite tilted outward, Pikachu in front) on a soft light glow;
  - the "DAILY" tag and "3 CARDS" at its foot.

  The artworks are fixed decoration, not the pack's contents. Build the wrapper as its own component, since slice 06's "Your packs" tiles reuse a miniature of it with a different tint and tag per source. Below the art is the brand-gradient "Open daily pack" button and the line "One free pack a day · resets at midnight UTC".
- **Opening.** While the request is in flight, the pack wobbles and the button turns dimmed, with a spinner and "Opening…". The line under it reads "Shuffling your cards". The button can't be pressed again.
- **Error.** If the open fails (for example, a transport failure from `runAction`), a red notice above the button reads "Couldn't open the pack, try again." with "Your pack wasn't used. It's still waiting for you." beneath it. The button becomes "Try again" and retries the same action. The open is a single transaction, so the claim really wasn't used.
- **Reveal** (right after a successful open) and **already opened today** (any later visit the same UTC day) are described in §5.

Countdowns ("Next pack in Xh Ym", "Next free pack in Xh Ym") come from one small client component. The server gives it the next 00:00 UTC instant, and it re-renders every minute. When it reaches zero it refreshes the route instead of switching state on the client.

---

## 4. The roll

All rolling happens on the server, inside the transaction in §6. The client never sends or sees odds.

- **Tier, per slot.** Each of the three slots rolls its tier independently against the §4.1 weights: Common 70, Uncommon 20, Rare 9, Ultra rare 1. The weights live in one config module (for example `src/lib/pack-config.ts`) along with the shiny rate, since the overview says every parameter is tunable. Later slices add the pity thresholds, dust values and cap to the same module.
- **Pokémon, inside the tier.** Uniformly random among all `Pokemon` rows of that `rarity`. The wishlist boost is slice 04, so for now every Pokémon in a tier has equal weight. Picking reads ids only, not full rows: either all ids grouped by rarity, or a count plus a random offset per tier.
- **Shiny.** An independent 0.5% roll per slot, applied after the tier. It doesn't change the tier.
- **Duplicates within one pack** are allowed: the same Pokémon can appear in two slots.
- **Randomness** comes from a single injectable function, so the checks in §11 can force outcomes. `Math.random` is fine, since nothing is at stake.

The tier is decided first and the Pokémon second, so the rarity distribution matches the weights however many Pokémon each tier holds.

---

## 5. Reveal & already-opened-today

**Card looks (artboard 02, "Card tiers").** Every tier has its own card background, border and label color, regardless of the Pokémon's type:

- Common and Uncommon are added to `RARITY_CARD_COLORS` next to Rare and Ultra rare, **with their colors swapped from the design**: Common takes the design's silver-grey background, border and label color, and Uncommon takes the design's blue ones. The double rim stays on Uncommon (`overview.md` §4).
- Its file comment, which says Common and Uncommon have no look of their own, gets corrected.
- A shiny card replaces the tier look with the gold-mint shiny finish, the shimmer sweep, the pulsing glow and the twinkling ✦ sparkles. It uses `shinyArtworkUrl`, and its label reads "✦ SHINY · {tier}".
- On mobile the card is smaller, the shiny card puts "✦ SHINY" in its top-left corner, and the bottom label shows only the tier.
- The landing page's `PokemonCard` and `PackTease` mini-card share part of this look. Check whether one of them can be generalized before writing a third card. If they differ in more than size and props, make a new component.

**Reveal.**

- A "DAILY PACK" kicker and a "Here's what you got" title.
- Three cards fade and lift into place one after another, roughly 450 ms apart, in slot order. With reduced motion they appear in their final state at once.
- Under each card: "New! added to collection" when this pull caught the Pokémon for the first time, otherwise "Duplicate". There's no dust amount, since dust is manual and comes in slice 05.
- Each card links to `/p/[slug]`.
- Below the cards:
  - a summary line, "N new · M duplicate(s)", with any zero part omitted;
  - a secondary "Replay animation" button, which re-runs the stagger on the client without refetching;
  - "Next pack in Xh Ym".
- The design's "View history" link waits for slice 10.

**Already opened today.**

- A "TODAY'S DAILY PACK" kicker and an "Opened at HH:MM" title, with the time shown in the viewer's local time zone, so it's formatted on the client.
- The same three cards with their New/Duplicate labels, without animation.
- A countdown panel: "Next free pack in" with a large "Xh Ym", plus "resets at midnight UTC" on desktop.

**How "New" is known.** Right after opening, the domain function returns it for each slot. After a reload it's derived: a slot is new when its Pokémon's `firstCaughtAt` equals the pack's `openedAt` (both are written from one timestamp in the transaction) and it's the first slot in that pack with that Pokémon. No new column is needed.

---

## 6. Mutation & data writes

Layering follows overview §6.1:

- **Domain function.** A transport-agnostic function (for example `openDailyPack(userId)` in `src/lib/packs.ts`) holds all the logic.
- **Server action.** A thin action in `src/actions/packs.ts` reads the session, calls the domain function, revalidates `/packs` and returns the `{ success, data, error }` shape. It takes no input, so there's nothing for Zod to validate beyond the session, and it never accepts a user id from the client.

Everything runs in one interactive transaction, in this order:

1. **Claim today's daily pack atomically.** A conditional update on the user sets `lastDailyAt` to now, but only if it's null or before today's 00:00 UTC (skipped under `DEV_UNLOCK_ALL`). If no row was updated, the pack was already claimed from another tab or by a double submit. The function then returns an "already opened today" failure without rolling anything. This is the concurrency guard, because checking first and writing later would race.
2. **Roll** the three slots (§4).
3. **Create the `Pack`** with `type` DAILY, `source` DAILY_FREE and `openedAt` set to step 1's timestamp, along with its three `PackRoll` rows: position 1–3, `pokemonId`, `isShiny`, and `rarity` snapshotted from the roll (overview §14, snapshot pattern). Until slice 06's migration, `openedAt` keeps its current non-null default. Pass it explicitly anyway.
4. **Upsert `UserPokemon`** once per slot:
   - set `isCaught`;
   - increment `count` (all copies, shiny included);
   - also increment `shinyCount` for a shiny (overview §4.4);
   - set `firstCaughtAt` only when the row wasn't already caught.

   A row can already exist from rating, favoriting or wishlisting with `isCaught` false. The overview's §10.3 pseudocode misses that case, because it only sets `firstCaughtAt` on create. Rating, review, favorite and wishlist fields are never touched.
5. **Return** the three slots with what the reveal needs: Pokémon id, slug, name, artwork URL (shiny or regular), tier, shiny flag and new flag.

Pity counters are **not** read or written in this slice, so packs opened before slice 03 don't count toward pity. Feed events are slice 09.

The client calls the action through `runAction` (`src/lib/run-action.ts`), like every other action call site:

- **Transport failure:** the error state (§3).
- **"Already opened today":** a toast and a route refresh, which lands on the already-opened state of the pack opened elsewhere.

---

## 7. Page data (server)

`page.tsx` reads, for the signed-in user:

- `lastDailyAt`, to choose between closed and already-opened (claimed when it's on or after today's 00:00 UTC).
- When claimed, today's most recent `DAILY_FREE` pack: its rolls with each Pokémon's card fields, plus each rolled Pokémon's `firstCaughtAt` for the "New" derivation in §5. This read also lives in `src/lib/packs.ts`.
- The next 00:00 UTC instant for the countdowns.

The page reads Prisma directly, with no API route (overview §6.1). Under `DEV_UNLOCK_ALL` the page always shows the closed state, so packs can be opened repeatedly. In that mode the reveal after each open is the one returned by the action.

---

## 8. Loading skeleton

A `loading.tsx` for the route follows artboard 12 "Loading", trimmed to what this slice renders: the title and subtitle bars, then the stage card with a shimmering pack-shaped block and a button-shaped block. No tabs, shelf or sidebar placeholders yet. Each later slice adds its own block to the skeleton. Reuse the existing shimmer keyframe in `globals.css` if it behaves the same; otherwise add a token next to it.

---

## 9. `DEV_UNLOCK_ALL` and nav

- **`src/lib/dev.ts`**, exactly as overview §10.2 describes: true only when the env var is "true" **and** `NODE_ENV` isn't production. This slice uses it only to bypass the daily reset (§6 step 1, §7). The other bypasses belong to the features that introduce those checks. Add the variable to `.env.example` if one exists, defaulting to "false".
- **Nav.** `SignedInNav`'s "Packs" link goes to `/packs` instead of `/`, with the same active pill the Pokedex link has. It's driven by the same `usePathname()` check in `Nav.tsx` and is active on `/packs` and anything under it. The count badge (02) and the hardcoded "2,450" dust pill (05) are untouched.

---

## 10. Mobile

The same components, made responsive at the `md` breakpoint and following the mobile artboards:

- smaller title;
- stage padding reduced to the screen edge;
- a smaller foil wrapper;
- full-width primary button and full-width "Replay animation";
- the three reveal cards in one row at roughly a third of the width each, with smaller labels (§5);
- the countdown panel stacked and centered.

The bottom tab bar the mobile artboards show is slice 02. Until then `/packs` is reachable on mobile only by URL.

---

## 11. Testing

Manual checks in the browser, plus a few checks on the roll:

- **Roll distribution.** Run the roll many times through a throwaway script. Tier frequencies should land near 70 / 20 / 9 / 1 and shinies near 0.5%. Forcing the random source produces any chosen tier or shiny, which is how each card look is checked visually against the "Card tiers" artboard.
- **First visit today.**
  - The closed state shows, with a countdown to 00:00 UTC.
  - Open shows the opening state, then three cards reveal in sequence.
  - The labels are right: a Pokémon never caught says New, an owned one says Duplicate, and the same Pokémon twice in one pack shows New and then Duplicate.
- **DB after an open.**
  - One `Pack` (DAILY / DAILY_FREE) with three `PackRoll`s whose `rarity` matches each Pokémon's tier.
  - `count` went up for every slot, and `shinyCount` for shinies.
  - `firstCaughtAt` is set for first catches, including a Pokémon the user had only rated, whose rating and review are unchanged.
  - `lastDailyAt` is set.
- **Reload.** The already-opened state shows the same cards and labels, with the local open time and the countdown. "Replay animation" on the reveal re-runs the stagger.
- **Error.** Blocking the action request shows the error state, and "Try again" then succeeds. Nothing was written by the failed attempt.
- **Concurrency.** With the closed state open in two tabs, open in both. One succeeds; the other toasts and lands on the first tab's pack. Only one `Pack` row exists.
- **Reset.** Setting `lastDailyAt` to yesterday brings back the closed state. With `DEV_UNLOCK_ALL=true` the page can be reopened indefinitely; with it off, it can't.
- **Nav.** "Packs" opens `/packs` and shows the active pill only there. A logged-out visit to `/packs` redirects to `/sign-in`.
- **Visual.** Screenshots at 1366px, 1440px and 375px compared against artboards 01 (stage), 02, 03 and 12, with no console errors and reduced motion respected. `npm run build` passes, and lint passes on the changed files (the known `scripts/seed-pokemon.ts` errors aside).

---

## 12. Implementation order

1. `pack-config.ts` (weights, shiny rate) and `dev.ts`.
2. The roll functions (§4), then `openDailyPack` and the today's-pack read in `src/lib/packs.ts` (§6, §7).
3. The server action (§6).
4. `RARITY_CARD_COLORS` additions, the pack card component and the countdown component (§3, §5).
5. `page.tsx` with the stage states and the client stage/reveal wrapper (§2, §3, §5, §7).
6. `loading.tsx` (§8).
7. Nav link and active state (§9).
8. Mobile pass (§10).
