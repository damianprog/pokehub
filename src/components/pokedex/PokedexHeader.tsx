interface PokedexHeaderProps {
  /** Total Pokémon count, or `null` while loading (renders a skeleton bar in its place). */
  total: number | null;
}

export function PokedexHeader({ total }: PokedexHeaderProps) {
  return (
    <div className="mb-[18px] flex items-end gap-[12px] md:mb-[22px]">
      <div className="min-w-0 flex-1">
        <h1 className="font-heading m-0 text-[28px] leading-[1.05] font-bold tracking-[-0.025em] md:text-[40px] md:tracking-[-0.03em]">
          Pokédex
        </h1>
        <div className="mt-[5px] text-[13px] text-[#8b919e] md:mt-[7px] md:text-[14px]">
          {total === null ? (
            // Inline-block inside the same line box as the real count, so the
            // skeleton → content swap doesn't shift the grid below.
            <span className="animate-skeleton inline-block h-[12px] w-[96px] rounded-[5px] bg-[linear-gradient(90deg,#1b1e25_0%,#252932_50%,#1b1e25_100%)] bg-[length:200%_100%] align-middle" />
          ) : (
            `${total.toLocaleString("en-US")} Pokémon`
          )}
        </div>
      </div>

      {/* Plain <a>, not <Link> — a full navigation so the browser follows the
          redirect from /api/pokemon/random and rolls a fresh Pokémon each click. */}
      <a
        href="/api/pokemon/random"
        title="Surprise me"
        aria-label="Surprise me"
        className="flex size-[44px] flex-none items-center justify-center gap-[8px] rounded-[12px] border border-white/[0.12] bg-white/[0.05] text-[19px] whitespace-nowrap text-[#e8eaed] hover:bg-white/[0.09] md:h-[44px] md:w-auto md:px-[18px] md:text-[14px] md:font-semibold"
      >
        <span className="leading-none md:text-[17px]">⚄</span>
        <span className="hidden md:inline">Surprise me</span>
      </a>
    </div>
  );
}
