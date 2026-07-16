import { useMemo, useState } from "react";
import type {
  AdvantageMode,
  RuleCard,
  RuleRollHistoryEntry,
  RuleRollMode,
  RuleRollResult,
  RulesetId
} from "../types/ruleCards";
import { createClientId } from "../utils/createId";
import {
  getFormulaChoice,
  getScaleBounds,
  resolveRuleFormula,
  resolveRuleTable,
  resolveTableResult
} from "../utils/ruleCardFormula";
import { rollDiceFormula } from "../utils/rollDice";

type RuleCardStateProps = {
  card: RuleCard;
  onRoll: (entry: RuleRollHistoryEntry) => void;
};

const getRulesets = (card: RuleCard): RulesetId[] =>
  Object.keys(card.variants) as RulesetId[];

const getInitialSlotLevel = (mode: RuleRollMode): number => {
  const scaling = mode.scaling ?? mode.secondaryRoll?.scaling;
  return scaling?.kind === "slot-dice" ? scaling.baseLevel : 1;
};

export const useRuleCardState = ({ card, onRoll }: RuleCardStateProps) => {
  const rulesets = useMemo(() => getRulesets(card), [card]);
  const [ruleset, setRuleset] = useState<RulesetId>(rulesets[0]);
  const initialVariant = card.variants[rulesets[0]]!;
  const initialMode = initialVariant.modes[0];
  const [modeId, setModeId] = useState(initialMode.id);
  const [choiceId, setChoiceId] = useState(initialMode.choices?.[0]?.id);
  const [secondaryChoiceId, setSecondaryChoiceId] = useState(
    initialMode.secondaryRoll?.choices?.[0]?.id
  );
  const [slotLevel, setSlotLevelState] = useState(getInitialSlotLevel(initialMode));
  const [characterLevel, setCharacterLevelState] = useState(1);
  const [modifier, setModifier] = useState(
    initialMode.modifierControl?.defaultValue ?? 0
  );
  const [secondaryModifier, setSecondaryModifier] = useState(
    initialMode.secondaryRoll?.modifierControl?.defaultValue ?? 0
  );
  const [advantageMode, setAdvantageMode] = useState<AdvantageMode>("normal");
  const [result, setResult] = useState<RuleRollResult>();
  const [isFlipped, setIsFlipped] = useState(false);

  const variant = card.variants[ruleset]!;
  const mode = variant.modes.find((candidate) => candidate.id === modeId) ?? variant.modes[0];
  const formula = resolveRuleFormula(
    mode,
    slotLevel,
    characterLevel,
    modifier,
    choiceId
  );
  const secondaryFormula = mode.secondaryRoll
    ? resolveRuleFormula(
      mode.secondaryRoll,
      slotLevel,
      characterLevel,
      secondaryModifier,
      secondaryChoiceId
    )
    : undefined;
  const selectedChoice = getFormulaChoice(mode, choiceId);
  const selectedSecondaryChoice = mode.secondaryRoll
    ? getFormulaChoice(mode.secondaryRoll, secondaryChoiceId)
    : undefined;
  const scalePart = mode.scaling ? mode : mode.secondaryRoll ?? mode;
  const scaleBounds = getScaleBounds(scalePart);

  const setSlotLevel = (nextLevel: number) => {
    setSlotLevelState(nextLevel);
    setResult(undefined);
  };

  const setCharacterLevel = (nextLevel: number) => {
    setCharacterLevelState(nextLevel);
    setResult(undefined);
  };

  const configureMode = (nextMode: RuleRollMode) => {
    setModeId(nextMode.id);
    setChoiceId(nextMode.choices?.[0]?.id);
    setSecondaryChoiceId(nextMode.secondaryRoll?.choices?.[0]?.id);
    setModifier(nextMode.modifierControl?.defaultValue ?? 0);
    setSecondaryModifier(nextMode.secondaryRoll?.modifierControl?.defaultValue ?? 0);
    setSlotLevelState(getInitialSlotLevel(nextMode));
    setCharacterLevelState(1);
    setAdvantageMode("normal");
    setResult(undefined);
    setIsFlipped(false);
  };

  const changeRuleset = (nextRuleset: RulesetId) => {
    try {
      const nextVariant = card.variants[nextRuleset];
      if (!nextVariant) throw new Error(`Card ${card.id} has no ${nextRuleset} variant.`);
      setRuleset(nextRuleset);
      configureMode(nextVariant.modes[0]);
    } catch (error) {
      console.error("Changing a card ruleset failed", { cardId: card.id, nextRuleset, error });
    }
  };

  const changeMode = (nextModeId: string) => {
    const nextMode = variant.modes.find((candidate) => candidate.id === nextModeId);
    if (nextMode) configureMode(nextMode);
  };

  const roll = () => {
    try {
      const table = resolveRuleTable(mode, choiceId);
      const baseResult = rollDiceFormula(formula, {
        advantageMode: mode.allowsAdvantage ? advantageMode : "normal",
        naturalRollRule: mode.naturalRollRule ?? "none"
      });
      const nextResult: RuleRollResult = {
        ...baseResult,
        tableResult: resolveTableResult(table, baseResult.total)
      };

      if (mode.secondaryRoll && secondaryFormula) {
        const secondaryTable = resolveRuleTable(mode.secondaryRoll, secondaryChoiceId);
        const secondary = rollDiceFormula(secondaryFormula, {
          advantageMode: mode.secondaryRoll.allowsAdvantage ? advantageMode : "normal",
          naturalRollRule: mode.secondaryRoll.naturalRollRule ?? "none"
        });
        nextResult.secondary = {
          label: mode.secondaryRoll.label,
          formula: secondaryFormula,
          result: secondary,
          tableResult: resolveTableResult(secondaryTable, secondary.total)
        };
      }

      setResult(nextResult);
      setIsFlipped(true);
      onRoll({
        id: createClientId("rule-roll"),
        cardId: card.id,
        cardName: card.name,
        ruleset,
        modeLabel: mode.label,
        result: nextResult,
        rolledAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Rolling an interactive rule card failed", {
        cardId: card.id,
        ruleset,
        modeId: mode.id,
        formula,
        secondaryFormula,
        error
      });
    }
  };

  return {
    rulesets,
    ruleset,
    variant,
    mode,
    choiceId,
    secondaryChoiceId,
    selectedChoice,
    selectedSecondaryChoice,
    slotLevel,
    characterLevel,
    modifier,
    secondaryModifier,
    advantageMode,
    result,
    isFlipped,
    formula,
    secondaryFormula,
    scaleBounds,
    changeRuleset,
    changeMode,
    setChoiceId,
    setSecondaryChoiceId,
    setSlotLevel,
    setCharacterLevel,
    setModifier,
    setSecondaryModifier,
    setAdvantageMode,
    setIsFlipped,
    roll
  };
};
