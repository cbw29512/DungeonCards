import type {
  CocDifficulty,
  CocPercentileResult,
  CocRollMode,
  CocSuccessLevel
} from "../types/coc";
import { secureRandomInteger, type RandomIntegerSource } from "./randomInteger";

const difficultyRank: Record<CocDifficulty | "critical", number> = {
  regular: 1,
  hard: 2,
  extreme: 3,
  critical: 4
};

const toPercentileValue = (tens: number, unit: number): number =>
  tens === 0 && unit === 0 ? 100 : (tens * 10) + unit;

export const validateCocSkillValue = (value: number): void => {
  if (!Number.isSafeInteger(value) || value < 1 || value > 100) {
    throw new Error("Skill values must be whole numbers from 1 to 100.");
  }
};

export const getCocSuccessLevel = (roll: number, skillValue: number): CocSuccessLevel => {
  validateCocSkillValue(skillValue);

  if (!Number.isSafeInteger(roll) || roll < 1 || roll > 100) {
    throw new Error("Percentile rolls must be whole numbers from 1 to 100.");
  }

  if (roll === 1) return "critical";

  const fumbleThreshold = skillValue < 50 ? 96 : 100;
  if (roll >= fumbleThreshold) return "fumble";
  if (roll <= Math.floor(skillValue / 5)) return "extreme";
  if (roll <= Math.floor(skillValue / 2)) return "hard";
  if (roll <= skillValue) return "regular";
  return "failure";
};

export const meetsCocDifficulty = (
  successLevel: CocSuccessLevel,
  difficulty: CocDifficulty
): boolean => {
  if (successLevel === "failure" || successLevel === "fumble") return false;
  return difficultyRank[successLevel] >= difficultyRank[difficulty];
};

export const rollCocPercentile = (
  skillValue: number,
  difficulty: CocDifficulty = "regular",
  mode: CocRollMode = "normal",
  randomInteger: RandomIntegerSource = secureRandomInteger
): CocPercentileResult => {
  try {
    validateCocSkillValue(skillValue);

    const unitDie = randomInteger(0, 9);
    const tensCount = mode === "normal" ? 1 : 2;
    const tensDice = Array.from({ length: tensCount }, () => randomInteger(0, 9));
    const candidates = tensDice.map((tens) => toPercentileValue(tens, unitDie));
    const roll = mode === "bonus"
      ? Math.min(...candidates)
      : mode === "penalty"
        ? Math.max(...candidates)
        : candidates[0];
    const successLevel = getCocSuccessLevel(roll, skillValue);

    return {
      roll,
      unitDie,
      tensDice,
      candidates,
      skillValue,
      difficulty,
      successLevel,
      meetsDifficulty: meetsCocDifficulty(successLevel, difficulty)
    };
  } catch (error) {
    console.error("Call of Cthulhu percentile roll failed", {
      skillValue,
      difficulty,
      mode,
      error
    });
    throw error;
  }
};
