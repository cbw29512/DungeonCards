import type {
  AdvantageMode,
  RuleRollMode,
  RuleRollResult
} from "../types/ruleCards";
import {
  resolveRuleTable,
  resolveTableResult
} from "./ruleCardFormula";
import { rollDiceFormula } from "./rollDice";

type RuleCardRollInput = {
  mode: RuleRollMode;
  formula: string;
  secondaryFormula?: string;
  choiceId?: string;
  secondaryChoiceId?: string;
  advantageMode: AdvantageMode;
};

export const executeRuleCardRoll = ({
  mode,
  formula,
  secondaryFormula,
  choiceId,
  secondaryChoiceId,
  advantageMode
}: RuleCardRollInput): RuleRollResult => {
  const table = resolveRuleTable(mode, choiceId);
  const baseResult = rollDiceFormula(formula, {
    advantageMode: mode.allowsAdvantage ? advantageMode : "normal",
    naturalRollRule: mode.naturalRollRule ?? "none"
  });
  const result: RuleRollResult = {
    ...baseResult,
    tableResult: resolveTableResult(table, baseResult.total)
  };

  if (mode.secondaryRoll && secondaryFormula) {
    const secondaryTable = resolveRuleTable(mode.secondaryRoll, secondaryChoiceId);
    const secondary = rollDiceFormula(secondaryFormula, {
      advantageMode: mode.secondaryRoll.allowsAdvantage ? advantageMode : "normal",
      naturalRollRule: mode.secondaryRoll.naturalRollRule ?? "none"
    });
    result.secondary = {
      label: mode.secondaryRoll.label,
      formula: secondaryFormula,
      result: secondary,
      tableResult: resolveTableResult(secondaryTable, secondary.total)
    };
  }
  return result;
};
