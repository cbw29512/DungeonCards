import type {
  FightAttackEvent,
  FightBattleCombatantState,
  FightBattleState,
  FightInitiativeState,
  FightSide
} from "../types/fightBattle";
import type { FightCombatantProfile } from "../types/fightMatchmaker";
import type {
  FightActionDefinition,
  FightActionEffectDefinition,
  FightAttackAction,
  FightMultiattackAction,
  FightSaveAction
} from "../types/fightRules";
import { secureRandomInteger, type RandomIntegerSource } from "./randomInteger";
import { rollDiceFormula } from "./rollDice";
import {
  applyFightEffect,
  breakFightConcentration,
  grantFightTemporaryHitPoints,
  healFightCombatant,
  resolveFightTimedEffectSaves,
  startFightConcentration,
  tickFightEffects
} from "./fightBattleEffects";
import { fightActionMaximumRangeFeet, fightAttackDistanceRollMode } from "./fightAttackRange";
import {
  consumeFightAttackFollowUps,
  expireFightAttackFollowUps,
  fightAttackFollowUpRollMode,
  recordFightAttackFollowUps
} from "./fightAttackFollowUps";
import { resolveFightAttackRoll, fightAttackHits } from "./fightAttackReroll";
import { resolveFightPostCriticalMovement } from "./fightPostCriticalMovement";
import { appendFightPresentationEvent, recordFightAttackPresentation } from "./fightPresentationEvents";
import { assertFightBattleProfile } from "./fightBattleValidation";
import { resolveFightSavingThrow } from "./fightSavingThrow";
import { resolveFightTurnStartTraits } from "./fightTurnStart";
import {
  combineFightRollModes,
  fightAttackRollMode,
  fightMovementAllowance,
  isFightIncapacitated,
  rollFightDamageComponents
} from "./fightRules";

export type FightTurnOptions = {
  /**
   * Optional party/multi-target hook. Called only after the current opponent is
   * actually reduced to 0 HP, their concentration is broken, and the downed
   * event has been recorded. Returning a living replacement keeps the same
   * turn/action sequence active so remaining Multiattack/Extra Attack/bonus
   * attacks resolve through this canonical engine. Returning undefined keeps
   * normal duel behavior and completes the fight.
   */
  onOpponentDowned?: (
    state: FightBattleState,
    attacker: FightSide,
    target: FightSide
  ) => FightBattleCombatantState | undefined;
};

type FightActionExecutionOptions = {
  skipEconomy?: boolean;
  skipResources?: boolean;
  turnOptions?: FightTurnOptions;
};

const attackFormula = (bonus: number): string => `1d20${bonus >= 0 ? "+" : ""}${bonus}`;
const naturalRoll = (result: ReturnType<typeof rollDiceFormula>): number =>
  result.dice[0]?.keptResults?.[0] ?? result.dice[0]?.results[0] ?? 0;

const finitePosition = (value: number | undefined): value is number => Number.isFinite(value);

export const fightBattleDistanceFeet = (state: FightBattleState): number => {
  const characterPosition = state.character.positionFeet;
  const monsterPosition = state.monster.positionFeet;
  if (finitePosition(characterPosition) && finitePosition(monsterPosition)) {
    return Math.abs(characterPosition - monsterPosition);
  }
  return Math.max(0, state.distanceFeet);
};

const synchronizeFightDistance = (state: FightBattleState): FightBattleState => ({
  ...state,
  distanceFeet: fightBattleDistanceFeet(state)
});

const safeActionId = (value: string): string => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "attack";

const legacyActionsForProfile = (profile: FightCombatantProfile): FightActionDefinition[] => {
  const attackId = `legacy-${safeActionId(profile.sourceActionName ?? "attack")}`;
  const attack: FightAttackAction = {
    id: attackId,
    name: profile.sourceActionName ?? "Attack",
    kind: "attack",
    economy: "action",
    delivery: profile.attackDelivery ?? "weapon",
    attackMode: "melee",
    attackBonus: profile.attackBonus,
    criticalAt: 20,
    rangeFeet: 5,
    damage: [{
      formula: profile.attackDamageFormula!,
      damageType: "untyped",
      criticalBonusFormula: profile.criticalBonusFormula
    }]
  };
  if (profile.attacksPerRound <= 1) return [attack];
  return [
    attack,
    {
      id: "legacy-multiattack",
      name: `${profile.sourceActionName ?? "Attack"} ×${profile.attacksPerRound}`,
      kind: "multiattack",
      economy: "action",
      delivery: profile.attackDelivery ?? "weapon",
      sequence: [{ actionId: attackId, count: profile.attacksPerRound }],
      rangeFeet: 5
    }
  ];
};

