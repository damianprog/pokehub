import type { Rarity } from "@/generated/prisma/client";
import { PACK_SIZE, SHINY_RATE, TIER_WEIGHTS } from "@/lib/pack-config";

/** A source of numbers in [0, 1). Injectable so tests can force outcomes. */
export type RandomSource = () => number;

/** Every Pokémon id, grouped by its rarity tier. */
export type TierPools = Record<Rarity, number[]>;

export interface RolledSlot {
  position: number;
  pokemonId: number;
  rarity: Rarity;
  isShiny: boolean;
}

const TIERS = Object.keys(TIER_WEIGHTS) as Rarity[];
const TOTAL_WEIGHT = TIERS.reduce((sum, tier) => sum + TIER_WEIGHTS[tier], 0);

export function rollTier(random: RandomSource): Rarity {
  let roll = random() * TOTAL_WEIGHT;
  for (const tier of TIERS) {
    roll -= TIER_WEIGHTS[tier];
    if (roll < 0) return tier;
  }
  return TIERS[TIERS.length - 1];
}

function pickUniform(ids: number[], random: RandomSource): number {
  return ids[Math.min(Math.floor(random() * ids.length), ids.length - 1)];
}

/**
 * Rolls one pack: the tier first, then a uniform pick inside it, then an
 * independent shiny roll — so the tier distribution matches the weights no
 * matter how many Pokémon each tier holds. The same Pokémon may land twice.
 */
export function rollPack(pools: TierPools, random: RandomSource): RolledSlot[] {
  return Array.from({ length: PACK_SIZE }, (_, index) => {
    const rarity = rollTier(random);
    const pool = pools[rarity];
    if (pool.length === 0) throw new Error(`No Pokémon in the ${rarity} tier`);
    return {
      position: index + 1,
      pokemonId: pickUniform(pool, random),
      rarity,
      isShiny: random() < SHINY_RATE,
    };
  });
}
