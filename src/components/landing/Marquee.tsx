import Image from "next/image";

const SPRITE_BASE =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork";

const ITEMS = [
  { name: "Charizard", id: 6, gradient: "#ff8a4c, #a83a1a", rating: "4.3" },
  { name: "Gengar", id: 94, gradient: "#8b6fd4, #2e1e5a", rating: "4.6" },
  { name: "Dragonite", id: 149, gradient: "#e6a84a, #8a5a20", rating: "4.7" },
  { name: "Gardevoir", id: 282, gradient: "#e89ec8, #7a2a6a", rating: "4.4" },
  { name: "Rayquaza", id: 384, gradient: "#2aaa6a, #1a5a3a", rating: "4.8" },
  { name: "Garchomp", id: 445, gradient: "#6a5acd, #3a2a7a", rating: "4.5" },
  { name: "Gyarados", id: 130, gradient: "#4aa3e0, #2a5a8a", rating: "4.5" },
  { name: "Espeon", id: 196, gradient: "#c88ae8, #7a3a9a", rating: "4.2" },
  { name: "Ho-oh", id: 250, gradient: "#ff9a3a, #b84a20", rating: "4.6" },
  { name: "Snorlax", id: 143, gradient: "#b8a878, #6a5838", rating: "4.4" },
  { name: "Mimikyu", id: 778, gradient: "#e89ec8, #4a2a5a", rating: "4.4" },
  { name: "Tyranitar", id: 248, gradient: "#7a8a9a, #3a4654", rating: "4.3" },
];

function MarqueeItem({ name, id, gradient }: { name: string; id: number; gradient: string }) {
  return (
    <div className="flex shrink-0 items-center gap-[10px] px-[14px]">
      <div
        className="relative size-[42px] shrink-0 overflow-hidden rounded-[10px]"
        style={{ background: `radial-gradient(circle at 50% 60%, ${gradient})` }}
      >
        <Image
          src={`${SPRITE_BASE}/${id}.png`}
          alt={name}
          fill
          className="object-contain p-[3px]"
          loading="lazy"
        />
      </div>
      <div>
        <div className="font-heading text-[13px] font-bold whitespace-nowrap">{name}</div>
        <div className="text-[11.5px] font-bold text-gold">
          ★ {ITEMS.find((i) => i.id === id)?.rating}
        </div>
      </div>
    </div>
  );
}

function Divider() {
  return <div className="h-9 w-px shrink-0 self-center bg-border" />;
}

function ItemSet() {
  return (
    <>
      {ITEMS.map((item, i) => (
        <div key={i} className="flex shrink-0 items-center">
          <MarqueeItem {...item} />
          <Divider />
        </div>
      ))}
    </>
  );
}

export function Marquee() {
  return (
    <div className="w-full overflow-hidden border-y border-white/[0.06] bg-white/[0.015] py-[14px]">
      <div className="flex w-max animate-scroll-left gap-2">
        <ItemSet />
        <ItemSet />
      </div>
    </div>
  );
}
