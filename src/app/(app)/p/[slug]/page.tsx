import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPokemon } from "@/lib/pokemon";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { PokemonArtwork } from "@/components/pokemon/PokemonArtwork";
import { PokemonActions } from "@/components/pokemon/PokemonActions";
import { PokemonHeader } from "@/components/pokemon/PokemonHeader";
import { PokemonPhysicals } from "@/components/pokemon/PokemonPhysicals";
import { CommunityRating } from "@/components/pokemon/CommunityRating";

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
          {/* remaining info column sections — next iterations */}
        </div>
      </div>
    </div>
  );
}
