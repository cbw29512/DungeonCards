import type {
  FightAttackOutcome,
  FightBattleCombatantState,
  FightBattleState,
  FightSide
} from "../types/fightBattle";
import type { FightRollMode } from "../types/fightRules";
import { appendFightPresentationEvent } from "./fightPresentationEvents";
import { combineFightRollModes } from "./fightRules";

export const fightCombatantIdentity = (combatant: FightBattleCombatantState): string =>
  combatant.combatantId?.trim() || combatant.profile.id;

const matchingFollowUps = (
  attacker: FightBattleCombatantState,
  target: FightBattleCombatantState
) => {
  const targetCombatantId = fightCombatantIdentity(target);
  return (attacker.attackFollowUps ?? []).filter((followUp) => followUp.targetCombatantId === targetCombatantId);
};

export const fightAttackFollowUpRollMode = (
  attacker: FightBattleCombatantState,
  target: FightBattleCombatantState
): FightRollMode | undefined => {
  const modes = matchingFollowUps(attacker, target).map((followUp) => followUp.rollMode);
  return modes.length ? combineFightRollModes(...modes) : undefined;
};

export const consumeFightAttackFollowUps = (
  state: FightBattleState,
  attacker: FightSide,
  target: FightSide
): FightBattleState => {
  const targetId = fightCombatantIdentity(state[target]);
  const consumed = (state[attacker].attackFollowUps ?? []).filter((followUp) => followUp.targetCombatantId === targetId);
  if (!consumed.length) return state;

  let next: FightBattleState = {
    ...state,
    [attacker]: {
      ...state[attacker],
      attackFollowUps: (state[attacker].attackFollowUps ?? []).filter((followUp) => followUp.targetCombatantId !== targetId)
    }
  };
  for (const followUp of consumed) {
    next = appendFightPresentationEvent(next, {
      type: "attack-follow-up-consumed",
      delivery: "system",
      side: attacker,
      sourceSide: attacker,
      label: `${followUp.name}: next attack used`,
      sourceName: followUp.name,
      iconKey: followUp.id
    });
  }
  return next;
};

export const recordFightAttackFollowUps = ({
  state,
  attacker,
  target,
  outcome,
  damage
}: {
  state: FightBattleState;
  attacker: FightSide;
  target: FightSide;
  outcome: FightAttackOutcome;
  damage: number;
}): FightBattleState => {
  const definitions = (state[attacker].profile.attackFollowUps ?? []).filter((definition) => (
    definition.trigger === "miss"
      ? outcome === "miss"
      : outcome !== "miss" && damage > 0
  ));
  if (!definitions.length) return state;

  const targetCombatantId = fightCombatantIdentity(state[target]);
  const ownerTurn = state[attacker].turnsStarted ?? 0;
  let next = state;
  for (const definition of definitions) {
    const existing = next[attacker].attackFollowUps ?? [];
    const followUp = {
      id: definition.id,
      name: definition.name,
      targetCombatantId,
      rollMode: definition.rollMode,
      expiresAfterOwnerTurn: ownerTurn + 1
    };
    next = {
      ...next,
      [attacker]: {
        ...next[attacker],
        attackFollowUps: [
          ...existing.filter((candidate) => !(candidate.id === definition.id && candidate.targetCombatantId === targetCombatantId)),
          followUp
        ]
      }
    };
    next = appendFightPresentationEvent(next, {
      type: "attack-follow-up",
      delivery: "system",
      side: attacker,
      sourceSide: attacker,
      label: `${definition.name}: ${definition.rollMode} on next attack against this creature`,
      sourceName: definition.name,
      iconKey: definition.id
    });
  }
  return next;
};

export const expireFightAttackFollowUps = (
  state: FightBattleState,
  side: FightSide
): FightBattleState => {
  const ownerTurn = state[side].turnsStarted ?? 0;
  const current = state[side].attackFollowUps ?? [];
  const expired = current.filter((followUp) => followUp.expiresAfterOwnerTurn <= ownerTurn);
  if (!expired.length) return state;

  let next: FightBattleState = {
    ...state,
    [side]: {
      ...state[side],
      attackFollowUps: current.filter((followUp) => followUp.expiresAfterOwnerTurn > ownerTurn)
    }
  };
  for (const followUp of expired) {
    next = appendFightPresentationEvent(next, {
      type: "attack-follow-up-expired",
      delivery: "system",
      side,
      sourceSide: side,
      label: `${followUp.name} expired`,
      sourceName: followUp.name,
      iconKey: followUp.id
    });
  }
  return next;
};
