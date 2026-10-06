# Spec — Pokédex 06 · Personal layer (signed in)

> **Status:** spec / pre-implementation
> **Scope:** for signed-in visitors, each Pokédex card shows the viewer's own relationship to that Pokémon: a "You rated" line, favorite and wishlist indicators, and on desktop hover-revealed buttons that toggle favorite and wishlist without leaving the page. A "My status" menu in the Refine row filters the grid by that relationship, driven by a `status` URL param.
> **Out of scope:** the mobile filters sheet (slice 07, which will carry "My status" too), rating from the card, any change for logged-out visitors, and the `/settings/wishlist` page.

---

## 1. Goal & scope

The Pokédex is the place to scan the whole catalogue. Once you're signed in, the most useful thing it can tell you is where you stand on each Pokémon: have you rated it, is it a favorite, is it on your wishlist. The detail page already lets you change all three. This slice surfaces them in the grid and makes the two one-click flags toggleable right there.

It's also the first time the Pokédex reads per-viewer data, so the page stops being identical for everyone.

Source design: `PokeHub-Pokedex.dc.html`, the "desktop signed in" artboard (cards, hover state, Refine row) and the mobile artboard (indicators only, per its note).

---

## 2. Who sees what

| Viewer | Card personal layer | Hover toggles | "My status" menu |
|---|---|---|---|
| Logged out | None, as today | None | Hidden. A `status` param in the URL is ignored and gets no chip. |
| Signed in, desktop | "You rated" line plus indicators for the flags that are on | Heart and bookmark appear on hover | Shown after Rarity |
| Signed in, mobile | "You rated" line plus indicators for the flags that are on | None. Tapping a card opens the Pokémon page, per the design note | Arrives with slice 07's sheet. A `status` from a shared link shows as a removable chip, as other filters do today. |

---

## 3. Reading the viewer's data

- **One batched read** for the visible cards: the viewer's `UserPokemon` rows for the page's Pokémon ids, giving rating, favorite and wishlist per Pokémon. It sits next to the existing `getRatingSummaries` call, not one query per card. Pokémon without a row have nothing set.
- **The wishlist count** (how many Pokémon the viewer has wishlisted in total) is read once per page, so the cards know when the wishlist is full. `getUserWishlistCount` already exists.
- Logged-out visitors skip both reads.

---

## 4. The card

**"You rated" line.** When the viewer has a rating for this Pokémon, a line appears under the community rating, separated by a thin divider. It has a small green dot, "You rated", and the viewer's rating as stars in half-star steps (for example "★ 4.5"). It's in the brand green from the design, and its value comes from `src/lib/rating.ts` like every other rating display. A cleared rating shows no line, even if the review text still exists.

**Indicators.** In the top-right corner of the artwork:
- a pink heart when the Pokémon is a favorite,
- a filled gold bookmark when it's wishlisted.

Only flags that are on are shown. The colors match the detail page's buttons (`FavoriteButton`, `WishlistButton`).

**Desktop hover toggles.** Hovering a card shows both buttons in that corner. A flag that's off shows its outline state: the muted heart and the outline bookmark. Clicking one toggles that flag and doesn't open the Pokémon page. Keyboard users get the same buttons. They stay reachable by Tab even when the card isn't hovered, so the controls never exist only for the mouse.

**Card structure.** Today the whole card is one link. Buttons can't sit inside a link (it's invalid HTML, and the click would also navigate), so the card becomes a container holding the link and, as a sibling, the button pair positioned over the artwork. The card's look and hover lift stay exactly as they are.

---

## 5. Toggling from the card

- **Same server actions as the detail page:** `setFavorite` and `setWishlist`, with their existing auth check, Zod validation and capacity rule. No new mutation path.
- **Optimistic:** the indicator flips immediately. On failure it flips back and a toast explains why, through `runAction` like every other call site.
- **Wishlist at capacity** (3 Pokémon). Adding a fourth isn't allowed, the same as on the detail page. On the card, the bookmark shows the detail page's muted "at capacity" look when the wishlist is full and the Pokémon isn't on it. Clicking it shows a toast saying the wishlist is full (3 of 3) instead of writing. The detail page's inline capacity panel isn't reused here, because there's no room for it on a card. Removing a Pokémon from the wishlist frees a slot for every card on the page at once, since they share the wishlist count.
- **Revalidation:** both actions also revalidate `/pokedex`, so coming back to the grid after a change elsewhere doesn't show stale flags. Toggling on the grid also updates the detail page, through the actions' existing revalidation.
- **"My status" interplay:** when the grid is filtered to Favorites or Wishlist, un-flagging a card removes it right away, and "Showing N of" updates. The `/pokedex` revalidation refreshes the current page too. Decided during implementation: an earlier draft kept the card until the next navigation, but that would have meant dropping the revalidation and risking a stale grid after Back from the detail page. A list that always matches the filter and its count is preferred.

