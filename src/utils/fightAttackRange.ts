import type { FightBattleCombatantState } from "../types/fightBattle";
import type { FightActionDefinition, FightAttackAction, FightRollMode } from "../types/fightRules";
import { combineFightRollModes, isFightIncapacitated } from "./fightRules";

export const fightActionMaximumRangeFeet = (action: FightActionDefinition): number => {
  if (action.kind === "attack" && action.attackMode === "ranged" && action.longRangeFeet !== undefined) {
    return Math.max(action.rangeFeet ?? 5, action.longRangeFeet);
  }
  return action.rangeFeet ?? 5;
};

/**
 * Adds only distance-specific modifiers. General conditions/effects are combined
 * later by fightAttackRollMode. Visibility is not modeled yet, so the 5-foot
 * ranged penalty assumes the active, non-incapacitated opponent can see the attacker.
 */
export const fightAttackDistanceRollMode = (
  action: FightAttackAction,
  distanceFeet: number,
  target: FightBattleCombatantState
): FightRollMode => {
  if (action.attackMode !== "ranged") return action.attackRollMode ?? "normal";
  const normalRange = action.rangeFeet ?? 5;
  const longRange = action.longRangeFeet;
  const longRangePenalty = longRange !== undefined && distanceFeet > normalRange && distanceFeet <= longRange
    ? "disadvantage" as const
    : undefined;
  const closeEnemyPenalty = distanceFeet <= 5 && !isFightIncapacitated(target)
    ? "disadvantage" as const
    : undefined;
  return combineFightRollModes(action.attackRollMode, longRangePenalty, closeEnemyPenalty);
};
