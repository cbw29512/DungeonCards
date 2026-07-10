import type { DieRoll, RollResult } from "../types/cards";

const DICE_FORMULA_PATTERN = /([+-]?\d*d\d+)|([+-]\d+)/gi;
const MAX_DICE_PER_TERM = 100;
const MAX_TOTAL_DICE = 100;
const MAX_DIE_SIDES = 1000;
const MAX_FORMULA_LENGTH = 60;

type RollOptions = {
  critOn?: number;
  failOn?: number;
};

type ParsedDiceTerm = {
  count: number;
  sides: number;
  sign: 1 | -1;
};

type ParsedFormula = {
  diceTerms: ParsedDiceTerm[];
  modifier: number;
};

const parseSignedNumber = (value: string): number => {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isSafeInteger(parsed)) {
    throw new Error(`Invalid numeric value: ${value}`);
  }

  return parsed;
};

const parseDiceFormula = (formula: string): ParsedFormula => {
  const cleanedFormula = formula.replace(/\s+/g, "");

  if (!cleanedFormula) {
    throw new Error("Dice formula is required.");
  }

  if (cleanedFormula.length > MAX_FORMULA_LENGTH) {
    throw new Error(`Dice formula cannot exceed ${MAX_FORMULA_LENGTH} characters.`);
  }

  const matches = cleanedFormula.match(DICE_FORMULA_PATTERN);

  if (!matches || matches.join("") !== cleanedFormula) {
    throw new Error(`Unsupported dice formula: ${formula}`);
  }

  const diceTerms: ParsedDiceTerm[] = [];
  let modifier = 0;

  matches.forEach((token) => {
    if (!token.toLowerCase().includes("d")) {
      modifier += parseSignedNumber(token);
      return;
    }

    const sign: 1 | -1 = token.startsWith("-") ? -1 : 1;
    const unsignedToken = token.replace(/^[+-]/, "");
    const [countText, sidesText] = unsignedToken.toLowerCase().split("d");
    const count = countText === "" ? 1 : parseSignedNumber(countText);
    const sides = parseSignedNumber(sidesText);

    if (count < 1) {
      throw new Error(`Invalid dice count: ${count}`);
    }

    if (count > MAX_DICE_PER_TERM) {
      throw new Error(`Dice count cannot exceed ${MAX_DICE_PER_TERM} per term.`);
    }

    if (sides < 2) {
      throw new Error(`Invalid die size: d${sides}`);
    }

    if (sides > MAX_DIE_SIDES) {
      throw new Error(`Die size cannot exceed d${MAX_DIE_SIDES}.`);
    }

    diceTerms.push({ count, sides, sign });
  });

  if (diceTerms.length === 0) {
    throw new Error("A dice formula must contain at least one die.");
  }

  const totalDice = diceTerms.reduce((sum, term) => sum + term.count, 0);

  if (totalDice > MAX_TOTAL_DICE) {
    throw new Error(`A formula cannot roll more than ${MAX_TOTAL_DICE} dice.`);
  }

  if (!Number.isSafeInteger(modifier)) {
    throw new Error("The combined modifier is outside the supported range.");
  }

  return { diceTerms, modifier };
};

const rollSingleDie = (sides: number): number => Math.floor(Math.random() * sides) + 1;

export const validateDiceFormula = (formula: string): void => {
  try {
    parseDiceFormula(formula);
  } catch (error) {
    console.error("Dice formula validation failed", { formula, error });
    throw error;
  }
};

export const rollDiceFormula = (formula: string, options: RollOptions = {}): RollResult => {
  try {
    const parsed = parseDiceFormula(formula);
    const dice: DieRoll[] = parsed.diceTerms.map((term) => ({
      sides: term.sides,
      results: Array.from({ length: term.count }, () => rollSingleDie(term.sides) * term.sign)
    }));
    const diceTotal = dice.flatMap((die) => die.results).reduce((sum, roll) => sum + roll, 0);
    const singleNaturalRoll =
      dice.length === 1 && dice[0].results.length === 1 && dice[0].results[0] > 0
        ? dice[0].results[0]
        : null;

    return {
      formula,
      dice,
      modifier: parsed.modifier,
      total: diceTotal + parsed.modifier,
      isCritical: options.critOn !== undefined && singleNaturalRoll === options.critOn,
      isFailure: options.failOn !== undefined && singleNaturalRoll === options.failOn
    };
  } catch (error) {
    console.error("Dice formula roll failed", { formula, error });
    throw error;
  }
};
