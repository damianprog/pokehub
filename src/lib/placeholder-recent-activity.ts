// Placeholder recent activity — this is effectively the profile owner's own
// review history, which would come from UserPokemon (reviewText/rating/
// reviewedAt) once the rating/review feature exists. It doesn't yet (zero
// real rows), so every profile ships the same two mock items shown in the
// design this iteration (see recent-activity-spec.md).
export const PLACEHOLDER_RECENT_ACTIVITY = [
  {
    pokemonId: 6, // Charizard
    timeLabel: "1d",
    rating: 5,
    quote: "The one that started it all. Bias acknowledged, rating unchanged.",
  },
  {
    pokemonId: 94, // Gengar
    timeLabel: "3d",
    rating: 5,
    quote: "My desktop wallpaper for 8 years running. Perfection.",
  },
];
