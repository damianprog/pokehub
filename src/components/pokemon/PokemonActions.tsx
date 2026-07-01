export function PokemonActions() {
  return (
    <div className="mt-[14px] flex gap-[10px]">
      <button
        type="button"
        className="h-[42px] flex-1 rounded-[11px] bg-[linear-gradient(135deg,var(--brand-from),var(--brand-to))] text-[14px] font-bold text-white"
      >
        Write review
      </button>
      <button
        type="button"
        aria-label="Favorite"
        className="h-[42px] w-[46px] rounded-[11px] border border-white/10 bg-white/[0.06] text-[#e8a0c0]"
      >
        ♥
      </button>
      <button
        type="button"
        aria-label="Add to list"
        className="h-[42px] w-[46px] rounded-[11px] border border-white/10 bg-white/[0.06] text-[#9aa0ab]"
      >
        +
      </button>
    </div>
  );
}
