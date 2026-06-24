const FEATURES = [
  {
    icon: "★",
    iconColor: "#ff9a6b",
    iconBg: "linear-gradient(135deg, rgba(255,122,69,0.2), rgba(196,79,224,0.2))",
    iconBorder: "1px solid rgba(255,122,69,0.3)",
    title: "Rate & Review",
    body: "Write in-depth reviews for every Pokémon across all nine generations. Build your personal ratings and share your takes with the community.",
  },
  {
    icon: "◆",
    iconColor: "#7fb6ff",
    iconBg: "linear-gradient(135deg, rgba(110,170,255,0.18), rgba(196,79,224,0.18))",
    iconBorder: "1px solid rgba(110,170,255,0.3)",
    title: "Daily Packs",
    body: "Unwrap a free pack of 3 Pokémon every day. Chase genuine 1-in-4,096 shinies, build your collection, and trade duplicates for dust.",
  },
  {
    icon: "≡",
    iconColor: "#5cb85c",
    iconBg: "linear-gradient(135deg, rgba(92,184,92,0.18), rgba(74,163,224,0.18))",
    iconBorder: "1px solid rgba(92,184,92,0.3)",
    title: "Lists & Discovery",
    body: 'Curate ranked lists like "Underrated Gen 1 Sweepers" or "Best Fairy designs." Follow trainers with your taste and see what\'s trending.',
  },
];

function FeatureCard({
  icon,
  iconColor,
  iconBg,
  iconBorder,
  title,
  body,
}: (typeof FEATURES)[number]) {
  return (
    <div
      className="rounded-[18px] p-7"
      style={{
        background: "#15181e",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div
        className="mb-[18px] flex size-12 items-center justify-center rounded-[13px] text-[22px]"
        style={{ background: iconBg, border: iconBorder, color: iconColor }}
      >
        {icon}
      </div>
      <h3 className="font-heading mb-[10px] text-[20px] font-bold">{title}</h3>
      <p className="text-[14.5px] leading-[1.65]" style={{ color: "#8b919e" }}>
        {body}
      </p>
    </div>
  );
}

export function FeaturesGrid() {
  return (
    <section className="mx-auto max-w-[1180px] px-[26px] pt-[90px]">
      <div className="mb-[50px] text-center">
        <h2 className="font-heading mb-3 text-[36px] font-bold tracking-[-0.025em]">
          Everything for the Pokémon enthusiast
        </h2>
        <p className="text-[17px] text-dim-foreground">One place to rate, collect, and obsess.</p>
      </div>
      <div className="mb-[90px] grid gap-[22px] md:grid-cols-3">
        {FEATURES.map((feature) => (
          <FeatureCard key={feature.title} {...feature} />
        ))}
      </div>
    </section>
  );
}
