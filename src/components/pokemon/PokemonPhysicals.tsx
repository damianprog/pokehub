interface PokemonPhysicalsProps {
  height: number; // decimeters
  weight: number; // hectograms
  baseExperience: number | null;
}

export function PokemonPhysicals({
  height,
  weight,
  baseExperience,
}: PokemonPhysicalsProps) {
  const stats = [
    { label: "Height", value: `${(height / 10).toFixed(1)} m` },
    { label: "Weight", value: `${(weight / 10).toFixed(1)} kg` },
    { label: "Base XP", value: baseExperience?.toString() ?? "—" },
  ];

  return (
    <div className="mb-[16px] flex overflow-hidden rounded-[14px] border border-white/[0.06] bg-[#15181e] leading-[normal] md:mb-[22px]">
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className={`flex-1 px-[4px] py-[12px] text-center md:px-[18px] md:py-[14px] md:text-left ${i < stats.length - 1 ? "border-r border-white/[0.06]" : ""}`}
        >
          <div className="mb-1 text-[10.5px] font-semibold uppercase tracking-[0.06em] text-[#7b818c] md:text-[11px]">
            {stat.label}
          </div>
          <div className="font-heading text-[16px] font-bold md:text-[20px]">{stat.value}</div>
        </div>
      ))}
    </div>
  );
}
