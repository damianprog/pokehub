import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PokemonCard } from "@/components/landing/PokemonCard";

const SPRITE_BASE =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork";

export function Hero() {
  return (
    <section className="mx-auto grid w-full max-w-[1180px] grid-cols-1 items-center gap-12 px-4 py-14 sm:px-[26px] lg:grid-cols-[1fr_500px] lg:gap-[60px] lg:py-[88px]">
      {/* Text column */}
      <div>
        <div className="mb-7 inline-flex h-7 items-center gap-2 rounded-lg border border-brand-to/25 bg-brand-to/10 px-[13px]">
          <span className="size-1.5 shrink-0 rounded-full bg-brand-to" />
          <span className="text-xs font-bold tracking-wide text-[#d88ef0]">
            214,000 trainers &amp; counting
          </span>
        </div>

        <h1 className="mb-5 font-heading text-[40px] leading-[1.07] font-extrabold tracking-tight sm:text-[58px]">
          Rate every
          <br />
          Pokémon.
          <br />
          <span className="bg-[linear-gradient(92deg,var(--brand-from),var(--brand-to)_60%)] bg-clip-text text-transparent">
            Chase every shiny.
          </span>
        </h1>

        <p className="mb-8 max-w-[430px] text-lg leading-relaxed text-muted-foreground">
          The community Pokédex — write reviews, build ranked lists, open
          daily packs, and track your shiny luck across all 1,302.
        </p>

        <div className="mb-10 flex flex-wrap gap-3">
          <Button
            size="lg"
            className="h-[50px] rounded-[13px] border-0 bg-[linear-gradient(135deg,var(--brand-from),var(--brand-to))] px-[30px] text-base font-bold text-white shadow-[0_8px_26px_rgba(196,79,224,0.38)] hover:brightness-110"
          >
            Start for free
          </Button>
          <Button
            render={<Link href="/discover" />}
            nativeButton={false}
            variant="outline"
            size="lg"
            className="h-[50px] rounded-[13px] px-[26px] text-base font-semibold"
          >
            Browse Pokedex
          </Button>
        </div>

        <div className="flex items-center gap-7">
          <Stat value="8.4M" label="reviews written" />
          <Divider />
          <Stat value="1,302" label="Pokémon rated" />
          <Divider />
          <Stat value="1 in 4,096" label="shiny odds" />
        </div>
      </div>

      {/* Card stack visual — desktop only, decorative */}
      <div className="relative hidden h-[440px] w-[500px] lg:block">
        <PokemonCard
          name="Gengar"
          caption="GHOST · RARE"
          spriteUrl={`${SPRITE_BASE}/94.png`}
          background="radial-gradient(circle at 50% 65%, #8b6fd4, #2e1e5a)"
          captionColor="#c4aaf0"
          className="absolute top-[50px] left-[38px] h-[272px] w-[195px] -rotate-[9deg] opacity-70"
        />
        <PokemonCard
          name="Gardevoir"
          caption="FAIRY · ULTRA RARE"
          spriteUrl={`${SPRITE_BASE}/282.png`}
          background="radial-gradient(circle at 50% 65%, #e89ec8, #7a2a6a)"
          captionColor="#e8c4d8"
          className="absolute top-[38px] right-[28px] h-[272px] w-[195px] rotate-[8deg] opacity-70"
        />
        <div className="absolute top-[14px] left-1/2 z-10 -translate-x-1/2 animate-float">
          <PokemonCard
            name="Charizard"
            caption="✦ SHINY · ULTRA RARE"
            spriteUrl={`${SPRITE_BASE}/shiny/6.png`}
            background="radial-gradient(circle at 50% 72%, #ffd07a, #c44fe0 78%)"
            captionColor="#ffffff"
            shiny
            className="h-[294px] w-[210px] rounded-[18px] shadow-[0_28px_64px_rgba(196,79,224,0.48)]"
          />
        </div>

        {/* Notification pill */}
        <div className="absolute bottom-[18px] left-1/2 z-20 flex h-[34px] -translate-x-1/2 items-center gap-2 rounded-[10px] border border-[#ffd86b]/40 bg-[#10131a]/95 px-[14px] whitespace-nowrap shadow-[0_8px_24px_rgba(0,0,0,0.45)]">
          <span className="text-xs text-gold">✦</span>
          <span className="text-sm font-bold text-white">Shiny pull!</span>
          <span className="text-sm text-muted-foreground">damian ·</span>
          <span className="text-xs font-semibold text-[#ffc88a]">
            1 in 4,096
          </span>
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-heading text-[22px] font-bold tracking-tight">
        {value}
      </div>
      <div className="mt-0.5 text-[13px] text-dim-foreground">{label}</div>
    </div>
  );
}

function Divider() {
  return <div className="h-9 w-px bg-border" />;
}
