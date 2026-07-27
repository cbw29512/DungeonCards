import { useMemo, useState } from "react";
import type {
  AdvantageMode,
  RuleCard,
  RuleRollHistoryEntry,
  RuleRollMode,
  RuleRollResult,
  RulesetId
} from "../types/ruleCards";
import { gameSystemIdForRuleset } from "../utils/cardPlatformGameSystem";
import { createClientId } from "../utils/createId";
import { executeRuleCardRoll } from "../utils/executeRuleCardRoll";
import {
  getFormulaChoice,
  getScaleBounds,
  resolveRuleFormula
} from "../utils/ruleCardFormula";

type RuleCardStateProps = {
  card: RuleCard;
  onRoll: (entry: RuleRollHistoryEntry) => void;
  initialRuleset?: RulesetId;
  onRulesetChange?: (ruleset: RulesetId) => void;
};

const getRulesets = (card: RuleCard): RulesetId[] => Object.keys(card.variants) as RulesetId[];
const getInitialSlotLevel = (mode: RuleRollMode): number => {
  const scaling = mode.scaling ?? mode.secondaryRoll?.scaling;
  return scaling?.kind === "slot-dice" ? scaling.baseLevel : 1;
};

export const useRuleCardState = ({
  card,
  onRoll,
  initialRuleset,
  onRulesetChange
}: RuleCardStateProps) => {
  const rulesets = useMemo(() => getRulesets(card), [card]);
  const initial = initialRuleset && card.variants[initialRuleset] ? initialRuleset : rulesets[0];
  const [ruleset, setRuleset] = useState<RulesetId>(initial);
  const initialMode = card.variants[initial]!.modes[0];
  const [modeId, setModeId] = useState(initialMode.id);
  const [choiceId, setChoiceId] = useState(initialMode.choices?.[0]?.id);
  const [secondaryChoiceId, setSecondaryChoiceId] = useState(initialMode.secondaryRoll?.choices?.[0]?.id);
  const [slotLevel, setSlotLevelState] = useState(getInitialSlotLevel(initialMode));
  const [characterLevel, setCharacterLevelState] = useState(1);
  const [modifier, setModifier] = useState(initialMode.modifierControl?.defaultValue ?? 0);
  const [secondaryModifier, setSecondaryModifier] = useState(initialMode.secondaryRoll?.modifierControl?.defaultValue ?? 0);
  const [advantageMode, setAdvantageMode] = useState<AdvantageMode>("normal");
  const [result, setResult] = useState<RuleRollResult>();
  const [isFlipped, setIsFlipped] = useState(false);

  const variant = card.variants[ruleset]!;
  const mode = variant.modes.find((candidate) => candidate.id === modeId) ?? variant.modes[0];
  const formula = resolveRuleFormula(mode, slotLevel, characterLevel, modifier, choiceId);
  const secondaryFormula = mode.secondaryRoll
    ? resolveRuleFormula(mode.secondaryRoll, slotLevel, characterLevel, secondaryModifier, secondaryChoiceId)
    : undefined;
  const selectedChoice = getFormulaChoice(mode, choiceId);
  const selectedSecondaryChoice = mode.secondaryRoll
    ? getFormulaChoice(mode.secondaryRoll, secondaryChoiceId)
    : undefined;
  const scaleBounds = getScaleBounds(mode.scaling ? mode : mode.secondaryRoll ?? mode);

  const setSlotLevel = (value: number) => { setSlotLevelState(value); setResult(undefined); };
  const setCharacterLevel = (value: number) => { setCharacterLevelState(value); setResult(undefined); };
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
    const nextVariant = card.variants[nextRuleset];
    if (!nextVariant) {
      console.error("Changing a card ruleset failed", { cardId: card.id, nextRuleset });
      return;
    }
    setRuleset(nextRuleset);
    configureMode(nextVariant.modes[0]);
    onRulesetChange?.(nextRuleset);
  };
  const changeMode = (nextModeId: string) => {
    const nextMode = variant.modes.find((candidate) => candidate.id === nextModeId);
    if (nextMode) configureMode(nextMode);
  };
  const roll = () => {
    try {
      const nextResult = executeRuleCardRoll({
        mode, formula, secondaryFormula, choiceId, secondaryChoiceId, advantageMode
      });
      setResult(nextResult);
      setIsFlipped(true);
      onRoll({
        id: createClientId("rule-roll"), cardId: card.id, cardName: card.name,
        ruleset, gameSystemId: gameSystemIdForRuleset(ruleset),
        modeLabel: mode.label, result: nextResult, rolledAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Rolling an interactive rule card failed", {
        cardId: card.id, ruleset, modeId: mode.id, formula, secondaryFormula, error
      });
    }
  };

  return {
    rulesets, ruleset, variant, mode, choiceId, secondaryChoiceId,
    selectedChoice, selectedSecondaryChoice, slotLevel, characterLevel,
    modifier, secondaryModifier, advantageMode, result, isFlipped,
    formula, secondaryFormula, scaleBounds, changeRuleset, changeMode,
    setChoiceId, setSecondaryChoiceId, setSlotLevel, setCharacterLevel,
    setModifier, setSecondaryModifier, setAdvantageMode, setIsFlipped, roll
  };
};
