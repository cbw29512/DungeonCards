import type { CardDefinition } from "../types/cardPlatform";
import type { CardActionDefinition, CardRollActionDefinition } from "../types/cardPlatformActions";
import type { CardRuntimeInstance } from "../types/cardPlatformRuntime";
import type { CardActionExecutionOptions, CardActionExecutionResult, CardActionRollDetails } from "../types/cardActionExecution";
import { rollCocPercentile, resolveCocRollMode } from "./cocPercentile";
import { rollDiceFormula } from "./rollDice";
import { calculateCardActionCosts } from "./cardActionResourceCosts";

const executeRoll = (
  action: CardRollActionDefinition,
  options: CardActionExecutionOptions
): { summary: string; roll: CardActionRollDetails } => {
  if (action.rollSystem === "percentile") {
    const target = options.percentileTarget ?? action.percentileTarget;
    if (target === undefined) throw new Error(`${action.label} needs a percentile target from 1 to 100.`);
    const difficulty = options.percentileDifficulty ?? action.percentileDifficulty ?? "regular";
    const mode = resolveCocRollMode(options.bonusDice ?? 0, options.penaltyDice ?? 0);
    const result = rollCocPercentile(target, difficulty, mode, options.randomInteger);
    return {
      summary: `${action.label}: ${result.roll} — ${result.successLevel}${result.meetsDifficulty ? " success" : " failure"}.`,
      roll: {
        rollSystem: "percentile",
        percentileRoll: result.roll,
        percentileTarget: target,
        percentileDifficulty: difficulty,
        percentileMode: mode,
        successLevel: result.successLevel,
        meetsDifficulty: result.meetsDifficulty
      }
    };
  }
  const formula = action.formula?.trim();
  if (!formula) throw new Error(`${action.label} does not have an executable dice formula.`);
  const advantageMode = options.advantageMode ?? "normal";
  if (advantageMode !== "normal" && (action.rollSystem !== "d20" || !action.allowsAdvantage)) {
    throw new Error(`${action.label} does not allow advantage or disadvantage.`);
  }
  const result = rollDiceFormula(formula, {
    advantageMode,
    critOn: action.criticalAt,
    failOn: action.failureAt,
    randomInteger: options.randomInteger
  });
  const state = result.isCritical ? " Critical." : result.isFailure ? " Failure threshold." : "";
  return {
    summary: `${action.label}: ${result.total}.${state}`.replace("..", "."),
    roll: {
      rollSystem: action.rollSystem,
      formula,
      total: result.total,
      dice: result.dice.map((die) => ({
        sides: die.sides,
        results: [...die.results],
        ...(die.keptResults ? { keptResults: [...die.keptResults] } : {})
      })),
      isCritical: result.isCritical,
      isFailure: result.isFailure
    }
  };
};

export const executeCardAction = (
  definition: CardDefinition,
  instance: CardRuntimeInstance,
  action: CardActionDefinition,
  options: CardActionExecutionOptions = {}
): CardActionExecutionResult => {
  if (instance.definitionId !== definition.id || instance.gameSystemId !== definition.gameSystemId) {
    throw new Error("Card action execution requires a matching exact-system definition and runtime instance.");
  }
  if (!definition.actions.some((candidate) => candidate.id === action.id)) {
    throw new Error(`Action ${action.id} does not belong to ${definition.content.title}.`);
  }
  const costs = calculateCardActionCosts(definition, instance, action);
  if (action.kind === "roll") {
    const executed = executeRoll(action, options);
    return {
      actionKind: "roll",
      summary: executed.summary,
      resourceState: costs.resourceState,
      resourceChanges: costs.changes,
      roll: executed.roll
    };
  }
  if (action.kind === "procedure") {
    return {
      actionKind: "procedure",
      summary: `${action.label} completed (${action.steps.length} step${action.steps.length === 1 ? "" : "s"}).`,
      resourceState: costs.resourceState,
      resourceChanges: costs.changes,
      procedureSteps: [...action.steps]
    };
  }
  const available = options.availableDefinitionIds;
  const targetCardIds = available
    ? action.targetCardIds.filter((id) => available.has(id))
    : [...action.targetCardIds];
  const missingTargetCardIds = available
    ? action.targetCardIds.filter((id) => !available.has(id))
    : [];
  if (targetCardIds.length === 0) throw new Error(`${action.label} has no linked cards in the active deck.`);
  return {
    actionKind: "link",
    summary: `${action.label}: ${targetCardIds.length} linked card${targetCardIds.length === 1 ? "" : "s"} available.`,
    resourceState: costs.resourceState,
    resourceChanges: costs.changes,
    targetCardIds,
    missingTargetCardIds
  };
};
