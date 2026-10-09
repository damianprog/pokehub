import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DEV_UNLOCK_ALL } from "@/lib/dev";
import { getTodaysDailyPack } from "@/lib/packs";
import { nextUtcMidnight } from "@/lib/utc-day";
import { PacksHeader } from "@/components/packs/PacksHeader";
import { PackStage } from "@/components/packs/PackStage";

export const metadata: Metadata = { title: "Packs — PokeHub" };

export default async function PacksPage() {
  const session = await auth();
  // proxy.ts already sends logged-out visitors to /sign-in; this keeps the
  // type narrow and covers a session that expired mid-navigation.
  if (!session?.user?.id) redirect("/sign-in");

  // Under DEV_UNLOCK_ALL the stage always starts closed, so packs can be
  // opened again and again (project-overview §10.2).
  const todayPack = DEV_UNLOCK_ALL ? null : await getTodaysDailyPack(session.user.id);
  const now = new Date();

  return (
    <div>
      <PacksHeader />
      <PackStage
        todayPack={todayPack}
        resetAt={nextUtcMidnight(now).getTime()}
        serverNow={now.getTime()}
      />
    </div>
  );
}
