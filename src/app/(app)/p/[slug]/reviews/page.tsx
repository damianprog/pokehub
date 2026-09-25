import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { getPokemon } from "@/lib/pokemon";
import {
  getUserPokemonState,
  getPokemonRatingStats,
  getAllReviews,
  REVIEW_SORT_OPTIONS,
  REVIEWS_PAGE_SIZE,
  type ReviewSortOption,
} from "@/lib/user-pokemon";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { PokemonMobileTopBar } from "@/components/pokemon/PokemonMobileTopBar";
import { PokemonReviewsHeader } from "@/components/pokemon/PokemonReviewsHeader";
import { CommunityRating } from "@/components/pokemon/CommunityRating";
import { WriteReviewButton } from "@/components/pokemon/WriteReviewButton";
import { ReviewSortChips } from "@/components/pokemon/ReviewSortChips";
import { PokemonReviewsList } from "@/components/pokemon/PokemonReviewsList";
import { ReviewComposer } from "@/components/pokemon/ReviewComposer";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const pokemon = await getPokemon(slug);
  return { title: pokemon ? `${pokemon.name} reviews — PokeHub` : "Pokémon — PokeHub" };
}

function parseSort(value: string | undefined): ReviewSortOption {
  return REVIEW_SORT_OPTIONS.includes(value as ReviewSortOption)
    ? (value as ReviewSortOption)
    : "newest";
}

function parseCount(value: string | undefined): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : REVIEWS_PAGE_SIZE;
}

export default async function PokemonReviewsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string; count?: string }>;
}) {
  const { slug } = await params;
  const pokemon = await getPokemon(slug);
  if (!pokemon) notFound();

  const resolvedSearchParams = await searchParams;
  const sort = parseSort(resolvedSearchParams.sort);
  const count = parseCount(resolvedSearchParams.count);

  const session = await auth();
  const userId = session?.user?.id;
  const isAuthenticated = Boolean(userId);
  const userState = userId
    ? await getUserPokemonState(userId, pokemon.id)
    : { rating: null, reviewText: null, reviewedAt: null, isFavorite: false, isWishlist: false };
  // Signed-out visitors never see the composer (the CTA opens the auth modal
  // instead), so the fallback only satisfies the prop type.
  const username = session?.user?.username ?? "you";

  const [ratingStats, allReviews] = await Promise.all([
    getPokemonRatingStats(pokemon.id),
    getAllReviews(pokemon.id, userId, sort, count),
  ]);

  const primaryType = pokemon.types[0];
  const typeLabel = primaryType.charAt(0).toUpperCase() + primaryType.slice(1);

  return (
    <div>
      <PokemonMobileTopBar name="Reviews" backHref={`/p/${pokemon.slug}`} />

      <div className="mb-[14px] md:mb-[18px]">
        <Breadcrumb
          items={[
            { label: "Pokedex", href: "/discover" },
            { label: typeLabel },
            { label: pokemon.name, href: `/p/${pokemon.slug}` },
            { label: "Reviews" },
          ]}
        />
      </div>

      <PokemonReviewsHeader
        id={pokemon.id}
        name={pokemon.name}
        types={pokemon.types}
        artworkUrl={pokemon.artworkUrl}
        totalReviewCount={allReviews.totalReviewCount}
        average={ratingStats.average}
        isAuthenticated={isAuthenticated}
      />

      <CommunityRating
        average={ratingStats.average}
        totalRatings={ratingStats.totalRatings}
        distribution={ratingStats.distribution}
      />

      <WriteReviewButton
        isAuthenticated={isAuthenticated}
        className="mb-[16px] flex h-[46px] w-full items-center justify-center rounded-[12px] text-[15px] shadow-[0_8px_24px_rgba(196,79,224,0.32)] md:hidden"
      />

      <ReviewSortChips slug={pokemon.slug} activeSort={sort} />

      <PokemonReviewsList
        pokemonId={pokemon.id}
        slug={pokemon.slug}
        pokemonName={pokemon.name}
        ownReview={allReviews.ownReview}
        reviews={allReviews.reviews}
        isAuthenticated={isAuthenticated}
        hasMore={allReviews.hasMore}
        sort={sort}
        count={count}
      />

      <ReviewComposer
        pokemonId={pokemon.id}
        slug={pokemon.slug}
        pokemonName={pokemon.name}
        primaryType={primaryType}
        artworkUrl={pokemon.artworkUrl}
        initialRating={userState.rating}
        initialReviewText={userState.reviewText}
        username={username}
      />
    </div>
  );
}
