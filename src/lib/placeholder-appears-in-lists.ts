// Placeholder "appears in lists" data — no lists feature exists yet (List/
// ListItem have zero rows). Same static dataset on every Pokémon page this
// iteration (see pokemon-lists-spec.md §3, §4).
export const PLACEHOLDER_APPEARS_IN_LISTS = {
  lists: [
    {
      id: "1",
      title: "Best Gen 1 Starters",
      username: "prof_oak",
      pokemonCount: 9,
      thumbnails: [
        {
          pokemonId: 3,
          name: "Venusaur",
          gradient: "radial-gradient(circle at 50% 40%, #5cb85c, #2a6a2a)",
        },
        {
          pokemonId: 6,
          name: "Charizard",
          gradient: "radial-gradient(circle at 50% 40%, #ff8a4c, #a83a1a)",
        },
        {
          pokemonId: 9,
          name: "Blastoise",
          gradient: "radial-gradient(circle at 50% 40%, #4aa3e0, #2a5a8a)",
        },
      ],
    },
    {
      id: "2",
      title: "Cinematic Dragons",
      username: "damian",
      pokemonCount: 21,
      thumbnails: [
        {
          pokemonId: 445,
          name: "Garchomp",
          gradient: "radial-gradient(circle at 50% 40%, #6a5acd, #3a2a7a)",
        },
        {
          pokemonId: 6,
          name: "Charizard",
          gradient: "radial-gradient(circle at 50% 40%, #ff8a4c, #a83a1a)",
        },
        {
          pokemonId: 149,
          name: "Dragonite",
          gradient: "radial-gradient(circle at 50% 40%, #e6a84a, #8a5a20)",
        },
      ],
    },
    {
      id: "3",
      title: "My Childhood Team",
      username: "kanto_kris",
      pokemonCount: 6,
      thumbnails: [
        {
          pokemonId: 6,
          name: "Charizard",
          gradient: "radial-gradient(circle at 50% 40%, #ff8a4c, #a83a1a)",
        },
        {
          pokemonId: 65,
          name: "Alakazam",
          gradient: "radial-gradient(circle at 50% 40%, #e85b9e, #7a2a5a)",
        },
        {
          pokemonId: 143,
          name: "Snorlax",
          gradient: "radial-gradient(circle at 50% 40%, #b8a878, #6a5838)",
        },
      ],
    },
  ],
};
