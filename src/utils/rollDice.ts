import type { DieRoll, RollResult } from "../types/cards";
import type { AdvantageMode, NaturalRollRule } from "../types/ruleCards";
import { parseDiceFormula, type KeepRule, type ParsedDiceTerm } from "./diceParser";
import { secureRandomInteger, type RandomIntegerSource } from "./randomInteger";

export type RollOptions = {
  critOn?: number;
  failOn?: number;
  advantageMode?: AdvantageMode;
  naturalRollRule?: NaturalRollRule;
  randomInteger?: RandomIntegerSource;
};

const selectKeptResults = (results: number[], keep?: KeepRule): number[] | undefined => {
  if (!keep) {
    return undefined;
  }

  const sorted = [...results].sort((a, b) => a - b);
  return keep.kind === "highest"
    ? sorted.slice(-keep.count)
    : sorted.slice(0, keep.count);
};

const rollTerm = (
  term: ParsedDiceTerm,
  randomInteger: RandomIntegerSource
): DieRoll => {
  const results = Array.from(
    { length: term.count },
    () => randomInteger(1, term.sides) * term.sign
  );

  return {
    sides: term.sides,
    results,
    keptResults: selectKeptResults(results, term.keep)
  };
};

const isSinglePositiveD20 = (term: ParsedDiceTerm): boolean =>
  term.count === 1 && term.sides === 20 && term.sign === 1 && !term.keep;

const rollWithAdvantage = (
  term: ParsedDiceTerm,
  mode: Exclude<AdvantageMode, "normal">,
  randomInteger: RandomIntegerSource
): DieRoll => {
  if (!isSinglePositiveD20(term)) {
    throw new Error("Advantage and disadvantage require exactly one positive d20.");
  }

  const results = [randomInteger(1, 20), randomInteger(1, 20)];
  const kept = mode === "advantage" ? Math.max(...results) : Math.min(...results);
  return { sides: 20, results, keptResults: [kept] };
};

const totalDieRoll = (die: DieRoll): number =>
  (die.keptResults ?? die.results).reduce((sum, value) => sum + value, 0);

export const validateDiceFormula = (formula: string): void => {
  try {
    parseDiceFormula(formula);
  } catch (error) {
    console.error("Dice formula validation failed", { formula, error });
    throw error;
  }
};

export const rollDiceFormula = (
  formula: string,
  options: RollOptions = {}
): RollResult => {
  try {
    const parsed = parseDiceFormula(formula);
    const randomInteger = options.randomInteger ?? secureRandomInteger;
    const advantageMode = options.advantageMode ?? "normal";
    const dice = advantageMode === "normal"
      ? parsed.diceTerms.map((term) => rollTerm(term, randomInteger))
      : [rollWithAdvantage(parsed.diceTerms[0], advantageMode, randomInteger)];

    if (advantageMode !== "normal" && parsed.diceTerms.length !== 1) {
      throw new Error("Advantage and disadvantage cannot be used with multiple dice terms.");
    }

    const diceTotal = dice.reduce((sum, die) => sum + totalDieRoll(die), 0);
    const total = diceTotal + parsed.modifier;

    if (!Number.isSafeInteger(total)) {
      throw new Error("The final dice total is outside the supported range.");
    }

    const selected = dice[0]?.keptResults ?? dice[0]?.results ?? [];
    const naturalRoll = dice.length === 1 && dice[0].sides === 20 && selected.length === 1
      ? selected[0]
      : null;
    const attackRule = options.naturalRollRule === "attack";
    const criticalTarget = options.critOn ?? (attackRule ? 20 : undefined);
    const failureTarget = options.failOn ?? (attackRule ? 1 : undefined);

    return {
      formula,
      dice,
      modifier: parsed.modifier,
      total,
      isCritical: criticalTarget !== undefined && naturalRoll === criticalTarget,
      isFailure: failureTarget !== undefined && naturalRoll === failureTarget
    };
  } catch (error) {
    console.error("Dice formula roll failed", { formula, error });
    throw error;
  }
};