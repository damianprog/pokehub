"use client";

import { useIsClient } from "@/hooks/use-is-client";

/**
 * The open time in the viewer's own time zone, which only the browser knows —
 * so it's left blank in the server HTML and filled in after hydration.
 */
export function PackOpenedAt({ openedAt }: { openedAt: string }) {
  const isClient = useIsClient();
  if (!isClient) return null;

  return (
    <>
      {new Date(openedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
    </>
  );
}
