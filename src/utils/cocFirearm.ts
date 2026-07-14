import type { CocRollMode } from "../types/coc";
import { resolveCocRollMode } from "./cocPercentile";

export type CocHandgunConditions = {
  dexterity: number;
  distanceFeet: number;
  shotsThisRound: 1 | 2 | 3;
  targetDivedForCoverSuccessfully: boolean;
};

export type CocHandgunProcedure = {
  readiedInitiativeDex: number;
  pointBlankRangeFeet: number;
  pointBlank: boolean;
  bonusDice: number;
  penaltyDice: number;
  rollMode: CocRollMode;
  targetForfeitsNextAttack: boolean;
  reasons: string[];
};

const validateDexterity = (value: number): void => {
  if (!Number.isSafeInteger(value) || value < 1 || value > 100) {
    throw new Error("DEX must be a whole number from 1 to 100.");
  }
};

export const resolveCocHandgunProcedure = (
  conditions: CocHandgunConditions
): CocHandgunProcedure => {
  validateDexterity(conditions.dexterity);
  if (!Number.isFinite(conditions.distanceFeet) || conditions.distanceFeet < 0) {
    throw new Error("Distance must be zero feet or greater.");
  }
  if (![1, 2, 3].includes(conditions.shotsThisRound)) {
    throw new Error("A handgun may use this procedure for one, two, or three shots in the round.");
  }

  const pointBlankRangeFeet = Math.floor(conditions.dexterity / 5);
  const pointBlank = conditions.distanceFeet <= pointBlankRangeFeet;
  const bonusDice = pointBlank ? 1 : 0;
  const penaltyDice = (conditions.shotsThisRound >= 2 ? 1 : 0)
    + (conditions.targetDivedForCoverSuccessfully ? 1 : 0);
  const reasons: string[] = [];

  if (pointBlank) reasons.push("Point-blank range grants one Bonus die.");
  if (conditions.shotsThisRound >= 2) reasons.push("Firing two or three handgun shots applies one Penalty die to each shot.");
  if (conditions.targetDivedForCoverSuccessfully) {
    reasons.push("Successful dive for cover applies one Penalty die and costs the target's next attack.");
  }
  if (reasons.length === 0) reasons.push("No listed firearm condition changes the roll.");

  return {
    readiedInitiativeDex: conditions.dexterity + 50,
    pointBlankRangeFeet,
    pointBlank,
    bonusDice,
    penaltyDice,
    rollMode: resolveCocRollMode(bonusDice, penaltyDice),
    targetForfeitsNextAttack: conditions.targetDivedForCoverSuccessfully,
    reasons
  };
};