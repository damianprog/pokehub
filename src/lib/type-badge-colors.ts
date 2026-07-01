export interface TypeBadgeColor {
  label: string;
  bg: string;
  color: string;
}

export const TYPE_BADGE_COLORS: Record<string, TypeBadgeColor> = {
  fire:     { label: "Fire",     bg: "rgba(255,122,69,0.18)", color: "#ff9a6b" },
  flying:   { label: "Flying",   bg: "rgba(138,168,224,0.18)", color: "#a8c4f0" },
  water:    { label: "Water",    bg: "rgba(74,163,224,0.18)", color: "#7fb6ff" },
  psychic:  { label: "Psychic",  bg: "rgba(232,91,158,0.18)", color: "#e889c0" },
  ghost:    { label: "Ghost",    bg: "rgba(139,111,212,0.18)", color: "#b6a0e6" },
  dragon:   { label: "Dragon",   bg: "rgba(106,90,205,0.18)", color: "#9a8ee0" },
  electric: { label: "Electric", bg: "rgba(230,200,74,0.18)", color: "#e6c84a" },
  poison:   { label: "Poison",   bg: "rgba(160,64,160,0.18)", color: "#c080c0" },
  ground:   { label: "Ground",   bg: "rgba(224,192,104,0.18)", color: "#d4aa50" },
  rock:     { label: "Rock",     bg: "rgba(184,160,56,0.18)", color: "#c8a840" },
  ice:      { label: "Ice",      bg: "rgba(152,216,216,0.18)", color: "#90d0d0" },
  fighting: { label: "Fighting", bg: "rgba(192,48,40,0.18)", color: "#e05050" },
  bug:      { label: "Bug",      bg: "rgba(168,184,32,0.18)", color: "#a8b820" },
  steel:    { label: "Steel",    bg: "rgba(184,184,208,0.18)", color: "#a0a0c0" },
  normal:   { label: "Normal",   bg: "rgba(168,168,120,0.18)", color: "#b0b080" },
  dark:     { label: "Dark",     bg: "rgba(112,88,72,0.18)", color: "#907060" },
  fairy:    { label: "Fairy",    bg: "rgba(232,158,200,0.18)", color: "#e890b8" },
  grass:    { label: "Grass",    bg: "rgba(120,200,80,0.18)", color: "#80c860" },
};

export const FALLBACK_BADGE_COLOR: Pick<TypeBadgeColor, "bg" | "color"> = {
  bg: "rgba(255,255,255,0.1)",
  color: "#fff",
};
