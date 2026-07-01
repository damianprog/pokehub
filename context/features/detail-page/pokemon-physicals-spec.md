# Spec — `PokemonPhysicals` component

> **Status:** spec / pre-implementation
> **Scope:** the three-column stats box (Height / Weight / Base XP) directly below the type badges row on `/p/[slug]`.
> **Out of scope:** community rating, rate-it row, base stats chart, top reviews, lists featuring this Pokémon; mobile layout; interactivity.

---

## 1. Goal & scope

A single `PokemonPhysicals` RSC that renders the flat stats card sitting between the type badges
row (`PokemonHeader`) and the community rating card in the info column of `/p/[slug]`. Same
"ship the visual layer first" pattern already used for `PokemonArtwork`, `PokemonActions`, and
`PokemonHeader` — presentational, real data props, no interactivity.

Unlike the prior three components, this one needs a data field the schema doesn't have yet
(`baseExperience` — see §4). That's part of this spec's scope, not a follow-up.

The component is mounted in `src/app/(app)/p/[slug]/page.tsx`, directly below `<PokemonHeader />`
in the info column, ahead of the still-empty `{/* remaining info column sections — next
iterations */}` placeholder.

---

## 2. Visual spec (from Claude Design)

Source: `PokeHub.dc.html`, Pokémon Detail screen, Info column — the flex row of three cells
immediately following the type badges, immediately before the community rating card.

### 2.1 Container

| Property | Value |
|---|---|
| Display | `flex` |
| Gap | `0` |
| Margin bottom | `22px` |
| Background | `#15181e` |
| Border | `1px solid rgba(255,255,255,0.06)` |
| Border radius | `14px` |
| Overflow | `hidden` |

### 2.2 Cells

Three cells in fixed order: **Height**, **Weight**, **Base XP**.

| Property | Value |
|---|---|
| Flex | `1` (equal thirds) |
| Padding | `14px 18px` |
| Border right | `1px solid rgba(255,255,255,0.06)` — on the **first two** cells only; the last cell (Base XP) has no right border |

Each cell stacks a label over a value:

| Element | Property | Value |
|---|---|---|
| Label | Font size | `11px` |
| Label | Color | `#7b818c` |
| Label | Font weight | `600` |
| Label | Letter spacing | `0.06em` |
| Label | Text transform | `uppercase` |
| Label | Margin bottom | `4px` |
| Label | Content | `Height` / `Weight` / `Base XP` |
| Value | Font | Space Grotesk, weight `700` |
| Value | Font size | `20px` |
| Value | Content | formatted stat, see §3 |

---

## 3. Value formatting

Source values come straight off the `Pokemon` record already fetched by the page — no new
queries, only a schema addition (§4) for Base XP.

| Stat | Source field | Format | Example (Charizard: height=17, weight=905, baseExperience=240) |
|---|---|---|
| Height | `pokemon.height` (decimeters) | `(height / 10).toFixed(1)` + `" m"` | `1.7 m` |
| Weight | `pokemon.weight` (hectograms) | `(weight / 10).toFixed(1)` + `" kg"` | `90.5 kg` |
| Base XP | `pokemon.baseExperience` | raw integer, no unit suffix; `"—"` if `null` | `240` |

---

## 4. Schema change — `Pokemon.baseExperience`

The `Pokemon` model has no field for PokeAPI's `base_experience`; it was never captured during the
original seed (`height`/`weight` were, `base_experience` wasn't). This spec adds it.

### 4.1 Schema

Add to `prisma/schema.prisma`, alongside `height`/`weight`:

- `baseExperience Int?` — **nullable**, for two reasons: (1) the 1025 already-seeded rows will be
  `NULL` until backfilled, and (2) PokeAPI itself returns `null` `base_experience` for a small
  number of species (mostly non-standard/battle-only forms), so the column has to tolerate absence
  even after a full backfill.
- New migration via `prisma migrate dev` (per `coding-standards.md` — no `db push`).

### 4.2 Seed script backfill

`scripts/seed-pokemon.ts` already fetches the full `/pokemon/{id}` payload (the same object
`height`/`weight` are read from), so capturing `base_experience` at fetch time is a one-line
addition: `baseExperience: pokemon.base_experience ?? null`.

That alone isn't enough to populate the **existing** 1025 rows — the insert step uses
`createMany({ skipDuplicates: true })`, which silently skips rows that already exist by `id`,
so re-running the script as-is would leave `baseExperience` `NULL` on every current row.

Add a small backfill pass right after the existing `createMany` chunk loop: for rows that already
exist (i.e., weren't part of `inserted`), run a targeted update setting `baseExperience` where it's
currently `NULL`. This keeps the script's existing "re-runnable, idempotent" property
(`project-overview_8.md` §8.1) instead of introducing a one-off throwaway migration script or a
destructive truncate-and-reseed.

---

## 5. Props

- `height` — `number`, decimeters (`pokemon.height`)
- `weight` — `number`, hectograms (`pokemon.weight`)
- `baseExperience` — `number | null` (`pokemon.baseExperience`)

No user-state props this iteration.

---

## 6. File location

- `src/components/pokemon/PokemonPhysicals.tsx`
- Schema + seed changes in `prisma/schema.prisma` and `scripts/seed-pokemon.ts` (§4)

---

## 7. Deliberate non-goals (this iteration)

- **Community rating, rate-it row, base stats chart, top reviews, lists featuring this Pokémon** —
  separate sections of the same info column, separate iterations.
- **Interactivity** — no unit toggle (m/kg vs ft/lb), nothing clickable.
- **Mobile layout** — the two-column grid's responsive collapse is a separate concern, already
  deferred by the `PokemonArtwork` spec.
- **Per-type styling** — unlike the artwork card, this box is visually identical across every
  Pokémon (only the numbers change).

---

## 8. Implementation order

1. `prisma/schema.prisma` — add `baseExperience Int?` to `Pokemon`, run `prisma migrate dev`.
2. `scripts/seed-pokemon.ts` — capture `base_experience` on the mapped row, add the backfill pass
   for existing rows, re-run the seed script.
3. `src/components/pokemon/PokemonPhysicals.tsx` — the component (§2, §3).
4. Wire into `src/app/(app)/p/[slug]/page.tsx`, directly below `<PokemonHeader />`.

---

## 9. Testing

- `prisma migrate status` clean after the migration; `baseExperience` populated (non-null) for
  Charizard, Mew, Magikarp after reseed.
- `/p/charizard` → `1.7 m` / `90.5 kg` / `240`, three equal columns, dividers after the first two
  cells only.
- `/p/mew` and `/p/magikarp` → correct per-species values, same static box styling.
- Any Pokémon whose `baseExperience` is still `null` post-backfill → renders `—` in that cell, no
  crash.
