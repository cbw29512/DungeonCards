import { secureRandomInteger, type RandomIntegerSource } from "./randomInteger";

export type CocLuckInvestigator = {
  id: string;
  name: string;
  luck: number;
};

export type CocLuckRollResult = {
  luck: number;
  roll: number;
  success: boolean;
};

export type CocGroupLuckSelection = {
  lowestLuck: number;
  investigators: CocLuckInvestigator[];
  summary: string;
};

const clampLuck = (value: number): number => Math.min(100, Math.max(0, Math.trunc(value) || 0));

export const calculateStartingLuck = (dice: number[]): number => {
  if (dice.length !== 3 || dice.some((die) => !Number.isSafeInteger(die) || die < 1 || die > 6)) {
    throw new Error("Starting Luck requires exactly three D6 results from 1 to 6.");
  }
  return dice.reduce((total, die) => total + die, 0) * 5;
};

export const rollStartingLuck = (
  randomInteger: RandomIntegerSource = secureRandomInteger
): { dice: number[]; luck: number } => {
  const dice = Array.from({ length: 3 }, () => randomInteger(1, 6));
  return { dice, luck: calculateStartingLuck(dice) };
};

export const resolveLuckRoll = (
  currentLuck: number,
  percentileRoll: number
): CocLuckRollResult => {
  const luck = clampLuck(currentLuck);
  if (!Number.isSafeInteger(percentileRoll) || percentileRoll < 1 || percentileRoll > 100) {
    throw new Error("Luck rolls must be whole numbers from 1 to 100.");
  }
  return { luck, roll: percentileRoll, success: percentileRoll <= luck };
};

export const rollLuck = (
  currentLuck: number,
  randomInteger: RandomIntegerSource = secureRandomInteger
): CocLuckRollResult => resolveLuckRoll(currentLuck, randomInteger(1, 100));

export const selectGroupLuckInvestigators = (
  investigators: CocLuckInvestigator[]
): CocGroupLuckSelection => {
  if (investigators.length === 0) {
    throw new Error("Add at least one investigator before making a Group Luck roll.");
  }
  const normalized = investigators.map((investigator) => ({
    ...investigator,
    name: investigator.name.trim() || "Unnamed investigator",
    luck: clampLuck(investigator.luck)
  }));
  const lowestLuck = Math.min(...normalized.map((investigator) => investigator.luck));
  const selected = normalized.filter((investigator) => investigator.luck === lowestLuck);
  return {
    lowestLuck,
    investigators: selected,
    summary: selected.length === 1
      ? `${selected[0].name} makes the Group Luck roll at ${lowestLuck}.`
      : `${selected.map((investigator) => investigator.name).join(", ")} tie for the lowest Luck at ${lowestLuck}; choose one of them to roll.`
  };
};

export const spendTrackedLuck = (
  currentLuck: number,
  requestedSpend: number
): { previousLuck: number; spent: number; remainingLuck: number } => {
  const previousLuck = clampLuck(currentLuck);
  const spend = Math.min(previousLuck, Math.max(0, Math.trunc(requestedSpend) || 0));
  return { previousLuck, spent: spend, remainingLuck: previousLuck - spend };
};
