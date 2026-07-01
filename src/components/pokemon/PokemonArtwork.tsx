import Image from "next/image";
import { TYPE_GRADIENTS, FALLBACK_GRADIENT } from "@/lib/type-gradients";

interface PokemonArtworkProps {
  id: number;
  name: string;
  artworkUrl: string;
  types: string[];
}

export function PokemonArtwork({ id, name, artworkUrl, types }: PokemonArtworkProps) {
  const { bg, shadow } = TYPE_GRADIENTS[types[0]?.toLowerCase()] ?? FALLBACK_GRADIENT;
  const dexNumber = `#${String(id).padStart(3, "0")}`;

  return (
    <div
      className="relative rounded-[22px] overflow-hidden aspect-square"
      style={{ background: bg, boxShadow: shadow }}
    >
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
        className="absolute top-[18px] left-[20px] font-['Space_Grotesk'] font-bold text-[88px] leading-none select-none"
        style={{ color: "rgba(255,255,255,0.09)" }}
      >
        {dexNumber}
      </span>

      {/* Artwork image — centering and animation on separate elements so transforms don't clobber each other */}
      <div
        className="absolute bottom-0 left-1/2 w-[88%] h-[88%]"
        style={{ transform: "translateX(-50%)" }}
      >
        <div
          className="relative w-full h-full"
          style={{
            animation: "floaty 5s ease-in-out infinite",
            filter: "drop-shadow(0 18px 44px rgba(0,0,0,0.5))",
          }}
        >
          <Image
            src={artworkUrl}
            alt={name}
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>
    </div>
  );
}
