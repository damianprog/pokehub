import Image from "next/image";
import { TYPE_GRADIENTS, FALLBACK_GRADIENT } from "@/lib/type-gradients";
import { FavoriteButton } from "@/components/pokemon/FavoriteButton";

interface PokemonMobileHeroProps {
  id: number;
  slug: string;
  name: string;
  artworkUrl: string;
  types: string[];
  isAuthenticated: boolean;
  initialIsFavorite: boolean;
}

export function PokemonMobileHero({
  id,
  slug,
  name,
  artworkUrl,
  types,
  isAuthenticated,
  initialIsFavorite,
}: PokemonMobileHeroProps) {
  const { bg } = TYPE_GRADIENTS[types[0]?.toLowerCase()] ?? FALLBACK_GRADIENT;
  const dexNumber = `#${String(id).padStart(3, "0")}`;

  return (
    <div className="relative aspect-[1/0.86] overflow-hidden" style={{ background: bg }}>
      {/* Crosshatch texture overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg,rgba(255,255,255,0.05) 0 2px,transparent 2px 11px)",
        }}
      />

      {/* Pokédex number watermark */}
      <span
        className="absolute top-[6px] left-[18px] font-['Space_Grotesk'] font-bold text-[64px] leading-none select-none"
        style={{ color: "rgba(255,255,255,0.09)" }}
      >
        {dexNumber}
      </span>

      {/* Artwork image — centering and animation on separate elements so transforms don't clobber each other */}
      <div
        className="absolute bottom-0 left-1/2 w-[74%] h-[74%]"
        style={{ transform: "translateX(-50%)" }}
      >
        <div
          className="relative w-full h-full"
          style={{
            animation: "floaty 5s ease-in-out infinite",
            filter: "drop-shadow(0 16px 36px rgba(0,0,0,0.5))",
          }}
        >
          <Image src={artworkUrl} alt={name} fill className="object-contain" priority />
        </div>
      </div>

      <FavoriteButton
        pokemonId={id}
        slug={slug}
        pokemonName={name}
        isAuthenticated={isAuthenticated}
        initialIsFavorite={initialIsFavorite}
        className="absolute top-[14px] right-[14px] flex size-[42px] items-center justify-center rounded-full bg-background/[0.55] text-[18px] backdrop-blur-[6px]"
      />
    </div>
  );
}
