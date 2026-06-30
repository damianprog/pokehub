# Spec — Pokémon Detail Page (`/p/[slug]`)

> **Status:** spec / pre-implementation
> **Scope:** just the RSC page that fetches a Pokémon from Neon by `slug`.
> **Out of scope (later iteration):** section components and their props, layout, styling.

---

## 1. Goal & scope

The `/p/[slug]` route as an `async` Server Component whose sole responsibility right now is the
**data layer of the page**: resolve the `slug` to a `Pokemon` record from Neon (or 404), and set
the page metadata. Rendering the actual sections (artwork, types, stats, rating, reviews) is a
later iteration — this spec stops at "the page has the data".

**What we do now:**

- Route `/p/[slug]` as an `async` RSC.
- Fetch the `Pokemon` record by `slug`.
- `notFound()` for a non-existent slug.
- `generateMetadata` (tab title from the Pokémon name), deduped against the page query.
- A throwaway render just to smoke-test the data flow (§5).

**What we deliberately do NOT do here** (see §8):

- No section components and therefore **no props contracts**.
- No layout, CSS, Tailwind, or shadcn.
- No section-specific queries (rating aggregate, reviews) — they ship with their sections.
- No interactivity, no auth, no `next/image` config, no `baseStats` parsing yet.

---

## 2. Route & async params (Next.js 16)

In App Router 15/16 `params` is a **Promise** — it must be `await`ed:

```ts
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPokemon } from "@/lib/pokemon";

export default async function PokemonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // ...
}
```

---

## 3. Data fetching

A single query in the page resolves the record; a missing slug is a 404.

```ts
const pokemon = await getPokemon(slug);
if (!pokemon) notFound();
```

`getPokemon` lives in `src/lib/pokemon.ts` and is wrapped in React `cache()` (see §4 for why).
The query is a plain `findUnique`:

```ts
// src/lib/pokemon.ts
import { cache } from "react";
import { prisma } from "@/lib/prisma";

export const getPokemon = cache((slug: string) =>
  prisma.pokemon.findUnique({ where: { slug } }),
);
```

This pulls the full `Pokemon` row — all scalar fields including `types` (`string[]`) and
`baseStats` (`Json`). They're fetched and available; consuming them is the section components'
job in the next iteration.

---

## 4. `generateMetadata` + query dedup

`generateMetadata` and the page component run separately, so a naive implementation hits the DB
twice for the same Pokémon. Both call the same `cache()`-wrapped `getPokemon`, so within one
request the query runs once:

```ts
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const pokemon = await getPokemon(slug);
  return { title: pokemon ? `${pokemon.name} — PokeHub` : "Pokémon — PokeHub" };
}
```

The page then calls `getPokemon(slug)` again → the second call hits the cache, not the DB.

---

## 5. Temporary render (smoke test only)

Until section components exist, the page renders a minimal placeholder purely to confirm the data
arrived — e.g. the name, or raw JSON:

```tsx
return <pre>{JSON.stringify(pokemon, null, 2)}</pre>;
```

This is explicitly throwaway and gets replaced the moment the first section component lands.

---

## 6. Complete implementation reference

### `src/lib/pokemon.ts`

```ts
import { cache } from "react";
import { prisma } from "@/lib/prisma";

export const getPokemon = cache((slug: string) =>
  prisma.pokemon.findUnique({ where: { slug } }),
);
```

### `src/app/p/[slug]/page.tsx`

```tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPokemon } from "@/lib/pokemon";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const pokemon = await getPokemon(slug);
  return { title: pokemon ? `${pokemon.name} — PokeHub` : "Pokémon — PokeHub" };
}

export default async function PokemonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pokemon = await getPokemon(slug);
  if (!pokemon) notFound();

  return <pre>{JSON.stringify(pokemon, null, 2)}</pre>;
}
```

---

## 7. File structure

```
src/
├─ app/
│  └─ p/
│     └─ [slug]/
│        └─ page.tsx                 ← RSC: await params, getPokemon, notFound, generateMetadata
└─ lib/
   └─ pokemon.ts                     ← getPokemon (cache-wrapped findUnique)
```

---

## 8. Deliberate non-goals (separate iterations)

- **Section components + props** — `PokemonHero`, `PokemonTypeList`, `PokemonProfile`,
  `PokemonStats`, `PokemonFlavor`, `CommunityRating`, `PokemonReviews`, and the reusable atoms.
  Their props contracts come with them.
- **Section-specific queries** — the rating aggregate (`userPokemon.aggregate`) and reviews
  (`userPokemon.findMany`) ship alongside the `CommunityRating` / `PokemonReviews` components,
  not here.
- **`next/image` remotePatterns** — already configured (`raw.githubusercontent.com` added during
  the hero section). No further config needed when artwork images land.
- **`baseStats` parsing (Json → typed)** — needed only once a component consumes the stats.
- **Layout / styling** — Tailwind v4 + shadcn, the entire visual layer.
- **Interactivity & auth** — shiny toggle, rating/review form.
- **Index grid `/pokedex`** — a browsable list linking here. Separate PR.

---

## 9. Testing

Manual smoke test for this iteration:

- `/p/charizard` → 200, placeholder shows the record.
- `/p/mew` → 200.
- `/p/does-not-exist` → 404 (`notFound()`).

---

## 10. Implementation order

1. `src/lib/pokemon.ts` — `getPokemon` (cache-wrapped `findUnique`).
2. `src/app/p/[slug]/page.tsx` — `await params`, `getPokemon`, `notFound`, `generateMetadata`,
   throwaway render.
3. Manual smoke test (`/p/charizard`, `/p/mew`, a bad slug).
4. PR. Section components in the next iteration.
