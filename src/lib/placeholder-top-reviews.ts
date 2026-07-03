// Placeholder top reviews — no review-writing feature exists yet, so
// UserPokemon.reviewText/rating have zero real rows. Same static dataset on
// every Pokémon page this iteration (see top-reviews-spec.md §4, §7).
export const PLACEHOLDER_TOP_REVIEWS = {
  totalReviewCount: 1840,
  reviews: [
    {
      id: "1",
      username: "ghosttype_andy",
      followerCount: 1200,
      avatarInitial: "G",
      avatarGradientFrom: "#8b6fd4",
      avatarGradientTo: "#4a3a8a",
      rating: 4.5,
      text: "Not even a fire-type loyalist and I get it. Mega X going pitch-black dragon is one of the best evolutions in the franchise. Half a star off for being on every team ever.",
      helpfulCount: 412,
    },
    {
      id: "2",
      username: "anna_g",
      followerCount: 4000,
      avatarInitial: "A",
      avatarGradientFrom: "#e85b9e",
      avatarGradientTo: "#b89ee0",
      rating: 4.0,
      text: "The original poster child, and it holds up. Docking a point only because the 4× rock weakness still gives me nightmares from the Brock era.",
      helpfulCount: 288,
    },
  ],
};
