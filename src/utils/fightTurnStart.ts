import type { FightBattleState, FightSide } from "../types/fightBattle";
import { healFightCombatant } from "./fightBattleEffects";
import { appendFightPresentationEvent } from "./fightPresentationEvents";

const grantTurnStartResources = (state: FightBattleState, side: FightSide): FightBattleState => {
  let next = state;
  for (const grant of state[side].profile.turnStartResourceGrants ?? []) {
    const resource = state[side].profile.resources?.find((candidate) => candidate.id === grant.resourceId);
    if (!resource) continue;
    const current = next[side].resources[grant.resourceId] ?? 0;
    if (grant.when === "missing" && current >= resource.maximum) continue;
    const amount = Math.min(Math.max(0, grant.amount), Math.max(0, resource.maximum - current));
    if (amount <= 0) continue;
    next = {
      ...next,
      [side]: {
        ...next[side],
        resources: { ...next[side].resources, [grant.resourceId]: current + amount }
      }
    };
    next = appendFightPresentationEvent(next, {
      type: "resource-gained",
      delivery: "system",
      side,
      sourceSide: side,
      label: `${grant.name}: ${resource.name} gained`,
      sourceName: grant.name,
      amount,
      iconKey: "resource"
    });
  }
  return next;
};

const applyTurnStartHealing = (state: FightBattleState, side: FightSide): FightBattleState => {
  let next = state;
  for (const healing of state[side].profile.turnStartHealing ?? []) {
    const current = next[side].currentHitPoints;
    const maximum = next[side].profile.hitPoints;
    if (current < healing.minimumHitPoints) continue;
    if (current > Math.floor(maximum * healing.maximumHitPointFraction)) continue;
    next = healFightCombatant(next, side, healing.amount, healing.name);
  }
  return next;
};

/**
 * Resolves optional/automatic rules that trigger when a combatant starts its
 * turn. The caller invokes this before start-of-turn saves/effect ticks so a
 * feature such as Heroic Warrior can be available for that turn's first d20.
 */
export const resolveFightTurnStartTraits = (state: FightBattleState, side: FightSide): FightBattleState =>
  applyTurnStartHealing(grantTurnStartResources(state, side), side);
