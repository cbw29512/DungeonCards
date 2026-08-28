import type {
  FightAttackEvent,
  FightBattleState,
  FightInitiativeState,
  FightSide
} from "../types/fightBattle";
import type { FightCombatantProfile } from "../types/fightMatchmaker";
import type { RandomIntegerSource } from "./randomInteger";
import { rollDiceFormula } from "./rollDice";
import { breakFightConcentration, tickFightEffects } from "./fightBattleEffects";
import { appendFightPresentationEvent, recordFightAttackPresentation } from "./fightPresentationEvents";
import { assertFightBattleProfile } from "./fightBattleValidation";

const attackFormula = (bonus: number): string => `1d20${bonus >= 0 ? "+" : ""}${bonus}`;
const naturalRoll = (result: ReturnType<typeof rollDiceFormula>): number =>
  result.dice[0]?.keptResults?.[0] ?? result.dice[0]?.results[0] ?? 0;

export const createFightBattle = (
  character: FightCombatantProfile,
  monster: FightCombatantProfile
): FightBattleState => {
  assertFightBattleProfile(character);
  assertFightBattleProfile(monster);
  return {
    status: "ready",
    round: 1,
    activeIndex: 0,
    character: { profile: character, currentHitPoints: character.hitPoints, temporaryHitPoints: 0, effects: [] },
    monster: { profile: monster, currentHitPoints: monster.hitPoints, temporaryHitPoints: 0, effects: [] },
    events: [],
    presentationEvents: []
  };
};

export const rollFightInitiative = (
  state: FightBattleState,
  randomInteger?: RandomIntegerSource
): FightBattleState => {
  if (state.status !== "ready") throw new Error("Initiative can only be rolled for a ready fight.");
  const characterRoll = rollDiceFormula(attackFormula(state.character.profile.initiativeBonus ?? 0), { randomInteger });
  const monsterRoll = rollDiceFormula(attackFormula(state.monster.profile.initiativeBonus ?? 0), { randomInteger });
  const initiative: FightInitiativeState = {
    characterNaturalRoll: naturalRoll(characterRoll),
    characterTotal: characterRoll.total,
    monsterNaturalRoll: naturalRoll(monsterRoll),
    monsterTotal: monsterRoll.total
  };
  if (initiative.characterTotal === initiative.monsterTotal) {
    return { ...state, status: "initiative-tie", initiative };
  }
  initiative.order = initiative.characterTotal > initiative.monsterTotal
    ? ["character", "monster"]
    : ["monster", "character"];
  return { ...state, status: "active", initiative };
};

export const resolveFightInitiativeTie = (
  state: FightBattleState,
  first: FightSide
): FightBattleState => {
  if (state.status !== "initiative-tie" || !state.initiative) throw new Error("There is no initiative tie to resolve.");
  const second: FightSide = first === "character" ? "monster" : "character";
  return { ...state, status: "active", initiative: { ...state.initiative, order: [first, second] } };
};

const resolveAttack = (
  state: FightBattleState,
  attacker: FightSide,
  attackNumber: number,
  randomInteger?: RandomIntegerSource
): { event: FightAttackEvent; damage: number } => {
  const target: FightSide = attacker === "character" ? "monster" : "character";
  const profile = state[attacker].profile;
  const targetState = state[target];
  const roll = rollDiceFormula(attackFormula(profile.attackBonus), { naturalRollRule: "attack", randomInteger });
  const natural = naturalRoll(roll);
  const outcome = roll.isFailure ? "miss" : roll.isCritical ? "critical" : roll.total >= targetState.profile.armorClass ? "hit" : "miss";
  let damage = 0;
  if (outcome !== "miss") {
    damage = rollDiceFormula(profile.attackDamageFormula!, { randomInteger }).total;
    if (outcome === "critical") damage += rollDiceFormula(profile.criticalBonusFormula!, { randomInteger }).total;
    damage = Math.max(0, damage);
  }
  const summary = `${profile.name} ${profile.sourceActionName}: ${outcome}${damage ? ` for ${damage} damage` : ""}.`;
  return {
    damage,
    event: {
      id: state.events.length + 1,
      round: state.round,
      attacker,
      target,
      attackNumber,
      sourceActionName: profile.sourceActionName!,
      naturalRoll: natural,
      attackTotal: roll.total,
      outcome,
      damage,
      targetHitPointsAfter: targetState.currentHitPoints,
      summary
    }
  };
};

export const resolveFightTurn = (state: FightBattleState, randomInteger?: RandomIntegerSource): FightBattleState => {
  if (state.status !== "active" || !state.initiative?.order) throw new Error("A fight turn requires resolved initiative.");
  const attacker = state.initiative.order[state.activeIndex];
  const target: FightSide = attacker === "character" ? "monster" : "character";
  let next = tickFightEffects(state, attacker, "start");
  for (let attackNumber = 1; attackNumber <= state[attacker].profile.attacksPerRound; attackNumber += 1) {
    const resolved = resolveAttack(next, attacker, attackNumber, randomInteger);
    const temporaryHitPoints = next[target].temporaryHitPoints ?? 0;
    const temporaryHitPointsAbsorbed = Math.min(temporaryHitPoints, resolved.damage);
    const hitPointDamage = Math.max(0, resolved.damage - temporaryHitPointsAbsorbed);
    const targetHitPointsAfter = Math.max(0, next[target].currentHitPoints - hitPointDamage);
    const event: FightAttackEvent = {
      ...resolved.event,
      id: next.events.length + 1,
      temporaryHitPointsAbsorbed: temporaryHitPointsAbsorbed || undefined,
      targetHitPointsAfter
    };
    next = {
      ...next,
      [target]: {
        ...next[target],
        currentHitPoints: targetHitPointsAfter,
        temporaryHitPoints: temporaryHitPoints - temporaryHitPointsAbsorbed
      },
      events: [...next.events, event]
    };
    next = recordFightAttackPresentation({
      state: next,
      attacker,
      target,
      sourceName: event.sourceActionName,
      outcome: event.outcome,
      damage: event.damage,
      delivery: next[attacker].profile.attackDelivery ?? "weapon"
    });
    if (targetHitPointsAfter === 0) {
      next = breakFightConcentration(next, target);
      next = appendFightPresentationEvent(next, {
        type: "downed",
        delivery: "system",
        side: target,
        sourceSide: attacker,
        label: `${next[target].profile.name} is down`,
        iconKey: "downed"
      });
      return { ...next, status: "complete", winner: attacker };
    }
  }
  next = tickFightEffects(next, attacker, "end");
  return next.activeIndex === 0
    ? { ...next, activeIndex: 1 }
    : { ...next, activeIndex: 0, round: next.round + 1 };
};

export const runFightToCompletion = (
  state: FightBattleState,
  randomInteger?: RandomIntegerSource,
  maxTurns = 500
): FightBattleState => {
  let next = state;
  for (let turn = 0; turn < maxTurns && next.status === "active"; turn += 1) next = resolveFightTurn(next, randomInteger);
  return next;
};
