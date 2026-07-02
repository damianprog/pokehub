import type { BaseStats } from "@/types/pokemon";

export interface StatDef {
  key: keyof BaseStats;
  label: string;
  color: string;
}

export const STAT_DEFS: StatDef[] = [
  { key: "hp", label: "HP", color: "#5cb85c" },
  { key: "attack", label: "Attack", color: "#ff7a45" },
  { key: "defense", label: "Defense", color: "#4aa3e0" },
  { key: "spAttack", label: "Sp.Atk", color: "#c44fe0" },
  { key: "spDefense", label: "Sp.Def", color: "#8b6fd4" },
  { key: "speed", label: "Speed", color: "#e85b9e" },
];
