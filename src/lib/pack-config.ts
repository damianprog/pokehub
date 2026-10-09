import type { Rarity } from "@/generated/prisma/client";

// Every pack parameter lives here so tuning is a one-file change
// (project-overview §4: "every parameter below is tunable post-launch").

/** Pokémon per pack. */
export const PACK_SIZE = 3;

/** Per-slot tier weights (§4.1). Relative weights, not required to sum to 100. */
export const TIER_WEIGHTS: Record<Rarity, number> = {
  COMMON: 70,
  UNCOMMON: 20,
  RARE: 9,
  ULTRA_RARE: 1,
};

/** Independent shiny chance per slot, applied after the tier (§4.1). */
export const SHINY_RATE = 0.005;
