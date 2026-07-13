import type { RollResult } from "../types/cards";

const formatSignedTerm = (value: number, isFirst: boolean): string => {
  if (isFirst) {
    return `${value}`;
  }

  return value >= 0 ? `+ ${value}` : `- ${Math.abs(value)}`;
};

export const formatRollBreakdown = (result?: RollResult): string => {
  try {
    if (!result) {
      return "Ready";
    }

    const terms = result.dice.flatMap((die) => die.results);

    if (result.modifier !== 0) {
      terms.push(result.modifier);
    }

    return terms.map((value, index) => formatSignedTerm(value, index === 0)).join(" ");
  } catch (error) {
    console.error("Formatting roll breakdown failed", { result, error });
    return "Result unavailable";
  }
};
