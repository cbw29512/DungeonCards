import type { DieRoll, RollResult } from "../types/cards";

const formatSignedTerm = (value: number, isFirst: boolean): string => {
  if (isFirst) {
    return `${value}`;
  }

  return value >= 0 ? `+ ${value}` : `- ${Math.abs(value)}`;
};

const formatDie = (die: DieRoll): string => {
  const selected = die.keptResults ?? die.results;
  const selectedText = selected
    .map((value, index) => formatSignedTerm(value, index === 0))
    .join(" ");

  if (!die.keptResults) {
    return selectedText;
  }

  return `[${die.results.join(", ")}] → ${selectedText}`;
};

export const formatRollBreakdown = (result?: RollResult): string => {
  try {
    if (!result) {
      return "Ready";
    }

    const diceText = result.dice.map(formatDie).join(" + ");

    if (result.modifier === 0) {
      return diceText;
    }

    const modifier = result.modifier > 0
      ? `+ ${result.modifier}`
      : `- ${Math.abs(result.modifier)}`;
    return `${diceText} ${modifier}`;
  } catch (error) {
    console.error("Formatting roll breakdown failed", { result, error });
    return "Result unavailable";
  }
};