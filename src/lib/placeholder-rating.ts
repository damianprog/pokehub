// Placeholder rating data — no rating/review feature exists yet, so
// UserPokemon.rating has zero real rows. Replace with a real aggregation
// query once that feature is built (see community-rating-spec.md §4, §7).
export const PLACEHOLDER_RATING = {
  average: 4.3,
  totalRatings: 8412,
  distribution: [
    { stars: 5 as const, count: 4883 },
    { stars: 4 as const, count: 2019 },
    { stars: 3 as const, count: 841 },
    { stars: 2 as const, count: 421 },
    { stars: 1 as const, count: 248 },
  ],
};
