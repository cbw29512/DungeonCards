const DICE_FORMULA_PATTERN = /([+-]?\d*d\d+(?:k[hl]\d+)?)|([+-]\d+)/gi;
const DICE_TOKEN_PATTERN = /^(\d*)d(\d+)(?:k([hl])(\d+))?$/i;
const MAX_DICE_PER_TERM = 100;
const MAX_TOTAL_DICE = 100;
const MAX_DIE_SIDES = 1000;
const MAX_FORMULA_LENGTH = 60;

export type KeepRule = {
  kind: "highest" | "lowest";
  count: number;
};

export type ParsedDiceTerm = {
  count: number;
  sides: number;
  sign: 1 | -1;
  keep?: KeepRule;
};

export type ParsedFormula = {
  diceTerms: ParsedDiceTerm[];
  modifier: number;
};

const parseSafeInteger = (value: string): number => {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isSafeInteger(parsed)) {
    throw new Error(`Invalid numeric value: ${value}`);
  }

  return parsed;
};

const parseDiceToken = (token: string): ParsedDiceTerm => {
  const sign: 1 | -1 = token.startsWith("-") ? -1 : 1;
  const unsignedToken = token.replace(/^[+-]/, "");
  const match = unsignedToken.match(DICE_TOKEN_PATTERN);

  if (!match) {
    throw new Error(`Unsupported dice token: ${token}`);
  }

  const count = match[1] === "" ? 1 : parseSafeInteger(match[1]);
  const sides = parseSafeInteger(match[2]);
  const keepCount = match[4] ? parseSafeInteger(match[4]) : undefined;

  if (count < 1 || count > MAX_DICE_PER_TERM) {
    throw new Error(`Dice count must be between 1 and ${MAX_DICE_PER_TERM}.`);
  }

  if (sides < 2 || sides > MAX_DIE_SIDES) {
    throw new Error(`Die size must be between d2 and d${MAX_DIE_SIDES}.`);
  }

  if (keepCount !== undefined && (keepCount < 1 || keepCount > count || sign < 0)) {
    throw new Error("Keep rules require positive dice and a valid kept count.");
  }

  return {
    count,
    sides,
    sign,
    keep: keepCount === undefined
      ? undefined
      : { kind: match[3].toLowerCase() === "h" ? "highest" : "lowest", count: keepCount }
  };
};

export const parseDiceFormula = (formula: string): ParsedFormula => {
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
    if (token.toLowerCase().includes("d")) {
      diceTerms.push(parseDiceToken(token));
    } else {
      modifier += parseSafeInteger(token);
    }
  });

  if (diceTerms.length === 0) {
    throw new Error("A dice formula must contain at least one die.");
  }

  if (diceTerms.reduce((sum, term) => sum + term.count, 0) > MAX_TOTAL_DICE) {
    throw new Error(`A formula cannot roll more than ${MAX_TOTAL_DICE} dice.`);
  }

  if (!Number.isSafeInteger(modifier)) {
    throw new Error("The combined modifier is outside the supported range.");
  }

  return { diceTerms, modifier };
};