import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getUserByUsername } from "@/lib/user";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileBioStats } from "@/components/profile/ProfileBioStats";
import { PLACEHOLDER_PROFILE_STATS } from "@/lib/placeholder-profile-stats";

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

  return (
    <div>
      <ProfileHeader
        name={user.name}
        username={username}
        image={user.image}
        joinedAt={user.createdAt}
      />
      <ProfileBioStats bio={user.bio} stats={PLACEHOLDER_PROFILE_STATS} />
    </div>
  );
}