---

## 6. The "My status" filter

**URL.** The param is `status`, with the values `rated`, `not-rated`, `favorites` and `wishlist`. Anything else means "any status". Like the other filters:
- it's parsed in `pokedex-filters.ts`;
- the key → label list lives there once;
- `pokedexHref` writes it only when it's set;
- every control carries it forward;
- a change drops `count`.

**Matching.** It joins `pokedexWhere` as one more AND condition, scoped to the viewer:

| Option | Matches Pokémon where the viewer… |
|---|---|
| Rated | has a `UserPokemon` row with a rating |
| Not rated | has no row with a rating (no row at all counts) |
| Favorites | has a row with favorite on |
| Wishlist | has a row with wishlist on |

`pokedexWhere` therefore needs the viewer's id. Without a viewer the condition is skipped entirely, which is what makes a logged-out `status` param harmless.

**Menu.** It's the shared `PokedexRefineMenu`, labeled "My status", placed after Rarity, with these options:
- Any status,
- Rated,
- Not rated,
- Favorites,
- Wishlist.

No sub-lines. It tints when a status is selected, like Generation and Rarity.

**It counts as a filter.** It adds a chip (labeled with the option, neutral color, after rarity and before the search term). It turns on "Showing N of 1,025". "Clear all" clears it, and the no-results card uses the filter wording. So `hasPokedexFilters` includes it. It combines with every other filter and with every sort, rating sorts included.

---

## 7. Loading skeleton

The skeleton keeps its current layout. For a signed-in visitor, the Refine row also shows a disabled "My status" menu, so the row doesn't shift when the page arrives. That means `loading.tsx` reads the session. The session comes from the cookie and doesn't touch the database, so the skeleton stays instant. Skeleton cards don't show a personal layer.

---

## 8. Deliberate non-goals (this slice)

- **Rating from the card.** Rating needs the star control and its states. The card links to the detail page for that.
- **Mobile toggles,** per the design note. Mobile shows indicators only.
- **Counts per status option** ("Favorites · 12").
- **A capacity panel or a link to `/settings/wishlist`** from the card.
- **A "Reviewed" status** (written text, as opposed to a rating). It isn't in the design.

---

## 9. Implementation order

1. The batched personal read and the wishlist count, signed in only (§3).
2. The "You rated" line and indicators on the card (§4).
3. Card restructure into link plus sibling buttons, the desktop hover toggles, the optimistic toggling and the shared wishlist count (§4, §5).
4. `/pokedex` revalidation in `setFavorite` and `setWishlist` (§5).
5. `status` parsing, the viewer-scoped condition in `pokedexWhere`, and status in `hasPokedexFilters` (§6).
6. The "My status" menu and chip (§6).
7. The skeleton's disabled menu (§7).

---

## 10. Testing

Manual, in the browser, signed in and logged out, plus direct-URL edge cases:

- **Logged out:** cards look exactly as before, there's no "My status" menu, and `?status=favorites` shows the full list with no chip.
- **Signed in, existing data:** the "You rated" values match the user's ratings on the detail pages, including a half-star rating. Indicators match the favorite and wishlist flags.
- **Hover toggles:** favorite on and off from the card persists across reload and matches the detail page. The same goes for wishlist. A click on a toggle doesn't open the Pokémon page. Tab reaches both buttons.
- **Capacity:** with 3 wishlisted, the other cards' bookmarks show the at-capacity look, and clicking one shows the toast without writing. Removing one re-enables the rest immediately.
- **Failure:** with the action request blocked, the indicator reverts and a toast appears.
- **"My status":** each option's results match the database. "Not rated" includes Pokémon the user has never touched. Status combines with types, rarity, search and the rating sorts. The chip and "Clear all" work, and "Showing N of" is correct.
- **Filter interplay:** un-favoriting under Favorites removes the card at once and updates the count.
- **Bogus values** (`status=fav`, `status=RATED`, empty) behave as no status filter.
- **Mobile at 375px:** indicators and "You rated" show, there are no toggles, a tap opens the detail page, and a `?status=wishlist` link shows a removable chip.
- Screenshots at ~1366px and 1440px against the signed-in artboard, including the hover state, with no console errors. `npm run build` and `lint` pass, apart from the known `scripts/seed-pokemon.ts` errors and `src/auth.ts` warning.
