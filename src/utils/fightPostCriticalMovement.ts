import type { FightBattleState, FightSide } from "../types/fightBattle";
import type { FightAttackAction } from "../types/fightRules";
import { appendFightPresentationEvent } from "./fightPresentationEvents";

const finitePosition = (value: number | undefined): value is number => Number.isFinite(value);

const distanceFeet = (state: FightBattleState): number => {
  const character = state.character.positionFeet;
  const monster = state.monster.positionFeet;
  return finitePosition(character) && finitePosition(monster)
    ? Math.abs(character - monster)
    : Math.max(0, state.distanceFeet);
};

export const resolveFightPostCriticalMovement = ({
  state,
  attacker,
  target,
  action
}: {
  state: FightBattleState;
  attacker: FightSide;
  target: FightSide;
  action: FightAttackAction;
}): FightBattleState => {
  let next = state;
  for (const definition of state[attacker].profile.postCriticalMovement ?? []) {
    if (definition.autoUse !== "retreat-ranged-without-leaving-normal-range" || action.attackMode !== "ranged") continue;
    const currentDistance = distanceFeet(next);
    const normalRange = Math.max(0, action.rangeFeet ?? 0);
    const movement = Math.min(
      Math.max(0, definition.maximumFeet),
      Math.max(0, normalRange - currentDistance)
    );
    if (movement <= 0) continue;

    const actorPosition = next[attacker].positionFeet;
    const targetPosition = next[target].positionFeet;
    let nextPosition: number | undefined;
    if (finitePosition(actorPosition) && finitePosition(targetPosition)) {
      const away = actorPosition === targetPosition
        ? attacker === "character" ? -1 : 1
        : Math.sign(actorPosition - targetPosition);
      nextPosition = actorPosition + away * movement;
    }
    next = {
      ...next,
      distanceFeet: currentDistance + movement,
      [attacker]: {
        ...next[attacker],
        ...(finitePosition(nextPosition) ? { positionFeet: nextPosition } : {})
      }
    };
    next = appendFightPresentationEvent(next, {
      type: "movement",
      delivery: "system",
      side: attacker,
      sourceSide: attacker,
      label: `${definition.name}: moves ${movement} ft${definition.opportunityAttackSafe ? " without provoking Opportunity Attacks" : ""}`,
      sourceName: definition.name,
      amount: movement,
      iconKey: "movement"
    });
  }
  return next;
};
