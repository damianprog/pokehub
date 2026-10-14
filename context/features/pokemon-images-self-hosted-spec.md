# Spec: Self-hosted Pokémon images

> **Status:** spec / pre-implementation
> **Scope:** a re-runnable import script that downloads every Pokémon image the app uses from the
> PokeAPI sprites repo on GitHub, converts the artwork to WebP and commits the files under
> `public/`; pointing the `Pokemon` image columns at those local paths; one helper in `src/lib/`
> that replaces every hardcoded GitHub image URL in components; `next.config.ts` image hosts; the
> matching updates to `project-overview_8.md`.
> **Out of scope:** user avatars and `/api/avatar`, external object storage (R2 was considered and
> rejected, see §3), `next/image` optimizer settings, re-seeding Pokémon data, and any visual
> change.

---

## 1. Problem

The Pokémon data lives in our database, but none of the images do. Today:

- The seed script (`scripts/seed-pokemon.ts`) doesn't download any files. It builds three URLs per
  species from the dex number, all under `raw.githubusercontent.com/PokeAPI/sprites/master/...`,
  and stores them in `Pokemon.artworkUrl`, `Pokemon.shinyArtworkUrl` and `Pokemon.spriteUrl`.
- Pages render those URLs through `next/image`, and `next.config.ts` allows that GitHub path in
  `remotePatterns`.
- About a dozen components skip the database and hardcode the same GitHub base URL with a fixed dex
  number: the landing sections (`Hero`, `Marquee`, `Trending`, `PackTease`, `Testimonials`), the
  four auth surfaces (`LoginView`, `SignupView`, `SignInForm`, `RegisterForm`), the packs
  components (`PackWrapper`, `PackErrorNotice`, `PackTodayView`), `PokedexEmptyState` and
  `AppearsInLists`.

So every Pokémon image in the app depends on a third-party repository we don't control. If its path
layout changes, it's moved or deleted, or GitHub starts rate-limiting `raw.githubusercontent.com`
for our traffic, the app loses every image at once. The `next/image` cache only delays that,
because it's not durable: a deploy, an expired entry or a new requested size goes back to the
source.

---

## 2. Goal

After this change, every Pokémon image ships with the app itself, and no runtime request for one
leaves our deployment. GitHub is only read by the import script, when we choose to run it. If the
sprites repo disappeared tomorrow, the app would keep working, and only adding new species would
need another source.

---

## 3. Why the repo, not R2

R2 was the first plan. It was dropped because it needs a payment card and has no hard spending cap,
so a flood of reads against the public bucket could, at least in principle, cost money. Vercel's
Hobby plan never bills: it stops serving once limits are reached. Files in `public/` are served
from Vercel's CDN with no extra account, credentials or env vars, and they live as long as the
repo does.

That only works because the set is small once converted. Measured on a sample of 41 species spread
across the whole dex (1, 27, 52 … 1025):

| Image | Source PNG (avg) | WebP q80 (avg) | All 1,025 species |
|---|---|---|---|
| Official artwork, 475×475 | ~127 KB | ~19 KB | ~19 MB |
| Shiny official artwork, 475×475 | ~134 KB | ~21 KB | ~21 MB |
| Sprite, 96×96 | ~0.9 KB | ~1.5 KB (larger) | ~1 MB as PNG |

In total that's about 41 MB, against about 260 MB of raw PNGs. In a 2× zoomed side-by-side, WebP q80
couldn't be told apart from the source. Every sampled species had a shiny artwork. If R2 is
needed later (real traffic, many more images), the same key layout moves there with only a base
URL change.

---

## 4. File layout and format

- **Everything lives under one `public/pokemon/` folder**, with one subfolder per image kind
  (artwork, shiny artwork, sprite). Files are named by dex number, so the layout is obvious from
  the path alone.
- **Artwork and shiny artwork are converted to WebP at quality 80**, at their original 475×475
  size, with alpha kept. No resizing: the largest place they render (the detail page artwork card)
  needs the full size.
- **Sprites stay PNG**, copied as-is. They're 96×96 pixel art, already smaller as PNG than as WebP,
  and lossy compression would blur the pixels.
- **The URLs stored in the database are root-relative paths** (e.g. the artwork path for a dex
  number), not absolute URLs. `next/image` treats them as local files, so they work the same on
  localhost, preview and production deploys.

---

## 5. Import script

A standalone script next to the seed script, run by hand like the seed and exposed as an npm
script. Two phases, which can be run separately (see §8):

**Files phase:**

1. For every `Pokemon` row, it derives the three GitHub source URLs from the dex number. It does
   this the same way the seed does, not by reading the URLs back from the row, because after the
   first run those are local paths.
2. It downloads with bounded concurrency and retries, using the same polite-parallelism and
   retry/backoff approach the seed script already uses against PokeAPI. It converts the artwork and
   writes the files into `public/pokemon/`.
