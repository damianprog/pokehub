import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { toStars } from "@/lib/rating";
import { WISHLIST_CAP } from "@/lib/wishlist";

export interface UserPokemonState {
  /** Half-star units (see `rating.ts`), or null if unset. */
  rating: number | null;
  reviewText: string | null;
  reviewedAt: Date | null;
  isFavorite: boolean;
  isWishlist: boolean;
}

/**
 * The signed-in user's rating + review text + favorite/wishlist flags for
 * one Pokémon, in a single lookup — all live on the same `UserPokemon` row,
 * so callers that need more than one (e.g. the Pokémon detail page)
 * shouldn't pay for extra round-trips.
 */
export const getUserPokemonState = cache(
  async (userId: string, pokemonId: number): Promise<UserPokemonState> => {
    const userPokemon = await prisma.userPokemon.findUnique({
      where: { userId_pokemonId: { userId, pokemonId } },
      select: {
        rating: true,
        reviewText: true,
        reviewedAt: true,
        isFavorite: true,
        isWishlist: true,
      },
    });
    return {
      rating: userPokemon?.rating ?? null,
      reviewText: userPokemon?.reviewText ?? null,
      reviewedAt: userPokemon?.reviewedAt ?? null,
      isFavorite: userPokemon?.isFavorite ?? false,
      isWishlist: userPokemon?.isWishlist ?? false,
    };
  },
);

/**
 * Set the signed-in user's favorite flag for a Pokémon. Upserts on the
 * (userId, pokemonId) pair so favoriting a Pokémon with no existing row
 * doesn't disturb rating/review/collection defaults. Favoriting is
 * unlimited — no cap to enforce here, unlike Wishlist's 3-slot limit.
 */
export async function setUserFavorite(userId: string, pokemonId: number, isFavorite: boolean) {
  await prisma.userPokemon.upsert({
    where: { userId_pokemonId: { userId, pokemonId } },
    create: { userId, pokemonId, isFavorite },
    update: { isFavorite },
  });
}

/** Thrown by `setUserWishlist` when adding would exceed `WISHLIST_CAP`. */
export class WishlistAtCapacityError extends Error {
  constructor() {
    super(`Wishlist is full (max ${WISHLIST_CAP}).`);
    this.name = "WishlistAtCapacityError";
  }
}

/**
 * The signed-in user's total wishlisted Pokémon count, across every
 * Pokémon — not the per-Pokémon flag `getUserPokemonState` returns. Backs
 * the "X of 3" UI and the at-capacity check on the add path.
 */
export const getUserWishlistCount = cache(async (userId: string): Promise<number> => {
  return prisma.userPokemon.count({ where: { userId, isWishlist: true } });
});

/**
 * Set the signed-in user's wishlist flag for a Pokémon. Upserts on the
 * (userId, pokemonId) pair so wishlisting a Pokémon with no existing row
 * doesn't disturb rating/review/favorite/collection defaults. Removing
 * (isWishlist: false) is always allowed. Adding is guarded by a
 * transactional count-then-write check against `WISHLIST_CAP` so two
 * concurrent adds can't both succeed and leave a user over the cap; throws
 * `WishlistAtCapacityError` when the cap would be exceeded.
 */
export async function setUserWishlist(userId: string, pokemonId: number, isWishlist: boolean) {
  if (!isWishlist) {
    await prisma.userPokemon.upsert({
      where: { userId_pokemonId: { userId, pokemonId } },
      create: { userId, pokemonId, isWishlist: false },
      update: { isWishlist: false },
    });
    return;
  }

  await prisma.$transaction(async (tx) => {
    // Postgres's default READ COMMITTED isolation does NOT serialize the
    // count-check below against a concurrent add for the same user targeting
    // a *different* Pokémon (different row, so no natural write conflict) —
    // two adds racing this way can both read a count under the cap and both
    // commit, exceeding it. Locking the user's own row forces a second
    // concurrent transaction for the same user to block here until the first
    // commits, so its count-check afterward sees the first add's write.
    await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${userId} FOR UPDATE`;

    const existing = await tx.userPokemon.findUnique({
      where: { userId_pokemonId: { userId, pokemonId } },
      select: { isWishlist: true },
    });
    if (existing?.isWishlist) return;

    const count = await tx.userPokemon.count({ where: { userId, isWishlist: true } });
    if (count >= WISHLIST_CAP) {
      throw new WishlistAtCapacityError();
    }

    await tx.userPokemon.upsert({
      where: { userId_pokemonId: { userId, pokemonId } },
      create: { userId, pokemonId, isWishlist: true },
      update: { isWishlist: true },
    });
  });
}

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
 * the review composer. Both rating and `reviewText` are required — a
 * rating with no written text is set via `setUserRating` instead (the "Rate
 * it" stars), not this path.
 */
export async function postUserReview(
  userId: string,
  pokemonId: number,
  rating: number,
  reviewText: string,
) {
  await prisma.userPokemon.upsert({
    where: { userId_pokemonId: { userId, pokemonId } },
    create: { userId, pokemonId, rating, reviewText, reviewedAt: new Date() },
    update: { rating, reviewText, reviewedAt: new Date() },
  });
}

/**
 * Delete the signed-in user's written review for a Pokémon, leaving `rating`
 * and `reviewedAt` untouched — the rating stays valid on its own (see
 * rating-review/rating-04-your-review-block-spec.md §6), this only removes
 * the text the "Your review" card and the composer show back to the user.
 */
export async function deleteUserReviewText(userId: string, pokemonId: number) {
  await prisma.userPokemon.update({
    where: { userId_pokemonId: { userId, pokemonId } },
    data: { reviewText: null },
  });
}

export interface TopReviewItem {
  id: string;
  username: string;
  avatarImage: string | null;
  /** Half-star units (see `rating.ts`), or null if the user cleared their rating but kept the written review. */
  rating: number | null;
  reviewText: string;
}

export interface TopReviewsResult {
  reviews: TopReviewItem[];
  totalReviewCount: number;
}

/**
 * A capped, most-recent-first preview of written reviews for a Pokémon
 * (the viewer's own included), plus the total count of every written review
 * on it for the "View all N" line. Ordered by `reviewedAt` rather than a
 * helpfulness score, since no `ReviewLike` wiring exists yet to produce one.
 * See rating-review/rating-05-top-reviews-real-aggregation-spec.md §3-§5.
 */
export const getTopReviews = cache(
  async (pokemonId: number, limit = 2): Promise<TopReviewsResult> => {
    const reviewedWhere = { pokemonId, reviewText: { not: null } } as const;

    const [totalReviewCount, rows] = await Promise.all([
      prisma.userPokemon.count({ where: reviewedWhere }),
      prisma.userPokemon.findMany({
        where: reviewedWhere,
        orderBy: { reviewedAt: "desc" },
        take: limit,
        select: {
          id: true,
          rating: true,
          reviewText: true,
          user: { select: { username: true, name: true, image: true } },
        },
      }),
    ]);

    const reviews: TopReviewItem[] = rows.map((row) => ({
      id: row.id,
      username: row.user.username ?? row.user.name ?? "trainer",
      avatarImage: row.user.image,
      rating: row.rating,
      reviewText: row.reviewText ?? "",
    }));

    return { reviews, totalReviewCount };
  },
);

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
