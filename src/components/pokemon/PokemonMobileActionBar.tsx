export function PokemonMobileActionBar() {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 flex gap-[10px] border-t border-white/[0.07] bg-background/[0.9] px-4 pt-[12px] backdrop-blur-[14px]"
      style={{ paddingBottom: "calc(12px + env(safe-area-inset-bottom))" }}
    >
      <button
        type="button"
        aria-label="Add to list"
        className="h-[46px] w-[46px] flex-none rounded-[12px] border border-white/10 bg-white/[0.05] text-[18px] text-[#9aa0ab]"
      >
        +
      </button>
      <button
        type="button"
        className="h-[46px] flex-1 rounded-[12px] bg-[linear-gradient(135deg,var(--brand-from),var(--brand-to))] text-[15px] font-bold text-white shadow-[0_6px_18px_rgba(196,79,224,0.32)]"
      >
        Write review
      </button>
    </div>
  );
}
