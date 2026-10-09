"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMinuteClock } from "@/hooks/use-minute-clock";

const MINUTE = 60 * 1000;

interface PackCountdownProps {
  /** The next 00:00 UTC, in epoch ms. */
  resetAt: number;
  /** When the server rendered, in epoch ms, so hydration matches. */
  serverNow: number;
}

/** "Xh Ym" until the daily reset. At zero it refreshes the route rather than switching state itself. */
export function PackCountdown({ resetAt, serverNow }: PackCountdownProps) {
  const router = useRouter();
  const now = useMinuteClock(serverNow);
  const minutesLeft = Math.max(0, Math.ceil((resetAt - now) / MINUTE));

  useEffect(() => {
    if (minutesLeft === 0) router.refresh();
  }, [minutesLeft, router]);

  return <>{`${Math.floor(minutesLeft / 60)}h ${minutesLeft % 60}m`}</>;
}
