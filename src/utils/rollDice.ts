import type { DieRoll, RollResult } from "../types/cards";

const DICE_FORMULA_PATTERN = /([+-]?\d*d\d+)|([+-]\d+)/gi;

const parseSignedNumber = (value: string): number => {
  const parsed = Number.parseInt(value, 10);

  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid numeric value: ${value}`);
  }

  return parsed;
};

const rollSingleDie = (sides: number): number => {
  if (!Number.isInteger(sides) || sides < 2) {
    throw new Error(`Invalid die size: d${sides}`);
  }

  return Math.floor(Math.random() * sides) + 1;
};

export const rollDiceFormula = (formula: string): RollResult => {
  try {
    const cleanedFormula = formula.replace(/\s+/g, "");
    const matches = cleanedFormula.match(DICE_FORMULA_PATTERN);

    if (!matches || matches.join("") !== cleanedFormula) {
      throw new Error(`Unsupported dice formula: ${formula}`);
    }

    const dice: DieRoll[] = [];
    let modifier = 0;

    matches.forEach((token) => {
      const isDiceToken = token.toLowerCase().includes("d");

      if (!isDiceToken) {
        modifier += parseSignedNumber(token);
        return;
      }

      const sign = token.startsWith("-") ? -1 : 1;
      const unsignedToken = token.replace(/^[+-]/, "");
      const [countText, sidesText] = unsignedToken.toLowerCase().split("d");
      const count = countText === "" ? 1 : parseSignedNumber(countText);
      const sides = parseSignedNumber(sidesText);

      if (!Number.isInteger(count) || count < 1) {
        throw new Error(`Invalid dice count: ${count}`);
      }

      const results = Array.from({ length: count }, () => rollSingleDie(sides) * sign);
      dice.push({ sides, results });
    });

    const diceTotal = dice.flatMap((die) => die.results).reduce((sum, roll) => sum + roll, 0);
    const allRolls = dice.flatMap((die) => die.results.map(Math.abs));

    return {
      formula,
      dice,
      modifier,
      total: diceTotal + modifier,
      isCritical: allRolls.length === 1 && allRolls[0] === 20,
      isFailure: allRolls.length === 1 && allRolls[0] === 1
    };
  } catch (error) {
    console.error("Dice formula roll failed", { formula, error });
    throw error;
  }
};
