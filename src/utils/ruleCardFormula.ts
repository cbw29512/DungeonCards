import type {
  FormulaChoice,
  RuleRollPart,
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
    if (replaced) return token;
    replaced = true;
    const count = countText === "" ? 1 : Number.parseInt(countText, 10);
    return `${count + addedDice}d${sides}`;
  });
};

const scaleSlotFormula = (part: RuleRollPart, slotLevel: number): string => {
  if (part.scaling?.kind !== "slot-dice") return part.formula;

  const level = Math.min(
    part.scaling.maxLevel,
    Math.max(part.scaling.baseLevel, slotLevel)
  );
  const extraLevels = level - part.scaling.baseLevel;
  const addedDice = extraLevels * part.scaling.dicePerLevel;
  let formula = scaleFirstMatchingDie(
    part.formula,
    part.scaling.dieSides,
    addedDice
  );

  if (part.scaling.modifierPerLevel) {
    const currentModifier = Number.parseInt(formula.match(/[+-]\d+$/)?.[0] ?? "0", 10);
    formula = replaceFinalModifier(
      formula,
      currentModifier + extraLevels * part.scaling.modifierPerLevel
    );
  }

  return formula;
};

const scaleCharacterFormula = (
  part: RuleRollPart,
  characterLevel: number
): string => {
  if (part.scaling?.kind !== "character-formula") return part.formula;

  const sortedTiers = [...part.scaling.tiers].sort((a, b) => a.level - b.level);
  return sortedTiers.reduce(
    (formula, tier) => characterLevel >= tier.level ? tier.formula : formula,
    sortedTiers[0]?.formula ?? part.formula
  );
};

export const getFormulaChoice = (
  part: RuleRollPart,
  choiceId?: string
): FormulaChoice | undefined => {
  if (!part.choices?.length) return undefined;
  return part.choices.find((choice) => choice.id === choiceId) ?? part.choices[0];
};

export const resolveRuleFormula = (
  part: RuleRollPart,
  slotLevel: number,
  characterLevel: number,
  modifier: number,
  choiceId?: string
): string => {
  const choice = getFormulaChoice(part, choiceId);
  const chosenPart = choice ? { ...part, formula: choice.formula, scaling: undefined } : part;
  let formula = scaleSlotFormula(chosenPart, slotLevel);
  formula = scaleCharacterFormula({ ...chosenPart, formula }, characterLevel);

  return part.modifierControl
    ? replaceFinalModifier(formula, modifier)
    : formula;
};

export const resolveRuleTable = (
  part: RuleRollPart,
  choiceId?: string
): RuleTableEntry[] | undefined => getFormulaChoice(part, choiceId)?.table;

export const resolveTableResult = (
  table: RuleTableEntry[] | undefined,
  total: number
): string | undefined => table?.find((entry) => total >= entry.min && total <= entry.max)?.result;

export const getScaleBounds = (part: RuleRollPart): [number, number] => {
  if (part.scaling?.kind === "slot-dice") {
    return [part.scaling.baseLevel, part.scaling.maxLevel];
  }

  return [1, 20];
};