# Packs — Feature Overview

> **Status:** planning
> **Routes:** `/packs` (Open packs), `/packs/duplicates`, `/packs/history`. Signed in only: `proxy.ts` already redirects logged-out visits to `/sign-in`.
> **Mechanics source:** `project-overview_8.md` §4 (pack mechanics), §10.3 (open flow) and §14. Filled in on 2026-10-08 with: the daily reset at 00:00 UTC, earned packs as unopened `Pack` rows, `User.dust` as a cached balance kept in sync with the ledger, the exact pity rule, the dissolve rule (always keep one regular and one shiny copy) and what counts as a streak day.
> **Design source:** `PokeHub-Packs.dc.html` in the Claude Design project. It's a canvas of 17 artboards, each at desktop 1440 and mobile 375, numbered 01–12 to match the request sent to Claude Design. The old Packs screen inside `PokeHub.dc.html` is superseded.

---

## 1. What it is

This is the collection axis from `project-overview_8.md` §3: a free daily pack of three Pokémon, rolled by rarity tier, that fills a per-user collection. Around it sit the loops for pity, dust and duplicates, earned packs, the shop and streaks. None of it gates anything on the opinion axis.

---

## 2. Page anatomy (from the design)

- **Header:** a "Packs" title with a one-line subtitle, and a dust pill on the right.
- **Tabs:** Open packs, Duplicates (with a count), and History. Each tab is its own route (`/packs`, `/packs/duplicates`, `/packs/history`). On mobile the tabs become a three-way segmented control.
- **Open packs tab:**
  - A large **stage** card that shows the selected pack in one of several states: closed, opening, error, reveal, already opened today, or streak-bonus earned.
  - Under the stage, a **"Your packs" shelf**. The daily pack always takes the first slot, and earned packs follow, each labeled with its source. The shelf also has an "Earned today N / 5" indicator.
- **Sidebar** (on desktop; stacked on mobile): Streak, Pity tracker and Dust shop cards.
- **App-wide pieces:**
  - a Packs count badge in the nav;
  - a toast when you earn a pack on another page;
  - on mobile, a bottom tab bar (Feed, Pokedex, Packs, Profile), with the top bar keeping the logo and the dust pill.

---

## 3. Slice plan

Built one slice at a time, with one spec per slice. Each spec gets written only after the previous slice has shipped. The order below is the current plan and can change as slices land.

| # | Slice | Design artboards | Summary |
|---|---|---|---|
| 01 | Daily pack open + reveal | 01 (stage only), 02, 02 tiers, 03, 12 | `/packs` with the stage in four states: closed, opening, error, reveal and already-opened-today. Also the roll engine (tier weights, uniform pick in the tier, 0.5% shiny), the transactional writes, the four tier card looks plus shiny, the loading skeleton, the Packs nav link and the `DEV_UNLOCK_ALL` daily bypass |
| 02 | Mobile tab bar | 11 | Bottom tab bar on every signed-in mobile screen, plus a Packs badge (a ready daily pack for now) on both navs |
| 03 | Pity | sidebar | Rare (20) and Ultra rare (50) counters wired into the roll per §4.3, plus the Pity tracker card. The sidebar appears with this slice |
| 04 | Wishlist boost | — | ×1.5 weight for the user's wishlisted Pokémon inside their tier (§4.5) |
| 05 | Dust + duplicates | 06, 07 | Tabs appear. `/packs/duplicates` list, confirm dialog with opt-in shiny extras, dissolve with ledger rows (§4.4), the "+N" float and banner, and real dust pills in the header and nav |
| 06 | Earned packs + review source | 01 shelf, 04, 05, 09 | Migration (`openedAt` nullable, `grantedAt`). The "Your packs" shelf where selecting a pack puts it on the stage. Opening earned packs, the 5/day cap and its indicator and notice, `ACTIVITY_REVIEW` as the first source, the toast on other pages, and the badge counting waiting packs |
| 07 | Dust shop | 07 shop, 05 shop | The Extra pack item (100 dust, into the inventory, counts toward the cap), with its can't-afford and limit-reached states |
| 08 | Streaks | 08, sidebar | Streak counting by UTC day, the Streak card, the mobile streak chip, and the `STREAK_BONUS` pack at every multiple of 7 with the "Open now / Save for later" stage |
| 09 | Rare-pull feed events | — | `FeedEvent` rows for Rare, Ultra rare and Shiny pulls (§4.6), ready for the future feed |
| 10 | Pack history | 10 | `/packs/history`: newest first, 10 per page with Load more, empty state, and the "View history" link on the reveal |

`ACTIVITY_LIST` and `ACTIVITY_LIKES_RECEIVED` aren't in the plan. They come with the lists and likes features (overview §4.2).

---

## 4. Design review

**The overview wins on every number and mechanic.** The design's values are placeholders and are ignored:

| Design shows | We use (overview) |
|---|---|
| Rare pity 10, Ultra rare pity 30 | 20 and 50 (§4.3) |
| Dust per dissolve by tier (5 / 15 / 40 / 100) and 5× for shiny | Flat 10 per regular copy, 100 per shiny copy (§4.4) |
| Extra pack ◆120 | 100 dust (§4.2) |
| "+15 ◆" in the float, banner and dialog examples | Whatever the dissolve actually gives |

**Taken from the design, including mechanics that agree with the overview:**

- Dissolving keeps one regular and one shiny copy, and shiny extras are opt-in. This is now overview §4.4.
- A streak day is a day you open your daily pack. This is now overview §4.2.
- A failed open doesn't use up the pack. That's true by construction, since the open is a single transaction.
- Up to 5 earned packs a day across review, streak and dust packs. Packs you've already earned can still be opened once the limit is reached.
- The earned-pack toast hides after 8 seconds, and the nav badge keeps the count.

**Tier looks.** Common and Uncommon now have looks of their own, no longer the type gradient. Both get added next to Rare and Ultra rare in `RARITY_CARD_COLORS`. **Their colors are swapped from the design (Damian, 2026-10-08):** Common uses the design's silver-grey colors and Uncommon uses the design's blue. The double rim stays on Uncommon, so it still reads as a step above Common. A shiny card always uses the gold-mint shiny finish and keeps its tier on the label.

**Not followed:**

- **The mobile top bar's search icon.** The fake nav search was removed on 2026-10-01, and real search lives on `/pokedex`. The mobile top bar is just the logo and the dust pill.
- **"resets at midnight".** The reset is 00:00 UTC, which isn't midnight for most users, so the copy says "midnight UTC". The countdowns are what users actually rely on.

**Still open, outside this feature:** the landing page promises "1-in-4,096" shinies (`Hero`, `Features`, `PackTease`), which contradicts the overview's 0.5%. That's a separate small fix.