3. It's idempotent. A file that already exists on disk is skipped, so a run that failed halfway
   just runs again. A force flag redownloads and reconverts everything.
4. It handles missing sources honestly. If the source for a shiny artwork returns 404, no file is
   written. A missing regular artwork or sprite is an error that gets reported.

**Database phase:**

5. It rewrites each row's three columns to the local paths, but only for files that actually exist
   on disk. A row never points at a missing file. For a species with no shiny file,
   `shinyArtworkUrl` is set to null, and the app already falls back to `artworkUrl` in that case.
6. It prints a summary: written, skipped as already present, missing shiny, failed, rows updated.

The seed script keeps writing GitHub URLs for rows it creates. For new species the documented order
becomes: seed, then import, then commit the new files. This keeps the seed as a pure PokeAPI import.
A seed run on its own never breaks existing images. It only adds new rows that point at GitHub
until the import runs.

`sharp` is added as an explicit dev dependency for the conversion. Only the script needs it, and
it's the same library Next.js uses for image optimization.

---

## 6. Hardcoded URLs in components

All the components listed in §1 stop building GitHub URLs themselves. One helper module in
`src/lib/` owns the folder layout and turns "dex number, kind (artwork / shiny artwork / sprite)"
into a path. The decorative Pokémon on the landing, auth, empty and pack states call that helper,
and no component contains an image host anymore.

The import script uses the same helper for the paths it writes to disk and to the database, so the
two can't drift apart.

---

## 7. Next.js image config

The PokeAPI GitHub entry is removed from `remotePatterns`, since local files don't need one. The
GitHub avatars entry (`avatars.githubusercontent.com`, OAuth profile pictures) stays: it's a
different concern. After this change, a leftover GitHub sprite URL anywhere fails loudly in
`next/image` instead of quietly keeping the dependency alive.

---

## 8. Rollout order

The files reach production with a deploy, but the database rows are rewritten by a script. So if
the GitHub entry left `remotePatterns` in the same deploy, there would be a window where one side
doesn't match the other. The rollout goes in two steps:

1. **Locally:** run both phases against the dev database branch, check the summary, and commit the
   files together with the helper and component changes. `remotePatterns` still allows GitHub in
   this commit, so rows that haven't been rewritten yet keep working.
2. **After that deploy is live:** run the database phase against production.
3. **Last:** remove the GitHub entry from `remotePatterns` in a follow-up commit, once no
   environment has GitHub URLs left.

Both commits belong to this feature. The second is a one-line change.

---

## 9. Documentation updates (`project-overview_8.md`)

This reverses a recorded decision, so the overview changes with it:

- **§5.2 architecture diagram:** Pokémon images are served by the app itself, and only the import
  script reads GitHub sprites.
- **§7 tech stack:** the external row notes that PokeAPI sprites are imported once, not hotlinked.
  The file storage row drops the GitHub sprites note. Where avatars are stored is not decided here,
  and the avatar feature will choose its own storage (R2 or a no-card option like Vercel Blob).
- **§8.1 seeding:** step 4 describes GitHub URLs as the seed's starting values that the import
  script replaces, and the new seed-then-import order is documented.
- **§8.2:** rewritten from "Why GitHub sprites and not R2?" to why we self-host in the repo: one
  point of failure, rate limits, a non-durable optimizer cache, and why the repo beats R2 here (no
  card, no billing risk, ~41 MB). It also records the trade-off the old section was protecting,
  below.
- **§13 legal note:** the old §8.2 argued "we link, we don't host" partly as IP risk reduction.
  Committing copies of official artwork to a public repo gives that up. For a non-commercial
  portfolio project the risk stays low, but §13 should say plainly that the repo now contains the
  images, and that a commercial launch would have to remove or replace them.

---

## 10. Verification

- The import summary accounts for every row: each one has an artwork and a sprite on disk, and
  either a shiny artwork or a null `shinyArtworkUrl`.
- A query after the run finds no `Pokemon` row with an image URL that isn't a local
  `/pokemon/...` path.
- No source file under `src/` contains `raw.githubusercontent.com` (generated Prisma code aside).
- **The real test:** with Playwright set to block every request to `raw.githubusercontent.com`,
  these pages render all their images. Desktop and 375px, signed in and logged out.
  - landing
  - sign-in and register pages and the auth modal
  - `/pokedex` (including the empty state)
  - `/p/[slug]` for a regular and a mythical Pokémon
  - `/packs`, including a shiny slot and the error state
  - a profile
- Spot-check a few converted artworks against the originals on the detail page: no visible
  banding or halo around transparent edges.
- A second import run writes nothing and reports everything as skipped.
- The total size of `public/pokemon/` is in line with §3 (about 41 MB).
- `npm run build` and `npm run lint` pass.
