"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { getPokedexMatchCount } from "@/lib/pokemon";
import { parsePokedexFilters } from "@/lib/pokedex-filters";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// A `pokedexQuery` string — far shorter than this in practice.
const querySchema = z.string().max(500);

/**
 * Match count for a Pokédex query string — the mobile filters sheet's live
 * "Show N Pokémon". Parsed exactly like the page, so the two never disagree.
 * Read-only, so it doesn't revalidate anything.
 */
export async function countPokedexMatches(query: string): Promise<ActionResult<number>> {
  const parsedQuery = querySchema.safeParse(query);
  if (!parsedQuery.success) {
    return { success: false, error: "Invalid request." };
  }

  const params = new URLSearchParams(parsedQuery.data);
  const session = await auth();
  const viewerId = session?.user?.id ?? null;

  const parsed = parsePokedexFilters({
    q: params.get("q") ?? undefined,
    type: params.get("type") ?? undefined,
    gen: params.get("gen") ?? undefined,
    rarity: params.get("rarity") ?? undefined,
    status: params.get("status") ?? undefined,
  });
  // As on the page: "My status" only exists for a signed-in viewer.
  const filters = viewerId ? parsed : { ...parsed, status: null };

  try {
    return { success: true, data: await getPokedexMatchCount(filters, viewerId) };
  } catch {
    return { success: false, error: "Couldn't count the matches." };
  }
}
