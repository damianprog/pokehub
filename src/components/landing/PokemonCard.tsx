import Image from "next/image";
import { cn } from "@/lib/utils";

export function PokemonCard({
  name,
  caption,
  spriteUrl,
  background,
  captionColor,
  shiny = false,
  className,
}: {
  name: string;
  caption: string;
  spriteUrl: string;
  background: string;
  captionColor: string;
  shiny?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl shadow-[0_18px_50px_rgba(0,0,0,0.45)]",
        shiny && "animate-shiny-pulse",
        className
      )}
      style={{ background }}
    >
      <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,rgba(255,255,255,0.04)_0_2px,transparent_2px_11px)]" />
      {shiny && (
        <div className="absolute inset-0 z-2 bg-[linear-gradient(115deg,transparent_38%,rgba(255,255,255,0.52)_50%,transparent_62%)] bg-[length:300%_100%] animate-shimmer" />
      )}
      <Image
        src={spriteUrl}
        alt={shiny ? `Shiny ${name}` : name}
        width={210}
        height={210}
        className="absolute bottom-[15%] left-1/2 z-1 h-[56%] w-[78%] -translate-x-1/2 object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]"
      />
      <span className="absolute bottom-5 left-3.5 z-3 text-[15px] font-bold text-white">
        {name}
      </span>
      <span
        className="absolute bottom-1.5 left-3.5 z-3 text-[10px] font-bold tracking-wider"
        style={{ color: captionColor }}
      >
        {caption}
      </span>
    </div>
  );
}
