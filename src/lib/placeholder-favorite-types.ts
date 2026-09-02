// Placeholder favorite types — this is effectively a per-user aggregate of
// favorited/rated Pokémon grouped by type, which would come from UserPokemon
// once the rate/review/favorite feature exists. It doesn't yet (zero real
// rows), so every profile ships the same fixed top-3 shown in the design this
// iteration (see favorite-types-spec.md). Avg. rating and collection progress
// are similarly mock — they depend on the rate/review feature and the packs/
// collection feature respectively, neither of which exists yet.
export const PLACEHOLDER_FAVORITE_TYPES = {
  types: [
    { type: "ghost", percentage: 38 },
    { type: "fire", percentage: 24 },
    { type: "dragon", percentage: 18 },
  ],
  avgRating: 3.8,
  collectionCaught: 847,
  collectionTotal: 1302,
};
