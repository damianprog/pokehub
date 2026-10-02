# Spec — Pokédex 04 · Rarity filter

> **Status:** spec / pre-implementation
> **Scope:** a Rarity menu in the filter panel's "Refine" row, next to Generation, driven by a `rarity` URL param. It plugs into everything slice 03 built: the shared where-builder, the active-filters row, "Clear all", the "Showing N of 1,025" count and the filter-aware no-results state.
> **Out of scope:** the Sort menu (slice 05), "My status" and the personal card layer (slice 06), the mobile filters sheet (slice 07), and rarity badges or borders on the cards themselves (the design doesn't show any).

---

## 1. Goal & scope

Rarity is PokeHub's own classification, the same four tiers the pack system rolls against (project-overview §4.1), and it already lives on every `Pokemon` row. Filtering by it answers "show me all the legendaries" or "which Pokémon count as uncommon?", and it previews the tiers before packs exist.

Slice 03 built the filter machinery and left the Refine row ready for more menus, so this slice is small: one more param, one more condition and one more menu.

Source design: `PokeHub-Pokedex.dc.html` (revision of 2026-09-25), the desktop artboards' Refine row and its Rarity menu. Tier mapping per `overview.md` §3.

---

## 2. URL state

- **`rarity`:** a single lowercase, hyphenated tier key: `common`, `uncommon`, `rare` or `ultra-rare`. Anything else means "all rarities". One value only, since the design's menu is single-select like Generation.
- **Parsing** lives in `src/lib/pokedex-filters.ts` with the other Pokédex params, and `PokedexFilters` gains a rarity field (`null` for all).
- **Links** follow the same rules as `type` and `gen`. `pokedexHref` writes the param only when set, any rarity change drops `count`, and "Load more", the type chips, the Generation menu and the search input all carry it forward. The search input already keeps unknown params, so it needs no change.

The URL key maps to the Prisma `Rarity` enum value (`ultra-rare` → `ULTRA_RARE`) in one place, not at each call site.

---

## 3. Matching

`Pokemon.rarity` equals the selected tier. The condition joins `pokedexWhere` as one more AND element, next to search, types and generation. `rarity` is already indexed.

Rarity is a filter, not a sort: results stay in dex order.

---

## 4. The Rarity menu

**Placement.** In the Refine row, directly after Generation.

**Trigger.** It looks and behaves exactly like the Generation trigger: muted "Rarity" label, the current value ("All", "Common", "Uncommon", "Rare" or "Ultra rare"), a caret, and the same tinted active look when a tier is selected.

**Options**, in this order, with the design's muted sub-lines:

| Option | Sub-line |
|---|---|
| All rarities | — |
| Common | — |
| Uncommon | Final-stage starters, pseudo-legendaries, fan favorites |
| Rare | Legendary |
| Ultra rare | Mythical |

The current choice gets the check mark, and picking an option applies it, closes the menu and pushes a history entry. While the new results load, the grid dims the same way as for Generation.

**One shared menu component.** Generation and Rarity are the same dropdown with different labels and options, and Sort (slice 05) and My status (slice 06) will be too. Rather than copying `PokedexGenerationMenu`, generalize it into one Refine-menu component that takes a label, the options (value, label, optional sub-line), the current value and the URL for each option. Generation and Rarity both use it. The disabled skeleton mode carries over.

**About the Uncommon sub-line.** The curated list in `scripts/seed-pokemon.ts` contains starter *final evolutions* only, so the design's "Starters" overpromises: Bulbasaur and Charmander are Common. Decided at review: the sub-line says "Final-stage starters" instead. It's a copy change, not a data change.

---

## 5. Active-filters row & count

A selected rarity adds one chip labeled with the tier ("Ultra rare"), in the neutral chip color like the generation chip. Its ✕ removes only the rarity. Chip order follows the design: types, generation, rarity, then the search term.

The rarity counts as a filter everywhere slice 03 checks for one. "Showing N of 1,025" switches on, "Clear all" clears it, and the no-results card uses the filter wording ("No Pokémon match these filters"). In practice that means `hasPokedexFilters` includes rarity, which also makes the page run the match count only when needed, as it does now.

---

## 6. Mobile & loading skeleton

- **Mobile:** unchanged from slice 03. The panel stays hidden until slice 07's sheet, and a rarity from a shared link shows as a removable chip in the scrollable row.
- **Skeleton:** the inert panel renders both menus disabled, so the Refine row has its final width while loading.

---

## 7. Deliberate non-goals (this slice)

- **Multi-select rarity** ("Rare or Ultra rare"). The design is single-select. Revisit only if it's asked for.
- **Rarity on cards,** such as a tier badge, colored border or shimmer. Not in the Pokédex design. Packs are where rarity gets its visual treatment.
- **Per-option counts** ("Rare · 66").
- **Changing which Pokémon are Uncommon.** The curated list belongs to the seed script and the pack system, not to this slice.

---

## 8. Implementation order

1. `rarity` parsing, the `PokedexFilters` field, `pokedexHref` support and the key ↔ enum mapping in `pokedex-filters.ts` (§2).
2. The rarity condition in `pokedexWhere`, plus rarity in `hasPokedexFilters` (§3, §5).
3. Generalize the Generation menu into the shared Refine menu, then add the Rarity menu next to it (§4).
4. The rarity chip in the active-filters row (§5).
5. The loading skeleton's second disabled menu (§6).

---

## 9. Testing

Manual, in the browser, plus direct-URL edge cases:

- Picking "Rare" shows only legendaries in dex order (Articuno, Zapdos, Moltres, Mewtwo, …). "Ultra rare" shows only mythicals (Mew, Celebi, …). "Uncommon" shows the curated set (Venusaur, Charizard, Blastoise, Dragonite, …), and "Common" shows everything else.
- The four tiers' counts add up to the full total.
- The trigger shows the tier and its active look, the chip appears, and "Showing N of 1,025" matches the grid. Removing the chip or picking "All rarities" undoes it.
- Rarity combines with types, generation and search (for example, Rare + Psychic + Gen 1 shows Mewtwo), and every other control keeps `rarity` in the URL. "Load more" keeps it too.
- Each rarity change adds one history entry, Back restores the previous state, and the scroll position stays put.
- A combination with no matches shows the filter no-results card, and "Clear all" resets everything.
- Bogus values (`rarity=epic`, `rarity=ULTRA_RARE`, empty) behave as no rarity filter.
- Generation still behaves exactly as in slice 03 after the menu refactor.
- At 375px a `?rarity=rare` link shows the chip and can be cleared, and the panel stays hidden.
- Screenshots at ~1366px and 1440px compared against the design's Refine row, signed in and logged out, with no console errors. `npm run build` and `lint` pass (apart from the known `scripts/seed-pokemon.ts` lint errors).
