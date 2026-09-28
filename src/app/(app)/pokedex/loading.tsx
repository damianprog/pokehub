import { PokedexHeader } from "@/components/pokedex/PokedexHeader";
import { PokedexSearchPlaceholder } from "@/components/pokedex/PokedexSearchPlaceholder";
import { PokedexGrid } from "@/components/pokedex/PokedexGrid";
import { PokedexCardSkeleton } from "@/components/pokedex/PokedexCardSkeleton";

const DESKTOP_PLACEHOLDERS = 12;
const MOBILE_PLACEHOLDERS = 6;

export default function PokedexLoading() {
  return (
    <div>
      <PokedexHeader total={null} search={<PokedexSearchPlaceholder />} />
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
