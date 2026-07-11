interface PokemonMobileTopBarProps {
  name: string;
}

export function PokemonMobileTopBar({ name }: PokemonMobileTopBarProps) {
  return (
    <header className="sticky top-0 z-50 -mx-4 -mt-[30px] flex h-[56px] items-center gap-3 border-b border-white/[0.06] bg-background/[0.78] px-[14px] backdrop-blur-[14px] sm:-mx-[26px] md:hidden">
      <button
        type="button"
        aria-label="Back"
        className="flex size-9 flex-none items-center justify-center rounded-[10px] bg-white/[0.06] text-[17px] text-foreground"
      >
        ←
      </button>
      <div className="min-w-0 flex-1 truncate font-heading text-[15px] font-bold">{name}</div>
      <button
        type="button"
        aria-label="More options"
        className="flex size-9 flex-none items-center justify-center rounded-[10px] bg-white/[0.06] text-[17px] text-[#9aa0ab]"
      >
        ⋯
      </button>
    </header>
  );
}
