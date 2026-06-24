import Image from "next/image";

const SPRITE_BASE =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork";

const PACK_CARDS = [
  {
    name: "Magikarp",
    spriteUrl: `${SPRITE_BASE}/129.png`,
    background: "radial-gradient(circle at 50% 70%, #4aa3e0, #1a3050)",
    border: "1px solid rgba(140,170,200,0.22)",
    boxShadow: undefined as string | undefined,
    topOffset: 12,
    rarity: "COMMON",
    rarityColor: "#9ec0e0",
    shiny: false,
  },
  {
    name: "Gengar",
    spriteUrl: `${SPRITE_BASE}/94.png`,
    background: "radial-gradient(circle at 50% 70%, #8b6fd4, #2e1e5a)",
    border: "1px solid rgba(150,120,220,0.38)",
    boxShadow: "0 0 18px rgba(139,111,212,0.25)",
    topOffset: 0,
    rarity: "RARE",
    rarityColor: "#c4aaf0",
    shiny: false,
  },
  {
    name: "Charizard",
    spriteUrl: `${SPRITE_BASE}/shiny/6.png`,
    background: "radial-gradient(circle at 50% 70%, #ffd07a, #c44fe0 78%)",
    border: undefined as string | undefined,
    boxShadow: undefined as string | undefined,
    topOffset: -8,
    rarity: "✦ SHINY",
    rarityColor: "#fff",
    shiny: true,
  },
];

function MiniPackCard({
  name,
  spriteUrl,
  background,
  border,
  boxShadow,
  topOffset,
  rarity,
  rarityColor,
  shiny,
}: (typeof PACK_CARDS)[number]) {
  return (
    <div
      className={`relative flex-none overflow-hidden rounded-[13px]${shiny ? " animate-shiny-pulse" : ""}`}
      style={{
        width: "136px",
        height: "190px",
        background,
        border,
        boxShadow,
        top: topOffset !== 0 ? topOffset : undefined,
      }}
    >
      {/* Diagonal texture */}
      <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,rgba(255,255,255,0.04)_0_2px,transparent_2px_11px)]" />

      {/* Shimmer overlay (shiny only) */}
      {shiny && (
        <div className="pointer-events-none absolute inset-0 z-[2] animate-shimmer bg-[linear-gradient(115deg,transparent_38%,rgba(255,255,255,0.52)_50%,transparent_62%)] bg-[length:300%_100%]" />
      )}

      {/* ✦ sparkle (shiny only) */}
      {shiny && (
        <span className="absolute right-[9px] top-[8px] z-[3] text-[12px]">✦</span>
      )}

      {/* Artwork */}
      <div
        className="absolute left-1/2 z-[1] -translate-x-1/2"
        style={{ width: "76%", height: "52%", bottom: "32px" }}
      >
        <Image
          src={spriteUrl}
          alt={shiny ? `Shiny ${name}` : name}
          fill
          className="object-contain drop-shadow-[0_6px_12px_rgba(0,0,0,0.45)]"
          loading="lazy"
        />
      </div>

      {/* Name */}
      <span
        className="absolute left-[11px] z-[3] text-[12px] font-bold text-white"
        style={{
          bottom: "14px",
          textShadow: shiny ? "0 1px 3px rgba(0,0,0,0.3)" : undefined,
        }}
      >
        {name}
      </span>

      {/* Rarity */}
      <span
        className="absolute left-[11px] z-[3] text-[9px] tracking-[0.08em]"
        style={{
          bottom: "3px",
          color: rarityColor,
          fontWeight: shiny ? 800 : 700,
          textShadow: shiny ? "0 1px 3px rgba(0,0,0,0.4)" : undefined,
        }}
      >
        {rarity}
      </span>
    </div>
  );
}

export function PackTease() {
  return (
    <section className="mx-auto max-w-[1180px] px-[26px] pb-[90px]">
      {/* Inner promotional card */}
      <div
        className="relative grid grid-cols-1 gap-12 overflow-hidden rounded-[22px] p-8 md:grid-cols-[1fr_460px] md:gap-12 md:p-[48px_52px]"
        style={{
          background: "linear-gradient(120deg, #1a1626, #221836 50%, #1a1626)",
          border: "1px solid rgba(196,79,224,0.2)",
        }}
      >
        {/* Decorative glow orb */}
        <div
          className="pointer-events-none absolute rounded-full"
          style={{
            top: "-80px",
            right: "180px",
            width: "320px",
            height: "320px",
            background: "rgba(196,79,224,0.06)",
          }}
        />

        {/* Text column */}
        <div className="relative z-[1]">
          {/* Eyebrow badge */}
          <div
            className="mb-[18px] inline-flex h-[26px] items-center gap-[7px] rounded-[7px] px-[11px]"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,216,107,0.15), rgba(255,158,216,0.15))",
              border: "1px solid rgba(255,200,150,0.3)",
            }}
          >
            <span
              className="text-[11px] font-extrabold tracking-[0.1em] bg-[linear-gradient(90deg,#ffd86b,#ff9ed8)] bg-clip-text text-transparent"
            >
              ✦ FREE DAILY PACK
            </span>
          </div>

          {/* Heading */}
          <h2
            className="font-heading m-0 mb-[14px] text-[34px] font-extrabold leading-[1.1] tracking-[-0.025em]"
          >
            Open a pack,
            <br />
            every single day.
          </h2>

          {/* Body */}
          <p
            className="mb-[28px] max-w-[380px] text-[16px] leading-[1.65]"
            style={{ color: "#9aa0ab" }}
          >
            Three Pokémon per pack, free forever. Chase real 1-in-4,096 shiny
            odds, earn dust from duplicates, and track your pity counter across
            every pull.
          </p>

          {/* CTA */}
          <button
            className="h-12 cursor-pointer rounded-[12px] border-0 px-7 text-[15px] font-bold text-white"
            style={{
              background: "linear-gradient(135deg, #ff7a45, #c44fe0)",
              boxShadow: "0 8px 24px rgba(196,79,224,0.35)",
            }}
          >
            Claim your first pack
          </button>
        </div>

        {/* Pack cards column */}
        <div className="relative z-[1] flex items-end justify-center gap-3">
          {PACK_CARDS.map((card) => (
            <MiniPackCard key={card.name} {...card} />
          ))}
        </div>
      </div>
    </section>
  );
}
