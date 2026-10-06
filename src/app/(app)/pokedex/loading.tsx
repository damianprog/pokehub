import { auth } from "@/auth";
import { PokedexHeader } from "@/components/pokedex/PokedexHeader";
import { PokedexSearchPlaceholder } from "@/components/pokedex/PokedexSearchPlaceholder";
import { PokedexFilterPanel } from "@/components/pokedex/PokedexFilterPanel";
import { PokedexMobileSortRow } from "@/components/pokedex/PokedexMobileSortRow";
import { PokedexActiveFilters } from "@/components/pokedex/PokedexActiveFilters";
import { PokedexGrid } from "@/components/pokedex/PokedexGrid";
import { PokedexCardSkeleton } from "@/components/pokedex/PokedexCardSkeleton";

const DESKTOP_PLACEHOLDERS = 12;
const MOBILE_PLACEHOLDERS = 6;

// Reads the session only to decide whether the skeleton's Refine row includes
// "My status" — a cookie read, no database round trip, so the skeleton stays instant.
export default async function PokedexLoading() {
  const session = await auth();

  return (
    <div>
      <PokedexHeader total={null} search={<PokedexSearchPlaceholder />} />
      <PokedexFilterPanel filters={null} signedIn={Boolean(session?.user?.id)} />
      <PokedexMobileSortRow filters={null} />
      <PokedexActiveFilters filters={null} total={null} matches={null} />
      <PokedexGrid>
        {Array.from({ length: DESKTOP_PLACEHOLDERS }, (_, index) => (
          <PokedexCardSkeleton
            key={index}
            className={index >= MOBILE_PLACEHOLDERS ? "max-md:hidden" : ""}
          />
        ))}
      </PokedexGrid>
    </div>
  );
}
