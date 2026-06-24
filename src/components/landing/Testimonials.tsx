import Image from "next/image";

const SPRITE_BASE =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork";

const REVIEWS = [
  {
    username: "anna_g",
    avatarLetter: "A",
    avatarGradient: "linear-gradient(135deg,#e85b9e,#b89ee0)",
    pokemon: "Gardevoir",
    pokemonId: 282,
    pokemonNameColor: "#e89ec8",
    thumbnailGradient: "#e89ec8, #7a2a6a",
    rating: "4.5",
    starFillPct: 90,
    text: "Elegance incarnate. Mega Gardevoir turns a graceful fairy into a wallbreaker with actual menace — the design earns every bit of its fandom.",
    helpful: 134,
  },
  {
    username: "ghosttype_andy",
    avatarLetter: "G",
    avatarGradient: "linear-gradient(135deg,#8b6fd4,#4a3a8a)",
    pokemon: "Gengar",
    pokemonId: 94,
    pokemonNameColor: "#b6a0e6",
    thumbnailGradient: "#8b6fd4, #2e1e5a",
    rating: "5.0",
    starFillPct: 100,
    text: "Peak ghost-type design. That grin has haunted me since 1998 and I would not change a single pixel. Hands-down the most characterful silhouette in Kanto.",
    helpful: 98,
  },
  {
    username: "kanto_kris",
    avatarLetter: "K",
    avatarGradient: "linear-gradient(135deg,#4aa3e0,#2a5a8a)",
    pokemon: "Magikarp",
    pokemonId: 129,
    pokemonNameColor: "#7fb6ff",
    thumbnailGradient: "#4aa3e0, #2a5a8a",
    rating: "2.0",
    starFillPct: 40,
    text: "Splash does nothing. Tackle barely registers. But I respect the grind — there's a dragon hiding in there and I'd flop for it any day.",
    helpful: 61,
  },
];

function ReviewCard({
  username,
  avatarLetter,
  avatarGradient,
  pokemon,
  pokemonId,
  pokemonNameColor,
  thumbnailGradient,
  rating,
  starFillPct,
  text,
  helpful,
}: (typeof REVIEWS)[number]) {
  return (
    <article
      className="rounded-[16px] p-[22px]"
      style={{ background: "#15181e", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      {/* Header row */}
      <div className="mb-[14px] flex items-center gap-[11px]">
        {/* Avatar */}
        <div
          className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-full text-[14px] font-extrabold text-white"
          style={{ background: avatarGradient }}
        >
          {avatarLetter}
        </div>

        {/* User info */}
        <div className="min-w-0 flex-1">
          <div className="text-[14px] font-bold" style={{ color: "#e8eaed" }}>
            {username}
          </div>
          <div className="text-[12px]" style={{ color: "#9aa0ab" }}>
            reviewed{" "}
            <span style={{ color: pokemonNameColor }}>{pokemon}</span>
          </div>
        </div>

        {/* Pokémon thumbnail */}
        <div
          className="relative h-[38px] w-[38px] flex-none overflow-hidden rounded-[9px]"
          style={{ background: `radial-gradient(circle at 50% 60%, ${thumbnailGradient})` }}
        >
          <Image
            src={`${SPRITE_BASE}/${pokemonId}.png`}
            alt={pokemon}
            fill
            className="object-contain p-[2px]"
            loading="lazy"
          />
        </div>
      </div>

      {/* Star rating */}
      <div className="mb-[12px] flex items-center gap-2">
        <span
          className="relative inline-block text-[15px] leading-none"
          style={{ letterSpacing: "2px", fontFamily: "Arial" }}
        >
          <span style={{ color: "#363b45" }}>★★★★★</span>
          <span
            className="absolute left-0 top-0 overflow-hidden whitespace-nowrap"
            style={{ color: "#e6b450", width: `${starFillPct}%` }}
          >
            ★★★★★
          </span>
        </span>
        <span className="font-heading text-[13px] font-bold text-gold">{rating}</span>
      </div>

      {/* Review text */}
      <p
        className="mb-[12px] text-[14px] leading-[1.6]"
        style={{ color: "#cdd2da", margin: "0 0 12px" }}
      >
        &ldquo;{text}&rdquo;
      </p>

      {/* Helpful count */}
      <div className="text-[12.5px]" style={{ color: "#7b818c" }}>
        ♥ {helpful} found this helpful
      </div>
    </article>
  );
}

export function Testimonials() {
  return (
    <section className="mx-auto max-w-[1180px] px-[26px] pb-[90px]">
      <h2 className="font-heading m-0 mb-6 text-[26px] font-bold tracking-[-0.02em]">
        What trainers are saying
      </h2>
      <div className="grid grid-cols-1 gap-[16px] md:grid-cols-3">
        {REVIEWS.map((review) => (
          <ReviewCard key={review.username} {...review} />
        ))}
      </div>
    </section>
  );
}
