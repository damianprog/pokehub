import Image from "next/image";

const SPRITE_BASE =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork";

const TRENDING = [
  { rank: 1, name: "Rayquaza", id: 384, gradient: "#2aaa6a, #1a5a3a", rating: "4.8" },
  { rank: 2, name: "Dragonite", id: 149, gradient: "#e6a84a, #8a5a20", rating: "4.7" },
  { rank: 3, name: "Gengar", id: 94, gradient: "#8b6fd4, #2e1e5a", rating: "4.6" },
  { rank: 4, name: "Ho-oh", id: 250, gradient: "#ff9a3a, #b84a20", rating: "4.6" },
  { rank: 5, name: "Garchomp", id: 445, gradient: "#6a5acd, #3a2a7a", rating: "4.5" },
  { rank: 6, name: "Gyarados", id: 130, gradient: "#4aa3e0, #2a5a8a", rating: "4.5" },
];

function TrendingCard({
  rank,
  name,
  id,
  gradient,
  rating,
}: (typeof TRENDING)[number]) {
  return (
    <div
      className="cursor-pointer rounded-[14px] p-[14px] text-center"
      style={{ background: "#15181e", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <div className="font-heading mb-2 text-[11px] font-bold" style={{ color: "#5c636e" }}>
        #{rank}
      </div>
      <div
        className="relative mb-[10px] aspect-square overflow-hidden rounded-[10px]"
        style={{ background: `radial-gradient(circle at 50% 60%, ${gradient})` }}
      >
        <Image
          src={`${SPRITE_BASE}/${id}.png`}
          alt={name}
          fill
          className="object-contain p-[5px]"
          loading="lazy"
        />
      </div>
      <div className="mb-1 text-[13.5px] font-bold">{name}</div>
      <div className="font-heading text-[13px] font-bold text-gold">★ {rating}</div>
    </div>
  );
}

export function TrendingGrid() {
  return (
    <section className="mx-auto max-w-[1180px] px-[26px] pb-[90px]">
      <div className="mb-6 flex items-baseline justify-between">
        <h2 className="font-heading m-0 text-[26px] font-bold tracking-[-0.02em]">
          Trending this week
        </h2>
        <span className="text-[13px] text-dim-foreground">Based on 214k trainer ratings</span>
      </div>
      <div className="grid grid-cols-3 gap-[14px] md:grid-cols-6">
        {TRENDING.map((pokemon) => (
          <TrendingCard key={pokemon.id} {...pokemon} />
        ))}
      </div>
      <div className="mt-6 text-center">
        <button
          className="h-11 cursor-pointer rounded-[12px] px-[26px] text-[14px] font-semibold"
          style={{
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.05)",
            color: "#e8eaed",
          }}
        >
          Rate all 1,302 Pokémon →
        </button>
      </div>
    </section>
  );
}
