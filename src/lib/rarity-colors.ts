// Card colors for the tiers that get their own look regardless of type (Claude
// Design: teal for Rare, gold for Ultra rare). Common cards use their type's
// colors, and Uncommon has no distinct treatment in the design yet.
export const RARITY_CARD_COLORS = {
  RARE: {
    gradient: "#2fae9a, #0f3a36",
    border: "rgba(63,217,170,0.38)",
    glow: "rgba(63,217,170,0.22)",
    caption: "#9ff0dc",
  },
  ULTRA_RARE: {
    gradient: "#e6b450, #5a3a10",
    border: "rgba(230,180,80,0.35)",
    glow: "rgba(230,180,80,0.22)",
    caption: "#ffe2a0",
  },
} as const;
