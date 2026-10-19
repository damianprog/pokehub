# Collection — Feature Overview

> **Status:** planning
> **Route:** `/u/[username]/collection`. Public: anyone, signed in or not, can view anyone's collection.
> **Mechanics source:** `project-overview_8.md` §3 (collection axis), §4.4 (copies, shiny copies, extras) and §5.3 (`UserPokemon`: `isCaught`, `count`, `shinyCount`, `firstCaughtAt`).
> **Design source:** `PokeHub-Collection.dc.html` in the Claude Design project. It's a canvas of 9 artboards (00–08), each at desktop 1440 and mobile 375.

---

## 1. What it is

The page where the collection axis becomes visible: every Pokémon in the National Pokédex, caught ones as tier-styled cards and missing ones as silhouettes, with a progress summary on top. It reads only what packs already write (`UserPokemon` rows with `isCaught`), so it needs no schema change. Like the rest of the collection axis it's cosmetic: nothing on the opinion axis depends on it.

---

## 2. Page anatomy (from the design)

- **Profile header + sub-navigation:** a compact profile header shared by every profile page, followed by tabs: Overview, Collection, Reviews, Lists. Collection, Reviews and Lists show a count next to the label. On Overview (artboard 00) the existing bio, stats and sections follow the tabs.
- **Progress summary:** caught X / 1,025 with a bar and percentage, the number of shinies, and a per-tier breakdown (caught / total for Common, Uncommon, Rare, Ultra rare) drawn in each tier's look.
- **Owner strip** (owner only, under the summary): "Your daily pack is ready" with an "Open today's pack" button when today's pack hasn't been opened, and "N extra copies · Manage duplicates →".
- **Controls:** search by name or dex number; a Show segment (Caught / Missing / All, each with a count, default All); type chips; Generation and Rarity menus (Rarity lists caught / total per tier); a "Shiny only" switch; a sort menu; active-filter chips with "Clear all"; "Showing N of M". On mobile the filters move into a bottom sheet like the Pokédex sheet.
- **Grid** in dex order by default, 24 cards per page with "Load more":
  - **Caught card:** artwork, dex number, name, tier label, first-caught date, "×N" when there's more than one copy, and a ✦ shiny count when there's at least one shiny copy. A Pokémon with any shiny copy uses the shiny finish and shiny artwork.
  - **Missing card:** dark silhouette, dex number, name and "Not caught". Still links to the detail page.
- **States:** no results (with "Clear filters"), empty collection for the owner (an explainer leading to `/packs`), empty collection for a visitor (leading to `/pokedex`), and a loading skeleton where the header and controls render at once and the summary and grid shimmer.

---

## 3. Slice plan

Built one slice at a time, with one spec per slice written after the previous one ships. The order can change as slices land.

| # | Slice | Design artboards | Summary |
|---|---|---|---|
| 01 | Profile sub-navigation + page shell | 00 | The shared compact header and tabs on both `/u/[username]` and the new `/u/[username]/collection`, which renders the header and tabs only. Collection count is real |
| 02 | Summary + grid | 01, 02, 04, 05, 07 | Progress summary with real per-tier totals, the caught and missing cards in dex order with "Load more", both empty states and the `loading.tsx` skeleton |
| 03 | Show segment, Shiny only, search | 03, 06 | Caught / Missing / All with counts, the Shiny only switch, search, active chips, "Showing N of M" and the no-results state, all as URL params like the Pokédex |
| 04 | Type, Generation, Rarity, sort | 08 (desktop) | Reusing the Pokédex filter pieces where they fit; Rarity shows caught / total per tier. Sorts: Dex number, Recently caught, Most copies, Name |
| 05 | Mobile filters sheet | 08 (mobile) | The bottom sheet with Show and Shiny only on top, then Type, Generation and Rarity |
| 06 | Owner strip | 01, 03 | "Open today's pack" when the daily pack is ready. The duplicates half waits for `/packs/duplicates` (Packs slice 05) |

---

## 4. Design review

**Real data wins over the design's sample numbers.** Tier totals (the design's 742 / 189 / 72 / 22), the 1,025 total and every count come from the database. The profile header's stats stay whatever the Overview page shows at the time.

**Not followed:**

- **The nav search bar.** It was removed on 2026-10-01; real search lives on `/pokedex`.
- **The PRO badge and the location line ("Kanto · joined …").** Pro doesn't exist and `User` has no location. The line shows the joined date only, as the profile does today.
- **"Edit profile".** There's no `/settings` page yet, so the owner gets no button there until it exists.
- **The mobile bottom tab bar.** That's Packs slice 02, not this feature.

**Decisions (confirmed 2026-10-19):**

- **Reviews and Lists tabs.** Neither `/u/[username]/reviews` nor `/u/[username]/lists` exists, so only the tabs whose page exists are rendered (Overview and Collection for now). Each tab is added when its page ships.
- **Duplicates in the owner strip.** `/packs/duplicates` doesn't exist yet, so the duplicates half is left out until Packs slice 05. When it lands, "extra copies" follows §4.4: regular extras (regular copies − 1) only, since shiny extras are opt-in.
- **Empty-collection copy.** The owner explainer says you "earn more by reviewing and keeping your streak", but earned packs and streaks aren't built. It mentions only the free daily pack until Packs slices 06 and 08 ship.
- **Sort options.** The design only shows Dex number and Recently caught (the menu isn't drawn open). We also offer Most copies (by `count`, missing Pokémon last) and Name.
