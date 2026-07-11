import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPokemon } from "@/lib/pokemon";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { PokemonArtwork } from "@/components/pokemon/PokemonArtwork";
import { PokemonActions } from "@/components/pokemon/PokemonActions";
import { PokemonMobileTopBar } from "@/components/pokemon/PokemonMobileTopBar";
import { PokemonMobileHero } from "@/components/pokemon/PokemonMobileHero";
import { PokemonMobileActionBar } from "@/components/pokemon/PokemonMobileActionBar";
import { PokemonHeader } from "@/components/pokemon/PokemonHeader";
import { PokemonPhysicals } from "@/components/pokemon/PokemonPhysicals";
import { CommunityRating } from "@/components/pokemon/CommunityRating";
import { RateRow } from "@/components/pokemon/RateRow";
import { BaseStats } from "@/components/pokemon/BaseStats";
import { TopReviews } from "@/components/pokemon/TopReviews";
import { AppearsInLists } from "@/components/pokemon/AppearsInLists";
import { PLACEHOLDER_RATING } from "@/lib/placeholder-rating";
import { PLACEHOLDER_RATE_ROW } from "@/lib/placeholder-rate-row";
import { PLACEHOLDER_TOP_REVIEWS } from "@/lib/placeholder-top-reviews";
import { PLACEHOLDER_APPEARS_IN_LISTS } from "@/lib/placeholder-appears-in-lists";

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
      <PokemonMobileTopBar name={pokemon.name} />

      <div className="-mx-4 mb-[18px] sm:-mx-[26px] md:hidden">
        <PokemonMobileHero
          id={pokemon.id}
          name={pokemon.name}
          artworkUrl={pokemon.artworkUrl}
          types={pokemon.types}
        />
      </div>

      <div className="mb-[18px] hidden md:block">
        <Breadcrumb
          items={[
            { label: "Browse", href: "/discover" },
            { label: typeLabel },
            { label: pokemon.name },
          ]}
        />
      </div>

      <div className="grid items-start gap-[34px] md:grid-cols-[392px_1fr]">
        <div className="sticky top-[90px] hidden md:block">
          <PokemonArtwork
            id={pokemon.id}
            name={pokemon.name}
            artworkUrl={pokemon.artworkUrl}
            types={pokemon.types}
          />
          <PokemonActions />
        </div>
        <div className="min-w-0 pb-[90px] md:pb-0">
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
          <BaseStats
            stats={{
              hp: pokemon.hp,
              attack: pokemon.attack,
              defense: pokemon.defense,
              spAttack: pokemon.spAttack,
              spDefense: pokemon.spDefense,
              speed: pokemon.speed,
            }}
          />
          <TopReviews
            totalReviewCount={PLACEHOLDER_TOP_REVIEWS.totalReviewCount}
            reviews={PLACEHOLDER_TOP_REVIEWS.reviews}
          />
          <AppearsInLists lists={PLACEHOLDER_APPEARS_IN_LISTS.lists} />
        </div>
      </div>

      <div className="md:hidden">
        <PokemonMobileActionBar />
      </div>
    </div>
  );
}
