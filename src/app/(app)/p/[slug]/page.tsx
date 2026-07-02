import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPokemon } from "@/lib/pokemon";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { PokemonArtwork } from "@/components/pokemon/PokemonArtwork";
import { PokemonActions } from "@/components/pokemon/PokemonActions";
import { PokemonHeader } from "@/components/pokemon/PokemonHeader";
import { PokemonPhysicals } from "@/components/pokemon/PokemonPhysicals";
import { CommunityRating } from "@/components/pokemon/CommunityRating";
import { RateRow } from "@/components/pokemon/RateRow";

// Placeholder rating data — no rating/review feature exists yet, so
// UserPokemon.rating has zero real rows. Replace with a real aggregation
// query once that feature is built (see community-rating-spec.md §4, §7).
const PLACEHOLDER_RATING = {
  average: 4.3,
  totalRatings: 8412,
  distribution: [
    { stars: 5 as const, count: 4883 },
    { stars: 4 as const, count: 2019 },
    { stars: 3 as const, count: 841 },
    { stars: 2 as const, count: 421 },
    { stars: 1 as const, count: 248 },
  ],
};

// Placeholder rate-row stats — rank-within-type, list membership, and like
// counts have no backing data yet (rating/review, Lists, and ReviewLike
// features are all unbuilt). Replace with real values once those ship
// (see rate-row-spec.md §4, §8).
const PLACEHOLDER_RATE_ROW = {
  rank: 3,
  typeLabel: "Fire",
  listCount: 1240,
  likeCount: 6109,
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const pokemon = await getPokemon(slug);
  return { title: pokemon ? `${pokemon.name} — PokeHub` : "Pokémon — PokeHub" };
}

export default async function PokemonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pokemon = await getPokemon(slug);
  if (!pokemon) notFound();

  const primaryType = pokemon.types[0];
  const typeLabel = primaryType.charAt(0).toUpperCase() + primaryType.slice(1);

  return (
    <div>
      <div className="mb-[18px]">
        <Breadcrumb
          items={[
            { label: "Browse", href: "/discover" },
            { label: typeLabel },
            { label: pokemon.name },
          ]}
        />
      </div>
      <div className="grid gap-[34px] items-start" style={{ gridTemplateColumns: "392px 1fr" }}>
        <div className="sticky top-[90px]">
          <PokemonArtwork
            id={pokemon.id}
            name={pokemon.name}
            artworkUrl={pokemon.artworkUrl}
            types={pokemon.types}
          />
          <PokemonActions />
        </div>
        <div>
          <PokemonHeader id={pokemon.id} name={pokemon.name} types={pokemon.types} />
          <PokemonPhysicals
            height={pokemon.height}
            weight={pokemon.weight}
            baseExperience={pokemon.baseExperience}
          />
          <CommunityRating
            average={PLACEHOLDER_RATING.average}
            totalRatings={PLACEHOLDER_RATING.totalRatings}
            distribution={PLACEHOLDER_RATING.distribution}
          />
          <RateRow
            rank={PLACEHOLDER_RATE_ROW.rank}
            typeLabel={PLACEHOLDER_RATE_ROW.typeLabel}
            listCount={PLACEHOLDER_RATE_ROW.listCount}
            likeCount={PLACEHOLDER_RATE_ROW.likeCount}
          />
          {/* remaining info column sections — next iterations */}
        </div>
      </div>
    </div>
  );
}
