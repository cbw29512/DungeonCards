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

const clampSanity = (value: number): number => Math.min(99, Math.max(0, Math.trunc(value) || 0));

export const rollIndefiniteCareMonths = (
  randomInteger: RandomIntegerSource = secureRandomInteger
): number => randomInteger(1, 6);

export const resolveMonthlyPsychoanalysis = (
  currentSanity: number,
  psychoanalysisSkill: number,
  roll: number,
  randomInteger: RandomIntegerSource = secureRandomInteger
): CocPsychoanalysisOutcome => {
  const sanity = clampSanity(currentSanity);
  const skill = Math.min(100, Math.max(1, Math.trunc(psychoanalysisSkill) || 1));
  const successLevel = getCocSuccessLevel(roll, skill);

  if (successLevel === "fumble") {
    const loss = randomInteger(1, 6);
    const nextSanity = clampSanity(sanity - loss);
    return {
      roll,
      successLevel,
      sanityChange: -loss,
      nextSanity,
      treatmentConcludes: true,
      summary: `Fumble: lose ${loss} Sanity. Treatment by this analyst concludes.`
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
  const nextSanity = clampSanity(sanity + gain);
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