export const fightActionsForProfile = (profile: FightCombatantProfile): FightActionDefinition[] =>
  profile.actions?.length ? profile.actions : legacyActionsForProfile(profile);

const initialResources = (profile: FightCombatantProfile): Record<string, number> => Object.fromEntries(
  (profile.resources ?? []).map((resource) => [resource.id, resource.initial ?? resource.maximum])
);

const initialRecharge = (profile: FightCombatantProfile): Record<string, boolean> => Object.fromEntries(
  fightActionsForProfile(profile)
    .filter((action) => action.recharge)
    .map((action) => [action.id, action.recharge?.initiallyReady !== false])
);

const initialEconomy = (profile: FightCombatantProfile) => ({
  actionsAvailable: 1,
  bonusActionsAvailable: 1,
  reactionAvailable: true,
  movementRemainingFeet: profile.speedFeet ?? 30
});

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
    distanceFeet: 30,
    character: {
      combatantId: character.id,
      positionFeet: 0,
      turnsStarted: 0,
      profile: character,
      currentHitPoints: character.hitPoints,
      temporaryHitPoints: 0,
      effects: [],
      attackFollowUps: [],
      resources: initialResources(character),
      rechargeReady: initialRecharge(character),
      economy: initialEconomy(character)
    },
    monster: {
      combatantId: monster.id,
      positionFeet: 30,
      turnsStarted: 0,
      profile: monster,
      currentHitPoints: monster.hitPoints,
      temporaryHitPoints: 0,
      effects: [],
      attackFollowUps: [],
      resources: initialResources(monster),
      rechargeReady: initialRecharge(monster),
      economy: initialEconomy(monster)
    },
    events: [],
    presentationEvents: []
  };
};

