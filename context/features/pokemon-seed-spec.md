# Pokémon Seed — PokeAPI → Neon

## Overview

One-time (idempotent, re-runnable) seeder that populates the `Pokemon` reference table from PokeAPI. Fetches all ~1025 species, maps them to schema rows, and inserts in bulk via Prisma `createMany`.

## Requirements

- Fetch all species from `https://pokeapi.co/api/v2/pokemon-species?limit=10000`
- For each species: fetch the species detail + its default-variety Pokémon detail
- Map each pair to a `Prisma.PokemonCreateManyInput` row covering all `Pokemon` model fields
- Insert in chunks of 300 rows using `createMany({ skipDuplicates: true })` — safe to re-run
- Use bounded concurrency (12 parallel requests) with retry + exponential backoff (3 attempts)
- Log progress, inserted count, and any per-species failures

## Rarity mapping

| Tier         | Criterion                                      |
| ------------ | ---------------------------------------------- |
| `ULTRA_RARE` | `species.is_mythical === true`                 |
| `RARE`       | `species.is_legendary === true`                |
| `UNCOMMON`   | Slug present in `UNCOMMON_SLUGS` curated set   |
| `COMMON`     | Everything else                                |

`UNCOMMON_SLUGS` includes starter final evolutions (Gen 1–9), pseudo-legendaries, and fan favourites (Pikachu, Eevee, Gengar, Lucario, etc.).

## Image URL strategy

All images are derived from `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon` — no proxying, no R2. Three fields per Pokémon:

- `artworkUrl` — `…/other/official-artwork/{id}.png`
- `shinyArtworkUrl` — `…/other/official-artwork/shiny/{id}.png`
- `spriteUrl` — `…/{id}.png`

## Script location & invocation

`scripts/seed-pokemon.ts`

```bash
# Recommended (loads .env automatically via prisma.config.ts):
npx prisma db seed

# Or directly:
npx tsx --env-file=.env scripts/seed-pokemon.ts
```

## Prisma adapter choice

The seed runs in a Node.js CLI context — not a serverless edge runtime. It uses `@prisma/adapter-pg` (standard node-postgres) against `DIRECT_URL` (unpooled Neon connection) to avoid PgBouncer transaction-mode limitations during bulk inserts. The app runtime uses `@prisma/adapter-neon` (WebSocket serverless driver) as usual.

## Dependencies added

- `@prisma/adapter-pg` (dev)
- `pg` (dev)

## Notes

- `skipDuplicates: true` means re-running will NOT update rarity or any other field on rows that already exist. To recompute rarity after editing `UNCOMMON_SLUGS`, truncate the table first.
- `CHUNK_SIZE = 300` keeps each statement well under Postgres parameter limits.
- `CONCURRENCY = 12` is polite against the public PokeAPI rate limits.
