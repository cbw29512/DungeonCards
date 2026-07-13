import type {
  FormulaChoice,
  RuleRollMode,
  RuleTableEntry
} from "../types/ruleCards";

const replaceFinalModifier = (formula: string, modifier: number): string => {
  const withoutModifier = formula.replace(/[+-]\d+$/, "");

  if (modifier === 0) {
    return withoutModifier;
  }

  return `${withoutModifier}${modifier > 0 ? "+" : ""}${modifier}`;
};

const scaleFirstMatchingDie = (
  formula: string,
  sides: number,
  addedDice: number
): string => {
  let replaced = false;
  const pattern = new RegExp(`(\\d*)d${sides}(?!\\d)`, "i");

  return formula.replace(pattern, (token, countText: string) => {
    if (replaced) {
      return token;
    }

    replaced = true;
    const count = countText === "" ? 1 : Number.parseInt(countText, 10);
    return `${count + addedDice}d${sides}`;
  });
};

const scaleSlotFormula = (mode: RuleRollMode, slotLevel: number): string => {
  if (mode.scaling?.kind !== "slot-dice") {
    return mode.formula;
  }

  const level = Math.min(
    mode.scaling.maxLevel,
    Math.max(mode.scaling.baseLevel, slotLevel)
  );
  const extraLevels = level - mode.scaling.baseLevel;
  const addedDice = extraLevels * mode.scaling.dicePerLevel;
  let formula = scaleFirstMatchingDie(
    mode.formula,
    mode.scaling.dieSides,
    addedDice
  );

  if (mode.scaling.modifierPerLevel) {
    const currentModifier = Number.parseInt(formula.match(/[+-]\d+$/)?.[0] ?? "0", 10);
    formula = replaceFinalModifier(
      formula,
      currentModifier + extraLevels * mode.scaling.modifierPerLevel
    );
  }

  return formula;
};

const scaleCharacterFormula = (
  mode: RuleRollMode,
  characterLevel: number
): string => {
  if (mode.scaling?.kind !== "character-formula") {
    return mode.formula;
  }

  const sortedTiers = [...mode.scaling.tiers].sort((a, b) => a.level - b.level);
  return sortedTiers.reduce(
    (formula, tier) => characterLevel >= tier.level ? tier.formula : formula,
    sortedTiers[0]?.formula ?? mode.formula
  );
};

export const getFormulaChoice = (
  mode: RuleRollMode,
  choiceId?: string
): FormulaChoice | undefined => {
  if (!mode.choices?.length) {
    return undefined;
  }

  return mode.choices.find((choice) => choice.id === choiceId) ?? mode.choices[0];
};

export const resolveRuleFormula = (
  mode: RuleRollMode,
  slotLevel: number,
  characterLevel: number,
  modifier: number,
  choiceId?: string
): string => {
  const choice = getFormulaChoice(mode, choiceId);
  const chosenMode = choice ? { ...mode, formula: choice.formula, scaling: undefined } : mode;
  let formula = scaleSlotFormula(chosenMode, slotLevel);
  formula = scaleCharacterFormula({ ...chosenMode, formula }, characterLevel);

  return mode.modifierControl
    ? replaceFinalModifier(formula, modifier)
    : formula;
};

export const resolveRuleTable = (
  mode: RuleRollMode,
  choiceId?: string
): RuleTableEntry[] | undefined => getFormulaChoice(mode, choiceId)?.table;

export const resolveTableResult = (
  table: RuleTableEntry[] | undefined,
  total: number
): string | undefined => table?.find((entry) => total >= entry.min && total <= entry.max)?.result;

export const getScaleBounds = (mode: RuleRollMode): [number, number] => {
  if (mode.scaling?.kind === "slot-dice") {
    return [mode.scaling.baseLevel, mode.scaling.maxLevel];
  }

  return [1, 20];
};