// Card colors per rarity tier, applied regardless of the Pokémon's type (Claude
// Design "Card tiers"). Common and Uncommon are deliberately swapped from the
// design: Common is silver-grey, Uncommon blue with a double rim (packs
// overview §4). `gradient` is the stop list for a radial-gradient; `shadow` is
// the card's full box-shadow.
export const RARITY_CARD_COLORS = {
  COMMON: {
    gradient: "#b9c4d6, #2a3242 74%",
    border: "rgba(220,228,242,0.5)",
    glow: "transparent",
    shadow: "none",
    caption: "#e6ecf5",
  },
  UNCOMMON: {
    gradient: "#4aa3e0, #1a3050",
    border: "rgba(140,170,200,0.25)",
    glow: "rgba(74,163,224,0.14)",
    shadow:
      "inset 0 0 0 3px rgba(12,14,18,0.3), inset 0 0 0 4px rgba(140,170,200,0.3), 0 0 18px rgba(74,163,224,0.14)",
    caption: "#9ec0e0",
  },
  RARE: {
    gradient: "#2fae9a, #0f3a36",
    border: "rgba(63,217,170,0.38)",
    glow: "rgba(63,217,170,0.22)",
    shadow: "0 0 24px rgba(63,217,170,0.24)",
    caption: "#9ff0dc",
  },
  ULTRA_RARE: {
    gradient: "#e6b450, #5a3a10",
    border: "rgba(230,180,80,0.35)",
    glow: "rgba(230,180,80,0.22)",
    shadow: "0 0 28px rgba(230,180,80,0.28)",
    caption: "#ffe2a0",
  },
} as const;

/** Tier labels as printed on cards. */
export const RARITY_LABELS = {
  COMMON: "COMMON",
  UNCOMMON: "UNCOMMON",
  RARE: "RARE",
  ULTRA_RARE: "ULTRA RARE",
} as const;
