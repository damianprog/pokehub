# Spec — `BaseStats` component

> **Status:** spec / pre-implementation
> **Scope:** the "Base Stats" chart on `/p/[slug]` — the six-row HP/Attack/Defense/Sp.Atk/Sp.Def/Speed bar chart sitting directly below the "Rate it" row.
> **Out of scope:** top reviews, lists featuring this Pokémon; mobile layout; interactivity.

---

## 1. Goal & scope

A single `BaseStats` RSC that renders the base-stats bar chart card in the info column of
`/p/[slug]`, directly below `RateRow` and directly above the still-unbuilt "Top Reviews" section.
Same "ship the visual layer first" pattern already used for `PokemonArtwork`, `PokemonActions`,
`PokemonHeader`, `PokemonPhysicals`, `CommunityRating`, and `RateRow` — presentational, no
interactivity.

Unlike `CommunityRating` and `RateRow`, this component's data **already exists and is fully
seeded** — but not in a form worth consuming as-is. The original schema stored the six stats as one
`Pokemon.baseStats Json` column (`{ hp, attack, defense, spAttack, spDefense, speed }`, per
`project-overview_8.md` §5.3), which Prisma exposes as an untyped JSON value with no compile-time
shape guarantee. Since the six stats are a fixed, never-varying shape — never a reason for a real
Pokémon to have five stats or seven — this iteration normalizes them into six real, natively-typed
`Int` columns on `Pokemon` instead of reading through an untyped column (see §4). This iteration
renders **real, per-Pokémon data** pulled straight from the already-fetched `Pokemon` record — no
placeholder dataset.

The component is mounted in `src/app/(app)/p/[slug]/page.tsx`, directly below `<RateRow />`, ahead
of the remaining info-column placeholder.

---

## 2. Visual spec (from Claude Design)

Source: `PokeHub.dc.html`, Pokémon Detail screen, Info column — the "Base Stats" card immediately
following the "Rate it" row, immediately before "Top Reviews". Pull exact spacing, sizing, and
color values from that source when implementing rather than from this spec — described generally
below.

A card matching the same surface treatment as the Community rating card above it (same background,
border, and radius family already established on this page), containing a small muted uppercase
"Base Stats" label followed by six stacked rows, one per stat, in this fixed order: **HP, Attack,
Defense, Sp. Atk, Sp. Def, Speed** — not alphabetical, matches the order PokéAPI/the design uses
elsewhere for stat displays.

Each row lays out three elements left to right:

1. A short, fixed-width, right-aligned, muted stat label (e.g. `HP`, `Sp.Atk`).
2. A flexible horizontal bar: a low-contrast track spanning the remaining width, with a filled
   segment inside it whose length represents the stat's magnitude and whose color is specific to
   that stat (HP reads as a distinct color from Attack, which reads as distinct from Speed, etc.) —
   the same "fixed per-stat identity color" idea already used elsewhere in this codebase for
   per-type styling (`type-gradients.ts`, `type-badge-colors.ts`). A new small stat-color map is the
   natural place for these six colors, following that existing extraction pattern rather than
   inlining hex values in the component.
3. A right-aligned, emphasized numeric value (Space Grotesk, bold) showing the raw stat number.

Rows are tightly stacked with a small consistent gap, no dividers between them (unlike
`PokemonPhysicals`, which separates its three cells with vertical rules).

---

## 3. Content & formatting

The component receives the six raw stat numbers and derives each bar's fill width itself — no
caller does this math, same principle as `CommunityRating` and `RateRow`.

| Value | Formula | Example (Charizard: attack=84) |
|---|---|---|
| Bar fill width | `Math.round((statValue / 255) * 100)` as a percentage, clamped `0–100` | Attack → `33%` |
| Value text | raw integer, no formatting | `84` |

`255` is the scale ceiling used for the bar (the practical maximum any single base stat reaches
across the Pokédex) — fixed, not derived per-Pokémon, so bars stay comparable across different
Pokémon pages rather than each page auto-scaling to its own highest stat.

---

## 4. Design decision — normalize `Pokemon.baseStats` into typed columns

Two options were considered for giving the component typed access to the six stats:

1. Keep `baseStats` as one `Json` column and add a typed boundary in application code — an interface
   for the shape plus a small helper that reads `pokemon.baseStats` through a type assertion at the
   point it's consumed. Workable, but it's an application-level patch over a schema that's still
   untyped at its source: every future consumer of `baseStats` (a future "highest Attack" sort, a
   min/max filter, a raw query) goes through the same unsafe assertion instead of a real column type,
   and Postgres/Prisma can't index, sort, or filter on individual stats without reaching into the
   JSON blob.
