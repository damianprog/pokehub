# Spec — Collection 01 · Profile sub-navigation + page shell

> **Status:** spec / pre-implementation
> **Scope:** the compact profile header and a tab row (Overview, Collection) shared by `/u/[username]` and the new `/u/[username]/collection`. The Collection tab carries the user's real caught count. The new route renders the header and tabs only.
> **Out of scope:** everything below the tabs on the Collection page (progress summary, grid, empty states, skeleton, filters, sort, owner strip). These are slices 02–06 in `overview.md`. The Reviews and Lists tabs are left out until their pages exist (`overview.md` §4).

---

## 1. Goal & scope

The profile is one page today, with nowhere to put a collection. This slice turns it into a set of profile pages that share one header and a tab row, and creates the Collection page as the second tab. It's the smallest step that's useful on its own: a visitor can see how many Pokémon someone has caught and land on the right URL, and the next slice only has to fill the page body.

Source design: `PokeHub-Collection.dc.html`, artboard 00 (sub-navigation on Overview) for both widths, and the header and tab row of artboards 01 and 02 for the owner and visitor variants on the Collection tab.

---

## 2. Route & layout

- A new nested layout for `/u/[username]` holds the profile header (§3) and the tab row (§4), with the page content below. Both `/u/[username]` (Overview) and the new `/u/[username]/collection` render inside it, so the header stays mounted while switching tabs and there's one place that fetches the profile owner.
- The layout looks the user up with the existing `getUserByUsername` (already wrapped in React `cache()`, so the layout, the pages and `generateMetadata` share one query per request) and calls `notFound()` when there's no such user.
- The new page `src/app/(app)/u/[username]/collection/page.tsx` renders nothing below the tabs yet. Its `generateMetadata` gives a title along the lines of "{name}'s collection — PokeHub".
- The Overview page drops its own `ProfileHeader` (now in the layout) and keeps everything below it unchanged: bio and stats, Signature Team, Recent activity and Favorite types.

---

## 3. Compact profile header

The design makes the header smaller and shares it across every profile page, replacing today's taller banner on Overview. Pull exact sizes from artboard 00; in short:

- A shorter banner with the same gradient and crosshatch, a smaller rounded-square avatar overlapping its bottom edge (real `User.image`, else the letter badge as today), the display name, and "@username · joined {Mon YYYY}" below it.
- **Buttons depend on who's looking:**
  - A visitor (anyone who isn't the owner, signed in or not) sees the gradient "Follow" button. It stays inert, as it is today.
  - The owner doesn't see "Follow". Today's header shows it on your own profile, which this slice fixes. The design's "Edit profile" isn't rendered, since `/settings` doesn't exist (`overview.md` §4).
  - The "⋯" button stays, still inert, on desktop only; the mobile artboard has none.
- Not taken from the design: the PRO badge and the location in the handle line (`overview.md` §4).

Owner detection compares the session user id with the profile user's id. Reading the session makes the profile pages dynamic, which they already are through `getUserByUsername`.

On mobile the header follows the mobile artboard: a smaller banner and avatar, name and handle stacked beside the avatar, and the button (if any) on the same row instead of wrapping below.

---

## 4. Tab row

- A horizontal row under the header with a thin bottom border: **Overview** and **Collection**. The active tab is brighter with a short brand-gradient underline; inactive tabs are muted.
- **Collection** shows the user's caught count in a small pill after the label, styled per the design (green-tinted on the active tab, neutral otherwise; on mobile the count is plain text). Overview has no count.
- Links: Overview → `/u/[username]`, Collection → `/u/[username]/collection`. Normal `next/link` navigation.
- **Active state** comes from the current route segment. Since the row lives in the layout, it needs a small client component reading the selected layout segment (no segment = Overview, `collection` = Collection). Everything else in the layout stays a server component; the client component receives the username and count as props.
- Reviews and Lists tabs are added later, each with its own page. The row should be built so adding one is a single entry.

---

## 5. Data

**Caught count.** A new `src/lib/collection.ts`, the home for the collection feature's reads in later slices too, gets a count of the user's `UserPokemon` rows with `isCaught` true. It's read in the layout alongside the user and formatted with thousands separators. It's public data: the same number shows to the owner and every visitor.

No schema change, no server action and no API route, like every other read-only page (project-overview §6.1).

---

## 6. Deliberate non-goals (this slice)

- Anything below the tabs on the Collection page is slice 02 onward. The page shouldn't show a placeholder message either; slice 02 follows directly.
- Reviews and Lists tabs, and making the Overview's "Reviews" and "Lists" stats real.
- "Edit profile", the PRO badge and a location field.
- Wiring "Follow" or "⋯".
- Changing the Favorite types card's caught number (still placeholder). It can switch to the new count when slice 02 lands, since that slice reads the same data.

---

## 7. Implementation order

1. `src/lib/collection.ts` with the caught count (§5).
2. The profile layout: user lookup and `notFound()`, owner check, header, tab row (§2, §3, §4).
3. Rework `ProfileHeader` into the compact header with the owner/visitor button rules (§3), and the tab-row client component (§4).
4. Remove the header from the Overview page; add the Collection page with its metadata (§2).

---

## 8. Testing

Manual, in the browser:

- `/u/[username]` shows the compact header, the tab row with Overview active, and the same Overview content as before.
- Clicking Collection goes to `/u/[username]/collection` with Collection active, and the header doesn't flash or reload. Back returns to Overview.
- The Collection count matches a direct database count of the user's caught rows. Check a user with caught Pokémon and one with none (shows 0).
- On your own profile there's no "Follow"; on someone else's profile, and logged out, "Follow" is there.
- `/u/does-not-exist` and `/u/does-not-exist/collection` both 404.
- Screenshots at 375px, ~1366px and 1440px compared against artboard 00 and the headers of 01 and 02.
- No console errors. `npm run build` and `lint` pass (apart from the known `scripts/seed-pokemon.ts` lint errors).
