import { getCocSuccessLevel } from "./cocPercentile";
import { secureRandomInteger, type RandomIntegerSource } from "./randomInteger";

export type CocSanityCampaignEffectType = "phobia" | "mania" | "backstory" | "delusion" | "other";

export type CocSanityCampaignEffect = {
  id: string;
  type: CocSanityCampaignEffectType;
  description: string;
  active: boolean;
};

export type CocPsychoanalysisOutcome = {
  roll: number;
  successLevel: ReturnType<typeof getCocSuccessLevel>;
  sanityChange: number;
  nextSanity: number;
  treatmentConcludes: boolean;
  summary: string;
};

const normalizeNonnegative = (value: number): number => Math.max(0, Math.trunc(value) || 0);

export const calculateMaximumSanity = (cthulhuMythosSkill: number): number =>
  Math.max(0, 99 - normalizeNonnegative(cthulhuMythosSkill));

const clampSanity = (value: number, maximumSanity: number): number =>
  Math.min(normalizeNonnegative(maximumSanity), normalizeNonnegative(value));

export const rollIndefiniteCareMonths = (
  randomInteger: RandomIntegerSource = secureRandomInteger
): number => randomInteger(1, 6);

export const resolveMonthlyPsychoanalysis = (
  currentSanity: number,
  psychoanalysisSkill: number,
  roll: number,
  maximumSanity: number = 99,
  randomInteger: RandomIntegerSource = secureRandomInteger
): CocPsychoanalysisOutcome => {
  const sanity = clampSanity(currentSanity, maximumSanity);
  const skill = Math.min(100, Math.max(1, Math.trunc(psychoanalysisSkill) || 1));
  const successLevel = getCocSuccessLevel(roll, skill);

  if (successLevel === "fumble") {
    const loss = randomInteger(1, 6);
    const nextSanity = clampSanity(sanity - loss, maximumSanity);
    return {
      roll,
      successLevel,
      sanityChange: nextSanity - sanity,
      nextSanity,
      treatmentConcludes: true,
      summary: `Fumble: lose ${sanity - nextSanity} Sanity. Treatment by this analyst concludes.`
    };
  }

  if (successLevel === "failure") {
    return {
      roll,
      successLevel,
      sanityChange: 0,
      nextSanity: sanity,
      treatmentConcludes: false,
      summary: "Failure: no Sanity is regained this month."
    };
  }

  const gain = randomInteger(1, 3);
  const nextSanity = clampSanity(sanity + gain, maximumSanity);
  return {
    roll,
    successLevel,
    sanityChange: nextSanity - sanity,
    nextSanity,
    treatmentConcludes: false,
    summary: `Success: regain ${nextSanity - sanity} Sanity.`
  };
};

export const addSanityCampaignEffect = (
  effects: CocSanityCampaignEffect[],
  effect: CocSanityCampaignEffect
): CocSanityCampaignEffect[] => {
  if (!effect.description.trim()) return effects;
  return [...effects, { ...effect, description: effect.description.trim() }];
};

export const toggleSanityCampaignEffect = (
  effects: CocSanityCampaignEffect[],
  effectId: string
): CocSanityCampaignEffect[] => effects.map((effect) =>
  effect.id === effectId ? { ...effect, active: !effect.active } : effect
);
