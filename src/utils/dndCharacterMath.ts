import type { DndAbilityId } from "../types/dndCharacter";

export const dndAbilityIds: DndAbilityId[] = ["str", "dex", "con", "int", "wis", "cha"];

export const dndAbilityModifier = (score: number): number =>
  Math.floor((Math.trunc(Number.isFinite(score) ? score : 10) - 10) / 2);

export const dndProficiencyBonus = (level: number): number => {
  const normalizedLevel = Math.min(20, Math.max(1, Math.trunc(Number.isFinite(level) ? level : 1)));
  return 2 + Math.floor((normalizedLevel - 1) / 4);
};

export const dndFixedHitPoints = (
  hitDie: 6 | 8 | 10 | 12,
  level: number,
  constitutionScore: number
): number => {
  const normalizedLevel = Math.min(20, Math.max(1, Math.trunc(Number.isFinite(level) ? level : 1)));
  const constitutionModifier = dndAbilityModifier(constitutionScore);
  const firstLevel = Math.max(1, hitDie + constitutionModifier);
  const laterLevelIncrease = Math.max(1, (hitDie / 2) + 1 + constitutionModifier);
  return firstLevel + ((normalizedLevel - 1) * laterLevelIncrease);
};

export const dndAttackBonus = (
  abilityScore: number,
  level: number,
  proficient: boolean
): number => dndAbilityModifier(abilityScore) + (proficient ? dndProficiencyBonus(level) : 0);

export const dndSpellSaveDc = (abilityScore: number, level: number): number =>
  8 + dndProficiencyBonus(level) + dndAbilityModifier(abilityScore);

export const dndSpellAttackBonus = (abilityScore: number, level: number): number =>
  dndProficiencyBonus(level) + dndAbilityModifier(abilityScore);
