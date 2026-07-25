import type { SrdSpellRecord } from "../types/srdCompendium";
import type { SrdSpellScalingResult } from "../types/srdSpellScaling";
import { calculateSrdSpellScaling } from "./srdSpellScaling";

export type SrdSpellCastingState = {
  baseLevel: number;
  castingLevel: number;
  extraSlotLevels: number;
  isCantrip: boolean;
  hasEnhancedEffect: boolean;
  status: string;
  structuredScaling: SrdSpellScalingResult;
};

const MAX_SPELL_LEVEL = 9;
const noCalculation = (): SrdSpellScalingResult => ({
  status: "none",
  effects: [],
  summary: "No higher-slot calculation is active."
});

export const getSpellSlotOptions = (baseLevel: number): number[] => {
  if (baseLevel <= 0 || baseLevel > MAX_SPELL_LEVEL) return [];
  return Array.from(
    { length: MAX_SPELL_LEVEL - baseLevel + 1 },
    (_, index) => baseLevel + index
  );
};

export const describeSrdSpellCasting = (
  spell: SrdSpellRecord,
  requestedLevel: number
): SrdSpellCastingState => {
  if (spell.level === 0) {
    return {
      baseLevel: 0,
      castingLevel: 0,
      extraSlotLevels: 0,
      isCantrip: true,
      hasEnhancedEffect: false,
      status: "Cantrips do not use spell slots. Any level-based improvement is listed in the spell text.",
      structuredScaling: noCalculation()
    };
  }

  const castingLevel = Math.min(
    MAX_SPELL_LEVEL,
    Math.max(spell.level, Math.trunc(requestedLevel) || spell.level)
  );
  const extraSlotLevels = castingLevel - spell.level;
  const hasEnhancedEffect = spell.higherLevels.trim().length > 0;
  const structuredScaling = calculateSrdSpellScaling(spell.higherLevels, extraSlotLevels);

  if (extraSlotLevels === 0) {
    return {
      baseLevel: spell.level,
      castingLevel,
      extraSlotLevels,
      isCantrip: false,
      hasEnhancedEffect,
      status: hasEnhancedEffect
        ? "Base casting. Choose a higher slot to apply the spell's listed enhancement."
        : "Base casting. This spell has no additional higher-slot effect listed.",
      structuredScaling
    };
  }

  return {
    baseLevel: spell.level,
    castingLevel,
    extraSlotLevels,
    isCantrip: false,
    hasEnhancedEffect,
    status: hasEnhancedEffect
      ? `Cast as a level ${castingLevel} spell. Apply the exact higher-slot rule below.`
      : `Cast as a level ${castingLevel} spell. No additional effect is listed, but the spell still has that level for this casting.`,
    structuredScaling
  };
};
