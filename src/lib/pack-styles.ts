/** Foil wrapper tint and tag for one pack source. */
export interface PackStyle {
  background: string;
  border: string;
  glow: string;
  /** Kicker and tag color. */
  accent: string;
  tag: string;
}

// Only the daily pack exists so far; earned-pack sources (review, streak,
// dust) get their own styles in the slices that add them.
export const DAILY_PACK_STYLE: PackStyle = {
  background: "linear-gradient(160deg,#1a3a32,#0f1a16)",
  border: "rgba(63,217,138,0.35)",
  glow: "0 18px 50px rgba(63,217,138,0.28)",
  accent: "#8ff0b8",
  tag: "DAILY",
};
