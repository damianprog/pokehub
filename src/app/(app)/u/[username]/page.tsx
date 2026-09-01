import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getUserByUsername } from "@/lib/user";
import { getPokemonsByIds } from "@/lib/pokemon";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileBioStats } from "@/components/profile/ProfileBioStats";
import { SignatureTeam } from "@/components/profile/SignatureTeam";
import { PLACEHOLDER_PROFILE_STATS } from "@/lib/placeholder-profile-stats";
import { PLACEHOLDER_SIGNATURE_TEAM } from "@/lib/placeholder-signature-team";

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
    </div>
  );
}