2. **Normalize `baseStats` into six real `Int` columns** (`hp`, `attack`, `defense`, `spAttack`,
   `spDefense`, `speed`) directly on `Pokemon`, dropping the `Json` column entirely (chosen). This
   is the same move already made for `baseExperience` earlier in this feature area — a scalar field
   that's always present gets a real typed column, not a flexible blob. `Json` on `Pokemon` was
   reasonable for a quick first pass, but the six stats never actually need JSON's flexibility: every
   Pokémon has exactly these six, always numeric, and PokeAPI itself already returns them as a fixed
   array of six named entries. Real columns mean the component receives genuinely-typed `number`
   fields straight off the Prisma-generated `Pokemon` type — no assertion, no runtime cast, no
   separate typed-read helper to maintain — and the database itself now understands the data
   (sortable/filterable per-stat in the future, unlike a JSON blob).

This is a schema migration, not just an application-code change — see §4.1.

### 4.1 Migration

`prisma/schema.prisma`'s `Pokemon` model replaces `baseStats Json` with six `Int` fields. The
`Pokemon` table already has 1025 populated rows, so a plain "add six required columns" migration
isn't valid Postgres (a `NOT NULL` column added to a non-empty table needs either a default or a
backfill first). The migration instead, in one pass: adds the six columns as nullable, backfills
each one from the existing `baseStats` JSON value already sitting in every row (no PokeAPI re-fetch
needed — the data was already there, just in the wrong shape), then enforces `NOT NULL` on all six
and drops the now-redundant `baseStats` column. This is simpler than the `baseExperience` precedent,
which needed a JS backfill loop against `scripts/seed-pokemon.ts`'s remembered fetch data because no
prior column held that value — here, the source value already lives in the same row being migrated,
so the backfill is a single SQL `UPDATE` inside the migration itself.

`scripts/seed-pokemon.ts`'s existing `mapBaseStats()` helper already returns exactly
`{ hp, attack, defense, spAttack, spDefense, speed }` — matching the six new column names — so the
insert path changes from assigning that object to one `baseStats` field to spreading it across the
six top-level fields.

---

## 5. Props

- `stats` — object of the six raw base stat numbers: `hp`, `attack`, `defense`, `spAttack`,
  `spDefense`, `speed` (all `number`), typed via a `BaseStats` interface (`src/types/pokemon.ts`)
  that now exists purely as a prop shape — its fields correspond 1:1 to the six real `Pokemon`
  columns from §4, satisfied structurally with no cast needed.

Page constructs the prop object directly off the six typed `pokemon.*` fields — real per-Pokémon
data, not a hardcoded placeholder.

---

## 6. File location

- `src/components/pokemon/BaseStats.tsx`
- `BaseStats` prop-shape type per §5 (`src/types/pokemon.ts`)
- Stat-color map per §2 (e.g. `src/lib/stat-colors.ts`, following the existing
  `type-gradients.ts`/`type-badge-colors.ts` pattern)
- Schema + migration + seed script changes per §4.1

---

## 7. Deliberate non-goals (this iteration)

- **Top reviews, lists featuring this Pokémon** — separate sections of the same info column,
  separate iterations.
- **Interactivity** — nothing clickable or hoverable; bars are static visuals.
- **Mobile layout** — the two-column grid's responsive collapse is a separate concern, already
  deferred by the `PokemonArtwork` spec.
- **Stat total / BST summary** — the design doesn't show one on this card; not adding one
  unprompted.
- **Querying/sorting by stat** — §4 notes real columns make this possible later; no such feature
  (e.g. "highest Attack" browse view) is being built this iteration.

---

## 8. Implementation order

1. Schema + migration + seed script changes (§4.1).
2. `BaseStats` prop-shape type (§5).
3. Stat-color map (§2, §6).
4. `src/components/pokemon/BaseStats.tsx` — the component (§2, §3), taking props per §5.
5. Wire into `src/app/(app)/p/[slug]/page.tsx`, directly below `<RateRow />`, constructing the
   `stats` prop from the six typed `pokemon.*` fields.

---

## 9. Testing

- `prisma migrate status` clean after the migration; querying any pre-existing Pokémon row shows
  the six new columns correctly backfilled from its old `baseStats` JSON value, and the `baseStats`
  column itself is gone.
- `/p/charizard` → six rows in order HP/Attack/Defense/Sp.Atk/Sp.Def/Speed, each bar's fill width
  proportional to `statValue / 255`, each value text matching Charizard's real seeded base stats.
- `/p/mew` and `/p/magikarp` → different bar lengths and values reflecting their own real base
  stats — confirms the component is reading per-Pokémon data, not a shared placeholder.
- No console errors; `npm run build` passes.
- Visually pixel-matched against the Claude Design source's "Base Stats" card.
