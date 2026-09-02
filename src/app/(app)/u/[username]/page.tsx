import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getUserByUsername } from "@/lib/user";
import { getPokemonsByIds } from "@/lib/pokemon";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileBioStats } from "@/components/profile/ProfileBioStats";
import { SignatureTeam } from "@/components/profile/SignatureTeam";
import { RecentActivity } from "@/components/profile/RecentActivity";
import { FavoriteTypes } from "@/components/profile/FavoriteTypes";
import { PLACEHOLDER_PROFILE_STATS } from "@/lib/placeholder-profile-stats";
import { PLACEHOLDER_SIGNATURE_TEAM } from "@/lib/placeholder-signature-team";
import { PLACEHOLDER_RECENT_ACTIVITY } from "@/lib/placeholder-recent-activity";
import { PLACEHOLDER_FAVORITE_TYPES } from "@/lib/placeholder-favorite-types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const user = await getUserByUsername(username);
  return {
    title: user ? `${user.name ?? user.username} (@${username}) — PokeHub` : "Profile — PokeHub",
  };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const user = await getUserByUsername(username);
  if (!user) notFound();

  const signatureTeamPokemons = await getPokemonsByIds(
    PLACEHOLDER_SIGNATURE_TEAM.map((member) => member.pokemonId),
  );
  const signatureTeam = PLACEHOLDER_SIGNATURE_TEAM.map((member) => {
    const pokemon = signatureTeamPokemons.find((p) => p.id === member.pokemonId)!;
    return {
      id: pokemon.id,
      slug: pokemon.slug,
      name: pokemon.name,
      types: pokemon.types,
      artworkUrl: pokemon.artworkUrl,
      rating: member.rating,
    };
  });

  const recentActivityPokemons = await getPokemonsByIds(
    PLACEHOLDER_RECENT_ACTIVITY.map((item) => item.pokemonId),
  );
  const recentActivity = PLACEHOLDER_RECENT_ACTIVITY.map((item) => {
    const pokemon = recentActivityPokemons.find((p) => p.id === item.pokemonId)!;
    return {
      id: pokemon.id,
      slug: pokemon.slug,
      name: pokemon.name,
      types: pokemon.types,
      artworkUrl: pokemon.artworkUrl,
      timeLabel: item.timeLabel,
      rating: item.rating,
      quote: item.quote,
    };
  });

  return (
    <div>
      <ProfileHeader
        name={user.name}
        username={username}
        image={user.image}
        joinedAt={user.createdAt}
      />
      <ProfileBioStats bio={user.bio} stats={PLACEHOLDER_PROFILE_STATS} />
      <SignatureTeam team={signatureTeam} />
      <div className="mt-[34px] grid grid-cols-1 gap-[20px] px-[16px] md:px-[26px] lg:grid-cols-[1fr_320px] lg:items-start lg:gap-[28px]">
        <RecentActivity activity={recentActivity} />
        <FavoriteTypes
          types={PLACEHOLDER_FAVORITE_TYPES.types}
          avgRating={PLACEHOLDER_FAVORITE_TYPES.avgRating}
          collectionCaught={PLACEHOLDER_FAVORITE_TYPES.collectionCaught}
          collectionTotal={PLACEHOLDER_FAVORITE_TYPES.collectionTotal}
        />
      </div>
    </div>
  );
}