export const rollFightInitiative = (
  state: FightBattleState,
  randomInteger?: RandomIntegerSource
): FightBattleState => {
  if (state.status !== "ready") throw new Error("Initiative can only be rolled for a ready fight.");
  const characterRoll = rollDiceFormula(attackFormula(state.character.profile.initiativeBonus ?? 0), {
    advantageMode: state.character.profile.initiativeRollMode,
    randomInteger
  });
  const monsterRoll = rollDiceFormula(attackFormula(state.monster.profile.initiativeBonus ?? 0), {
    advantageMode: state.monster.profile.initiativeRollMode,
    randomInteger
  });
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

const resetTurnState = (state: FightBattleState, side: FightSide): FightBattleState => {
  const profile = state[side].profile;
  const resources = { ...state[side].resources };
  for (const definition of profile.resources ?? []) {
    if (definition.refresh === "turn" || definition.refresh === "round") resources[definition.id] = definition.maximum;
  }
  const incapacitated = isFightIncapacitated(state[side]);
  return {
    ...state,
    [side]: {
      ...state[side],
      turnsStarted: (state[side].turnsStarted ?? 0) + 1,
      resources,
      economy: {
        actionsAvailable: incapacitated ? 0 : 1,
        bonusActionsAvailable: incapacitated ? 0 : 1,
        reactionAvailable: !incapacitated,
        movementRemainingFeet: fightMovementAllowance(state[side])
      }
    }
  };
};

const refreshRecharge = (
  state: FightBattleState,
  side: FightSide,
  randomInteger?: RandomIntegerSource
): FightBattleState => {
  let next = state;
  const random = randomInteger ?? secureRandomInteger;
  for (const action of fightActionsForProfile(state[side].profile)) {
    if (!action.recharge || state[side].rechargeReady[action.id] !== false) continue;
    const sides = action.recharge.dieSides ?? 6;
    const roll = random(1, sides);
    if (roll < action.recharge.minimum) continue;
    next = {
      ...next,
      [side]: {
        ...next[side],
        rechargeReady: { ...next[side].rechargeReady, [action.id]: true }
      }
    };
    next = appendFightPresentationEvent(next, {
      type: "recharge-ready",
      delivery: "system",
      side,
      sourceSide: side,
      label: `${action.name} recharged`,
      sourceName: action.name,
      iconKey: "recharge"
    });
  }
  return next;
};

const hasResourceCosts = (state: FightBattleState, side: FightSide, action: FightActionDefinition): boolean =>
  (action.resourceCosts ?? []).every((cost) => (state[side].resources[cost.resourceId] ?? 0) >= cost.amount);

const hasEconomy = (state: FightBattleState, side: FightSide, action: FightActionDefinition): boolean => {
  if (action.economy === "free") return true;
  if (action.economy === "action") return state[side].economy.actionsAvailable > 0;
  if (action.economy === "bonus-action") return state[side].economy.bonusActionsAvailable > 0;
  return state[side].economy.reactionAvailable;
};

const canUseAction = (state: FightBattleState, side: FightSide, action: FightActionDefinition): boolean =>
  !isFightIncapacitated(state[side])
  && hasEconomy(state, side, action)
  && !(action.economy === "action"
    && state[side].economy.restrictedActionDelivery
    && action.delivery === state[side].economy.restrictedActionDelivery)
  && hasResourceCosts(state, side, action)
  && (!action.recharge || state[side].rechargeReady[action.id] !== false);

const spendAction = (
  state: FightBattleState,
  side: FightSide,
  action: FightActionDefinition,
  options: FightActionExecutionOptions = {}
): FightBattleState => {
  let next = state;
  if (!options.skipEconomy) {
    const economy = { ...next[side].economy };
    if (action.economy === "action") {
      economy.actionsAvailable = Math.max(0, economy.actionsAvailable - 1);
      if (economy.restrictedActionDelivery) economy.restrictedActionDelivery = undefined;
    }
    else if (action.economy === "bonus-action") economy.bonusActionsAvailable = Math.max(0, economy.bonusActionsAvailable - 1);
    else if (action.economy === "reaction") economy.reactionAvailable = false;
    next = { ...next, [side]: { ...next[side], economy } };
  }
  if (!options.skipResources) {
    for (const cost of action.resourceCosts ?? []) {
      const remaining = Math.max(0, (next[side].resources[cost.resourceId] ?? 0) - cost.amount);
      next = {
        ...next,
        [side]: { ...next[side], resources: { ...next[side].resources, [cost.resourceId]: remaining } }
      };
      next = appendFightPresentationEvent(next, {
        type: "resource-used",
        delivery: "system",
        side,
        sourceSide: side,
        label: `${action.name}: ${cost.resourceId} used`,
        sourceName: action.name,
        amount: cost.amount,
        iconKey: "resource"
      });
    }
  }
  if (action.recharge && !options.skipResources) {
    next = {
      ...next,
      [side]: { ...next[side], rechargeReady: { ...next[side].rechargeReady, [action.id]: false } }
    };
  }
  return next;
};

const moveIntoRange = (state: FightBattleState, side: FightSide, action: FightActionDefinition): FightBattleState => {
  const rangeFeet = action.rangeFeet ?? 5;
  const currentDistance = fightBattleDistanceFeet(state);
  if (rangeFeet === 0 || currentDistance <= rangeFeet) return synchronizeFightDistance(state);
  const movement = Math.min(state[side].economy.movementRemainingFeet, currentDistance - rangeFeet);
  if (movement <= 0) return synchronizeFightDistance(state);

  const target: FightSide = side === "character" ? "monster" : "character";
  const actorPosition = state[side].positionFeet;
  const targetPosition = state[target].positionFeet;
  const nextPosition = finitePosition(actorPosition) && finitePosition(targetPosition)
    ? actorPosition + Math.sign(targetPosition - actorPosition) * movement
    : undefined;
  const nextDistance = Math.max(0, currentDistance - movement);

  let next: FightBattleState = {
    ...state,
    distanceFeet: nextDistance,
    [side]: {
      ...state[side],
      ...(finitePosition(nextPosition) ? { positionFeet: nextPosition } : {}),
      economy: {
        ...state[side].economy,
        movementRemainingFeet: state[side].economy.movementRemainingFeet - movement
      }
    }
  };
  next = synchronizeFightDistance(next);
  next = appendFightPresentationEvent(next, {
    type: "movement",
    delivery: "system",
    side,
    sourceSide: side,
    label: `${state[side].profile.name} moves ${movement} ft`,
    amount: movement,
    iconKey: "movement"
  });
  return next;
};

const applyActionEffects = (
  state: FightBattleState,
  target: FightSide,
  source: FightSide,
  actionName: string,
  effects: FightActionEffectDefinition[] | undefined
): FightBattleState => (effects ?? []).reduce((next, effect) => applyFightEffect(next, target, {
  id: effect.id,
  name: effect.name,
  kind: effect.kind,
  iconKey: effect.iconKey,
  sourceName: effect.sourceName ?? actionName,
  remainingRounds: effect.remainingRounds,
  tickTiming: effect.tickTiming ?? "manual",
  saveAbility: effect.saveAbility,
  saveDc: effect.saveDc,
  saveTiming: effect.saveTiming,
  concentrationOwner: effect.concentrationLinked ? source : undefined,
  concentrationOwnerId: effect.concentrationLinked ? state[source].combatantId : undefined,
  attackRollMode: effect.attackRollMode,
  attacksAgainstRollMode: effect.attacksAgainstRollMode,
  saveRollMode: effect.saveRollMode
}), state);

const recordDamageDefenses = (
  state: FightBattleState,
  target: FightSide,
  source: FightSide,
  sourceName: string,
  components: ReturnType<typeof rollFightDamageComponents>["components"]
): FightBattleState => components.reduce((next, component) => {
  if (component.multiplier === 1) return next;
  const type = component.multiplier === 0
    ? "damage-immune"
    : component.multiplier < 1
      ? "damage-resisted"
      : "damage-vulnerable";
  const label = component.multiplier === 0
    ? `Immune to ${component.damageType}`
    : component.multiplier < 1
      ? `Resists ${component.damageType}`
      : `Vulnerable to ${component.damageType}`;
  return appendFightPresentationEvent(next, {
    type,
    delivery: "system",
    side: target,
    sourceSide: source,
    label,
    damageType: component.damageType,
    sourceName
  });
}, state);

const applyDamage = (
  state: FightBattleState,
  target: FightSide,
  damage: number
): { state: FightBattleState; hitPointsAfter: number; temporaryHitPointsAbsorbed: number } => {
  const temporaryHitPoints = state[target].temporaryHitPoints ?? 0;
  const temporaryHitPointsAbsorbed = Math.min(temporaryHitPoints, damage);
  const hitPointDamage = Math.max(0, damage - temporaryHitPointsAbsorbed);
  const hitPointsAfter = Math.max(0, state[target].currentHitPoints - hitPointDamage);
  return {
    state: {
      ...state,
      [target]: {
        ...state[target],
        currentHitPoints: hitPointsAfter,
        temporaryHitPoints: temporaryHitPoints - temporaryHitPointsAbsorbed
      }
    },
    hitPointsAfter,
    temporaryHitPointsAbsorbed
  };
};

const resolveConcentrationDamageCheck = (
  state: FightBattleState,
  target: FightSide,
  damage: number,
  randomInteger?: RandomIntegerSource
): FightBattleState => {
  if (damage <= 0 || !state[target].concentration || state[target].currentHitPoints <= 0) return state;
  const dc = Math.max(10, Math.floor(damage / 2));
  const result = resolveFightSavingThrow({
    state,
    side: target,
    ability: "con",
    dc,
    randomInteger
  });
  let next = appendFightPresentationEvent(result.state, {
    type: result.succeeded ? "save-success" : "save-failure",
    delivery: "spell",
    side: target,
    sourceSide: target,
    label: `Concentration save ${result.succeeded ? "succeeds" : "fails"}`,
    iconKey: "concentration",
    sourceName: state[target].concentration?.sourceName,
    saveAbility: "con",
    saveDc: dc,
    saveTotal: result.total
  });
  if (!result.succeeded) next = breakFightConcentration(next, target);
  return next;
};

const completeIfDowned = (
  state: FightBattleState,
  target: FightSide,
  attacker: FightSide,
  options: FightTurnOptions = {}
): FightBattleState => {
  if (state[target].currentHitPoints > 0) return state;
  let next = breakFightConcentration(state, target);
  next = appendFightPresentationEvent(next, {
    type: "downed",
    delivery: "system",
    side: target,
    sourceSide: attacker,
    label: `${next[target].profile.name} is down`,
    iconKey: "downed"
  });
  const replacement = options.onOpponentDowned?.(next, attacker, target);
  if (replacement && replacement.currentHitPoints > 0) {
    return synchronizeFightDistance({
      ...next,
      status: "active",
      winner: undefined,
      [target]: replacement
    });
  }
  return { ...next, status: "complete", winner: attacker };
};

const resolveAttackAction = (
  state: FightBattleState,
  attacker: FightSide,
  action: FightAttackAction,
  randomInteger?: RandomIntegerSource,
  options: FightTurnOptions = {}
): FightBattleState => {
  const target: FightSide = attacker === "character" ? "monster" : "character";
  const distanceFeet = fightBattleDistanceFeet(state);
  const distanceRollMode = fightAttackDistanceRollMode(action, distanceFeet, state[target]);
  const followUpRollMode = fightAttackFollowUpRollMode(state[attacker], state[target]);
  const actionRollMode = combineFightRollModes(action.attackRollMode, distanceRollMode, followUpRollMode);
  const rollMode = fightAttackRollMode(state[attacker], state[target], actionRollMode, distanceFeet);
  const roll = resolveFightAttackRoll({
    state,
    side: attacker,
    action,
    armorClass: state[target].profile.armorClass,
    rollMode,
    randomInteger
  });
  const natural = roll.naturalRoll;
  const criticalAt = Math.min(20, Math.max(2, Math.trunc(action.criticalAt ?? 20)));
  const hitsArmorClass = fightAttackHits({
    natural,
    total: roll.total,
    armorClass: state[target].profile.armorClass,
    criticalAt
  });
const outcome = !hitsArmorClass
  ? "miss"
  : natural === 20 || natural >= criticalAt
    ? "critical"
    : "hit";
  const damage = outcome === "miss"
    ? { rawTotal: 0, appliedTotal: 0, components: [] }
    : rollFightDamageComponents({
        target: state[target].profile,
        components: action.damage,
        critical: outcome === "critical",
        randomInteger
      });
  let next = consumeFightAttackFollowUps(roll.state, attacker, target);
  next = recordDamageDefenses(next, target, attacker, action.name, damage.components);
  const applied = applyDamage(next, target, damage.appliedTotal);
  next = applied.state;
  const attackNumber = next.events.filter((event) => event.round === next.round && event.attacker === attacker).length + 1;
  const event: FightAttackEvent = {
    id: next.events.length + 1,
    round: next.round,
    attacker,
    target,
    attackNumber,
    sourceActionName: action.name,
    naturalRoll: natural,
    attackTotal: roll.total,
    outcome,
    rawDamage: damage.rawTotal || undefined,
    damage: damage.appliedTotal,
    damageTypes: damage.components.map((component) => component.damageType),
    temporaryHitPointsAbsorbed: applied.temporaryHitPointsAbsorbed || undefined,
    targetHitPointsAfter: applied.hitPointsAfter,
    summary: `${state[attacker].profile.name} ${action.name}: ${outcome}${damage.appliedTotal ? ` for ${damage.appliedTotal} damage` : ""}.`
  };
  next = { ...next, events: [...next.events, event] };
  next = recordFightAttackPresentation({
    state: next,
    attacker,
    target,
    sourceName: action.name,
    outcome,
    damage: damage.appliedTotal,
    delivery: action.delivery ?? state[attacker].profile.attackDelivery ?? "weapon"
  });
  if (outcome === "critical") {
    next = resolveFightPostCriticalMovement({ state: next, attacker, target, action });
  }
  next = recordFightAttackFollowUps({
    state: next,
    attacker,
    target,
    outcome,
    damage: damage.appliedTotal
  });
  if (outcome !== "miss") next = applyActionEffects(next, target, attacker, action.name, action.effectsOnHit);
  if (applied.hitPointsAfter === 0) return completeIfDowned(next, target, attacker, options);
  return resolveConcentrationDamageCheck(next, target, damage.appliedTotal, randomInteger);
};

const resolveSaveAction = (
  state: FightBattleState,
  attacker: FightSide,
  action: FightSaveAction,
  randomInteger?: RandomIntegerSource,
  options: FightTurnOptions = {}
): FightBattleState => {
  const target: FightSide = attacker === "character" ? "monster" : "character";
  const result = resolveFightSavingThrow({
    state,
    side: target,
    ability: action.saveAbility,
    dc: action.saveDc,
    randomInteger
  });
  const succeeded = result.succeeded;
  const delivery = action.delivery ?? "spell";
  let next = appendFightPresentationEvent(result.state, {
    type: succeeded ? "save-success" : "save-failure",
    delivery,
    side: target,
    sourceSide: attacker,
    label: `${action.name}: ${action.saveAbility.toUpperCase()} save ${succeeded ? "succeeds" : "fails"}`,
    sourceName: action.name,
    saveAbility: action.saveAbility,
    saveDc: action.saveDc,
    saveTotal: result.total
  });
  const successMode = action.damageOnSuccess ?? "none";
  const damageFraction: 0 | 0.5 | 1 = succeeded
    ? successMode === "full" ? 1 : successMode === "half" ? 0.5 : 0
    : 1;
  if (action.damage?.length && damageFraction > 0) {
    const damage = rollFightDamageComponents({
      target: next[target].profile,
      components: action.damage,
      critical: false,
      damageFraction,
      randomInteger
    });
    next = recordDamageDefenses(next, target, attacker, action.name, damage.components);
    const applied = applyDamage(next, target, damage.appliedTotal);
    next = applied.state;
    next = appendFightPresentationEvent(next, {
      type: "hit",
      delivery,
      side: target,
      sourceSide: attacker,
      label: `${action.name} deals damage`,
      sourceName: action.name,
      amount: damage.appliedTotal || undefined
    });
    if (applied.hitPointsAfter === 0) return completeIfDowned(next, target, attacker, options);
    next = resolveConcentrationDamageCheck(next, target, damage.appliedTotal, randomInteger);
  }
  next = applyActionEffects(
    next,
    target,
    attacker,
    action.name,
    succeeded ? action.effectsOnSuccess : action.effectsOnFailure
  );
  return next;
};

const executeAction = (
  state: FightBattleState,
  attacker: FightSide,
  action: FightActionDefinition,
  randomInteger?: RandomIntegerSource,
  options: FightActionExecutionOptions = {}
): FightBattleState => {
  if (!options.skipEconomy && !canUseAction(state, attacker, action)) return state;
  let next = moveIntoRange(state, attacker, action);
  const maximumRangeFeet = fightActionMaximumRangeFeet(action);
  if (maximumRangeFeet > 0
    && fightBattleDistanceFeet(next) > maximumRangeFeet
    && action.kind !== "heal"
    && action.kind !== "temporary-hit-points"
    && action.kind !== "grant-action") return next;
  next = spendAction(next, attacker, action, options);
  if (action.requiresConcentration) next = startFightConcentration(next, attacker, action.name);

  if (action.kind === "attack") return resolveAttackAction(next, attacker, action, randomInteger, options.turnOptions);
  if (action.kind === "save") return resolveSaveAction(next, attacker, action, randomInteger, options.turnOptions);
  if (action.kind === "heal") {
    const amount = Math.max(0, rollDiceFormula(action.formula, { randomInteger }).total);
    let healed = healFightCombatant(next, attacker, amount, action.name);
    const movementGrantedFeet = Math.max(0, action.movementGrantedFeet ?? 0);
    if (movementGrantedFeet > 0) {
      healed = {
        ...healed,
        [attacker]: {
          ...healed[attacker],
          economy: {
            ...healed[attacker].economy,
            movementRemainingFeet: healed[attacker].economy.movementRemainingFeet + movementGrantedFeet
          }
        }
      };
      healed = appendFightPresentationEvent(healed, {
        type: "movement",
        delivery: "system",
        side: attacker,
        sourceSide: attacker,
        label: `${action.name}: ${movementGrantedFeet} ft movement available`,
        sourceName: action.name,
        amount: movementGrantedFeet,
        iconKey: "movement"
      });
    }
    return healed;
  }
  if (action.kind === "temporary-hit-points") {
    const amount = Math.max(0, rollDiceFormula(action.formula, { randomInteger }).total);
    return grantFightTemporaryHitPoints(next, attacker, amount, action.name);
  }
  if (action.kind === "grant-action") {
    return {
      ...next,
      [attacker]: {
        ...next[attacker],
        economy: {
          ...next[attacker].economy,
          actionsAvailable: next[attacker].economy.actionsAvailable + 1,
          restrictedActionDelivery: action.excludedDelivery
        }
      }
    };
  }
  const multi = action as FightMultiattackAction;
  for (const step of multi.sequence) {
    const component = fightActionsForProfile(next[attacker].profile).find((candidate) => candidate.id === step.actionId);
    if (!component || component.kind === "multiattack") continue;
    for (let count = 0; count < step.count && next.status === "active"; count += 1) {
      next = executeAction(next, attacker, component, randomInteger, {
        skipEconomy: true,
        skipResources: true,
        turnOptions: options.turnOptions
      });
    }
  }
  return next;
};

const primaryAction = (state: FightBattleState, side: FightSide): FightActionDefinition | undefined => {
  const actions = fightActionsForProfile(state[side].profile).filter((action) =>
    action.economy === "action"
    && (action.kind === "attack" || action.kind === "save" || action.kind === "multiattack")
    && canUseAction(state, side, action));
  return actions.find((action) => action.recharge && state[side].rechargeReady[action.id] !== false)
    ?? actions.find((action) => action.kind === "multiattack")
    ?? actions[0];
};

const offensiveBonusAction = (state: FightBattleState, side: FightSide): FightActionDefinition | undefined =>
  fightActionsForProfile(state[side].profile).find((action) =>
    action.economy === "bonus-action"
    && (action.kind === "attack" || action.kind === "save")
    && canUseAction(state, side, action));

const useSupportAction = (
  state: FightBattleState,
  side: FightSide,
  randomInteger?: RandomIntegerSource,
  turnOptions: FightTurnOptions = {}
): FightBattleState => {
  const actions = fightActionsForProfile(state[side].profile);
  const wounded = state[side].currentHitPoints <= Math.floor(state[side].profile.hitPoints / 2);
  const heal = wounded ? actions.find((action) => action.kind === "heal" && canUseAction(state, side, action)) : undefined;
  if (heal) return executeAction(state, side, heal, randomInteger, { turnOptions });
  const temp = (state[side].temporaryHitPoints ?? 0) === 0
    ? actions.find((action) => action.kind === "temporary-hit-points" && canUseAction(state, side, action))
    : undefined;
  return temp ? executeAction(state, side, temp, randomInteger, { turnOptions }) : state;
};

export const resolveFightTurn = (
  state: FightBattleState,
  randomInteger?: RandomIntegerSource,
  options: FightTurnOptions = {}
): FightBattleState => {
  if (state.status !== "active" || !state.initiative?.order) throw new Error("A fight turn requires resolved initiative.");
  const attacker = state.initiative.order[state.activeIndex];
  let next = resolveFightTurnStartTraits(state, attacker);
  next = resolveFightTimedEffectSaves(next, attacker, "start", randomInteger);
  next = tickFightEffects(next, attacker, "start");
  next = resetTurnState(next, attacker);
  next = refreshRecharge(next, attacker, randomInteger);

  if (!isFightIncapacitated(next[attacker])) {
    next = useSupportAction(next, attacker, randomInteger, options);
    const usedFreeActions = new Set<string>();
    while (next.status === "active" && next[attacker].economy.actionsAvailable > 0) {
      const action = primaryAction(next, attacker);
      if (!action) break;
      const actionsBefore = next[attacker].economy.actionsAvailable;
      next = executeAction(next, attacker, action, randomInteger, { turnOptions: options });
      if (next.status !== "active") return next;
      if (next[attacker].economy.actionsAvailable === actionsBefore) break;

      const grant = fightActionsForProfile(next[attacker].profile).find((candidate) =>
        candidate.kind === "grant-action"
        && !usedFreeActions.has(candidate.id)
        && canUseAction(next, attacker, candidate));
      if (grant) {
        usedFreeActions.add(grant.id);
        next = executeAction(next, attacker, grant, randomInteger, { turnOptions: options });
      }
    }

    if (next.status === "active") {
      const bonus = offensiveBonusAction(next, attacker);
      if (bonus) next = executeAction(next, attacker, bonus, randomInteger, { turnOptions: options });
    }
  }

  if (next.status !== "active") return next;
  next = resolveFightTimedEffectSaves(next, attacker, "end", randomInteger);
  next = tickFightEffects(next, attacker, "end");
  next = expireFightAttackFollowUps(next, attacker);
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
