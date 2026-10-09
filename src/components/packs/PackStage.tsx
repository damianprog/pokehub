"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { openDailyPackAction } from "@/actions/packs";
import { runAction } from "@/lib/run-action";
import type { OpenedPack } from "@/lib/packs";
import { PackStageCard } from "@/components/packs/PackStageCard";
import { PackClosedView } from "@/components/packs/PackClosedView";
import { PackRevealView } from "@/components/packs/PackRevealView";
import { PackTodayView } from "@/components/packs/PackTodayView";

interface PackStageProps {
  /** Today's daily pack from the server, or `null` while it's still unopened. */
  todayPack: OpenedPack | null;
  /** The next 00:00 UTC, in epoch ms. */
  resetAt: number;
  serverNow: number;
}

/**
 * The stage's daily-pack states. A pack opened here is kept in local state so
 * its reveal survives the `/packs` revalidation that lands with the action's
 * response; the server's `todayPack` covers every later visit.
 */
export function PackStage({ todayPack, resetAt, serverNow }: PackStageProps) {
  const router = useRouter();
  const [revealed, setRevealed] = useState<OpenedPack | null>(null);
  const [failed, setFailed] = useState(false);
  const [isOpening, startOpening] = useTransition();

  function handleOpen() {
    setFailed(false);
    startOpening(async () => {
      const result = await runAction(openDailyPackAction());
      if (result.success) {
        setRevealed(result.data);
        return;
      }
      if ("alreadyOpened" in result && result.alreadyOpened) {
        // Opened in another tab: the refreshed page shows that pack instead.
        toast.error(result.error);
        router.refresh();
        return;
      }
      setFailed(true);
    });
  }

  let view;
  if (revealed) {
    view = <PackRevealView pack={revealed} resetAt={resetAt} serverNow={serverNow} />;
  } else if (todayPack) {
    view = <PackTodayView pack={todayPack} resetAt={resetAt} serverNow={serverNow} />;
  } else {
    view = (
      <PackClosedView phase={isOpening ? "opening" : failed ? "error" : "idle"} onOpen={handleOpen} />
    );
  }

  return <PackStageCard>{view}</PackStageCard>;
}
