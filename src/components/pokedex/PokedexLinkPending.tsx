"use client";

import { useLinkStatus } from "next/link";

/**
 * Rendered inside a filter `<Link>`: while that link's navigation is pending
 * it emits a hidden `data-pending` node, which the page's
 * `group-has-[[data-pending]]` reads to dim the results — the same signal
 * `PokedexSearch` sets for a pending search.
 */
export function PokedexLinkPending() {
  const { pending } = useLinkStatus();
  return pending ? <span hidden data-pending /> : null;
}
