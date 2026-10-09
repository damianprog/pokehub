"use client";

import { useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}

/**
 * False during server rendering and hydration, true afterwards — for output
 * that depends on the browser (like the viewer's time zone) and would
 * otherwise mismatch the server HTML.
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
