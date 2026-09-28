interface PokedexGridProps {
  children: React.ReactNode;
}

/** Shared column layout for the Pokédex cards and their loading skeleton, so the two never drift apart. */
export function PokedexGrid({ children }: PokedexGridProps) {
  return (
    <div className="grid grid-cols-2 gap-[10px] sm:grid-cols-3 md:grid-cols-4 md:gap-[14px] lg:grid-cols-6">
      {children}
    </div>
  );
}
