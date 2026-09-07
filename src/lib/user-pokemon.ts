import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { toStars } from "@/lib/rating";

export interface UserPokemonReview {
  /** Half-star units (see `rating.ts`), or null if unset. */
  rating: number | null;
  reviewText: string | null;
}

/**
 * The signed-in user's rating + review text for one Pokémon, in a single
 * lookup — both fields live on the same `UserPokemon` row, so callers that
 * need both (e.g. the Pokémon detail page) shouldn't pay for two round-trips.
 */
export const getUserPokemonReview = cache(
  async (userId: string, pokemonId: number): Promise<UserPokemonReview> => {
    const userPokemon = await prisma.userPokemon.findUnique({
      where: { userId_pokemonId: { userId, pokemonId } },
      select: { rating: true, reviewText: true },
    });
    return { rating: userPokemon?.rating ?? null, reviewText: userPokemon?.reviewText ?? null };
  },
);

interface RatingDistributionEntry {
  stars: 1 | 2 | 3 | 4 | 5;
  count: number;
}

export interface PokemonRatingStats {
  average: number;
  totalRatings: number;
  distribution: RatingDistributionEntry[];
}

/** Maps a half-star-unit value (1-10) to the whole-star distribution bucket it rounds up into. */
function toDistributionBucket(halfUnits: number): 1 | 2 | 3 | 4 | 5 {
  return Math.ceil(halfUnits / 2) as 1 | 2 | 3 | 4 | 5;
}

/**
 * Community rating stats for one Pokémon, aggregated over every user's
 * `UserPokemon.rating`. The average is continuous (computed from the raw
 * half-star-unit values), while the distribution buckets those same values
 * two-per-bucket into the five whole-star rows — see
 * `rating-review/rating-02-community-rating-aggregation-spec.md` §3-4.
 */
export const getPokemonRatingStats = cache(
  async (pokemonId: number): Promise<PokemonRatingStats> => {
    const rows = await prisma.userPokemon.groupBy({
      by: ["rating"],
      where: { pokemonId, rating: { not: null } },
      _count: { rating: true },
    });

    const counts = new Map<1 | 2 | 3 | 4 | 5, number>([
      [1, 0],
      [2, 0],
      [3, 0],
      [4, 0],
      [5, 0],
    ]);
    let totalRatings = 0;
    let halfUnitSum = 0;

    for (const row of rows) {
      if (row.rating === null) continue;
      const count = row._count.rating;
      totalRatings += count;
      halfUnitSum += row.rating * count;
      const bucket = toDistributionBucket(row.rating);
      counts.set(bucket, (counts.get(bucket) ?? 0) + count);
    }

    const average = totalRatings === 0 ? 0 : toStars(halfUnitSum / totalRatings);
    const distribution: RatingDistributionEntry[] = [5, 4, 3, 2, 1].map((stars) => ({
      stars: stars as 1 | 2 | 3 | 4 | 5,
      count: counts.get(stars as 1 | 2 | 3 | 4 | 5) ?? 0,
    }));

    return { average, totalRatings, distribution };
  },
);

/**
 * Set (or change) the signed-in user's rating for a Pokémon. Upserts on the
 * (userId, pokemonId) pair so rating a Pokémon the user has never caught,
 * favourited, or reviewed doesn't disturb any collection defaults.
 */
export async function setUserRating(userId: string, pokemonId: number, rating: number) {
  await prisma.userPokemon.upsert({
    where: { userId_pokemonId: { userId, pokemonId } },
    create: { userId, pokemonId, rating, reviewedAt: new Date() },
    update: { rating, reviewedAt: new Date() },
  });
}

/**
 * Post (or update) the signed-in user's rating and review text together, from
 * the review composer. Rating is required — the composer gates submission on
 * one being selected (see rating-review/rating-03-review-composer-spec.md
 * §3) — while `reviewText` may be null for a rating with no written text.
 */
export async function postUserReview(
  userId: string,
  pokemonId: number,
  rating: number,
  reviewText: string | null,
) {
  await prisma.userPokemon.upsert({
    where: { userId_pokemonId: { userId, pokemonId } },
    create: { userId, pokemonId, rating, reviewText, reviewedAt: new Date() },
    update: { rating, reviewText, reviewedAt: new Date() },
  });
}

/**
 * Clear the signed-in user's rating for a Pokémon. `reviewedAt` is cleared too
 * unless review text already exists on the row — a bare rating is still a
 * review in this data model, so `reviewedAt` should only survive the clear
 * when there's review content left for it to describe.
 */
export async function clearUserRating(userId: string, pokemonId: number) {
  const existing = await prisma.userPokemon.findUnique({
    where: { userId_pokemonId: { userId, pokemonId } },
    select: { reviewText: true },
  });
  if (!existing) return;

  await prisma.userPokemon.update({
    where: { userId_pokemonId: { userId, pokemonId } },
    data: { rating: null, reviewedAt: existing.reviewText ? undefined : null },
  });
}
