import type { DndAbilityScores, DndCharacterResource } from "../types/dndCharacter";

export const barbarianLevels = Array.from({ length: 20 }, (_, index) => index + 1);

export const attainedBarbarianFeatures = (
  level: number,
  entries: Array<[number, string]>
): string[] => entries.filter(([unlock]) => level >= unlock).map(([, feature]) => feature);

export const barbarianRageDamage = (level: number): number => (
  level >= 16 ? 4 : level >= 9 ? 3 : 2
);

export const barbarianAttackCount = (level: number): number => level >= 5 ? 2 : 1;

export const barbarianRages2014 = (level: number): number => {
  if (level >= 20) return 0;
  if (level >= 17) return 6;
  if (level >= 12) return 5;
  if (level >= 6) return 4;
  if (level >= 3) return 3;
  return 2;
};

export const barbarianRages2024 = (level: number): number => {
  if (level >= 17) return 6;
  if (level >= 12) return 5;
  if (level >= 6) return 4;
  if (level >= 3) return 3;
  return 2;
};

export const barbarianRageResource = (
  level: number,
  edition: "2014" | "2024"
): DndCharacterResource => {
  const unlimited = edition === "2014" && level === 20;
  return {
    id: "rage",
    name: "Rage",
    maximum: unlimited ? 0 : edition === "2014" ? barbarianRages2014(level) : barbarianRages2024(level),
    unlimited,
    refresh: "long-rest",
    notes: edition === "2024"
      ? "Regain one expended use on a Short Rest and all uses on a Long Rest."
      : unlimited ? "Unlimited uses at level 20." : "Regain all uses on a Long Rest."
  };
};

export const barbarianUnarmoredAc = (scores: DndAbilityScores): number => (
  10 + Math.floor((scores.dex - 10) / 2) + Math.floor((scores.con - 10) / 2)
);
