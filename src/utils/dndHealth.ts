import type { RulesetId } from "../types/ruleCards";

export type DndLifeState = "conscious" | "unconscious" | "stable" | "dead";

export type DndHealthState = {
  ruleset: RulesetId;
  maximumHitPoints: number;
  currentHitPoints: number;
  temporaryHitPoints: number;
  deathSaveSuccesses: number;
  deathSaveFailures: number;
  lifeState: DndLifeState;
};

export type DndDamageResult = {
  state: DndHealthState;
  temporaryHitPointsLost: number;
  hitPointsLost: number;
  massiveDamageRemainder: number;
  deathFailuresAdded: number;
  summary: string;
};

const whole = (value: number, minimum = 0): number =>
  Math.max(minimum, Math.trunc(Number.isFinite(value) ? value : minimum));

export const normalizeDndHealthState = (state: DndHealthState): DndHealthState => {
  const maximumHitPoints = Math.max(1, whole(state.maximumHitPoints, 1));
  const currentHitPoints = Math.min(maximumHitPoints, whole(state.currentHitPoints));
  const lifeState = state.lifeState === "dead"
    ? "dead"
    : currentHitPoints > 0
      ? "conscious"
      : state.lifeState === "stable"
        ? "stable"
        : "unconscious";
  return {
    ...state,
    maximumHitPoints,
    currentHitPoints,
    temporaryHitPoints: whole(state.temporaryHitPoints),
    deathSaveSuccesses: Math.min(2, whole(state.deathSaveSuccesses)),
    deathSaveFailures: Math.min(2, whole(state.deathSaveFailures)),
    lifeState
  };
};

export const createDndHealthState = (
  ruleset: RulesetId,
  maximumHitPoints: number,
  currentHitPoints: number = maximumHitPoints
): DndHealthState => normalizeDndHealthState({
  ruleset,
  maximumHitPoints,
  currentHitPoints,
  temporaryHitPoints: 0,
  deathSaveSuccesses: 0,
  deathSaveFailures: 0,
  lifeState: currentHitPoints > 0 ? "conscious" : "unconscious"
});

export const isDndBloodied = (state: DndHealthState): boolean =>
  state.ruleset === "srd-5.2.1-2024"
  && state.currentHitPoints > 0
  && state.currentHitPoints <= Math.floor(state.maximumHitPoints / 2);

export const applyDndDamage = (
  inputState: DndHealthState,
  incomingDamage: number,
  criticalHit = false
): DndDamageResult => {
  const state = normalizeDndHealthState(inputState);
  const damage = whole(incomingDamage);
  if (state.lifeState === "dead" || damage === 0) {
    return { state, temporaryHitPointsLost: 0, hitPointsLost: 0, massiveDamageRemainder: 0, deathFailuresAdded: 0, summary: state.lifeState === "dead" ? "The creature is dead; ordinary damage no longer changes this tracker." : "No damage was applied." };
  }

  const temporaryHitPointsLost = Math.min(state.temporaryHitPoints, damage);
  const damageAfterTemporary = damage - temporaryHitPointsLost;
  const temporaryHitPoints = state.temporaryHitPoints - temporaryHitPointsLost;

  if (damageAfterTemporary === 0) {
    return {
      state: { ...state, temporaryHitPoints },
      temporaryHitPointsLost,
      hitPointsLost: 0,
      massiveDamageRemainder: 0,
      deathFailuresAdded: 0,
      summary: "Temporary Hit Points absorbed all incoming damage."
    };
  }

  if (state.currentHitPoints === 0) {
    if (damageAfterTemporary >= state.maximumHitPoints) {
      return {
        state: { ...state, temporaryHitPoints, lifeState: "dead", deathSaveSuccesses: 0, deathSaveFailures: 0 },
        temporaryHitPointsLost,
        hitPointsLost: 0,
        massiveDamageRemainder: damageAfterTemporary,
        deathFailuresAdded: 0,
        summary: "Damage remaining after Temporary HP equaled or exceeded the Hit Point maximum: instant death."
      };
    }
    const deathFailuresAdded = criticalHit ? 2 : 1;
    const failures = state.deathSaveFailures + deathFailuresAdded;
    const died = failures >= 3;
    return {
      state: {
        ...state,
        temporaryHitPoints,
        lifeState: died ? "dead" : "unconscious",
        deathSaveFailures: died ? 0 : Math.min(2, failures),
        deathSaveSuccesses: died ? 0 : state.deathSaveSuccesses
      },
      temporaryHitPointsLost,
      hitPointsLost: 0,
      massiveDamageRemainder: 0,
      deathFailuresAdded,
      summary: died ? "Damage at 0 HP caused the third Death Save failure: death." : `${criticalHit ? "Critical damage" : "Damage"} remaining after Temporary HP caused ${deathFailuresAdded} Death Save failure${deathFailuresAdded === 1 ? "" : "s"}.`
    };
  }

  const hitPointsLost = Math.min(state.currentHitPoints, damageAfterTemporary);
  const nextHitPoints = state.currentHitPoints - hitPointsLost;
  const massiveDamageRemainder = Math.max(0, damageAfterTemporary - state.currentHitPoints);
  const instantDeath = nextHitPoints === 0 && massiveDamageRemainder >= state.maximumHitPoints;
  const lifeState: DndLifeState = instantDeath ? "dead" : nextHitPoints === 0 ? "unconscious" : "conscious";

  return {
    state: {
      ...state,
      currentHitPoints: nextHitPoints,
      temporaryHitPoints,
      lifeState,
      deathSaveSuccesses: nextHitPoints === 0 ? 0 : state.deathSaveSuccesses,
      deathSaveFailures: nextHitPoints === 0 ? 0 : state.deathSaveFailures
    },
    temporaryHitPointsLost,
    hitPointsLost,
    massiveDamageRemainder,
    deathFailuresAdded: 0,
    summary: instantDeath
      ? "Remaining damage equaled or exceeded the Hit Point maximum: instant death."
      : nextHitPoints === 0
        ? "The creature dropped to 0 HP and is Unconscious, awaiting Death Saving Throws."
        : `${hitPointsLost} Hit Point${hitPointsLost === 1 ? "" : "s"} lost.`
  };
};

export const applyDndHealing = (inputState: DndHealthState, healing: number): DndHealthState => {
  const state = normalizeDndHealthState(inputState);
  if (state.lifeState === "dead") return state;
  const currentHitPoints = Math.min(state.maximumHitPoints, state.currentHitPoints + whole(healing));
  return {
    ...state,
    currentHitPoints,
    lifeState: currentHitPoints > 0 ? "conscious" : state.lifeState,
    deathSaveSuccesses: currentHitPoints > 0 ? 0 : state.deathSaveSuccesses,
    deathSaveFailures: currentHitPoints > 0 ? 0 : state.deathSaveFailures
  };
};

export const chooseDndTemporaryHitPoints = (
  inputState: DndHealthState,
  offeredTemporaryHitPoints: number,
  choice: "keep" | "replace"
): DndHealthState => {
  const state = normalizeDndHealthState(inputState);
  if (choice === "keep") return state;
  return { ...state, temporaryHitPoints: whole(offeredTemporaryHitPoints) };
};

export const resolveDndDeathSave = (inputState: DndHealthState, roll: number): { state: DndHealthState; summary: string } => {
  const state = normalizeDndHealthState(inputState);
  const result = Math.min(20, Math.max(1, whole(roll, 1)));
  if (state.lifeState !== "unconscious" || state.currentHitPoints !== 0) return { state, summary: "A Death Saving Throw is not currently required." };

  if (result === 20) {
    return { state: { ...state, currentHitPoints: 1, lifeState: "conscious", deathSaveSuccesses: 0, deathSaveFailures: 0 }, summary: "Natural 20: regain 1 HP and become conscious." };
  }

  if (result === 1) {
    const failures = state.deathSaveFailures + 2;
    if (failures >= 3) return { state: { ...state, lifeState: "dead", deathSaveSuccesses: 0, deathSaveFailures: 0 }, summary: "Natural 1: two failures caused the third failure. The creature dies." };
    return { state: { ...state, deathSaveFailures: failures }, summary: "Natural 1: record two Death Save failures." };
  }

  if (result >= 10) {
    const successes = state.deathSaveSuccesses + 1;
    if (successes >= 3) return { state: { ...state, lifeState: "stable", deathSaveSuccesses: 0, deathSaveFailures: 0 }, summary: "Third success: the creature is Stable and both counters reset." };
    return { state: { ...state, deathSaveSuccesses: successes }, summary: "Death Save success recorded." };
  }

  const failures = state.deathSaveFailures + 1;
  if (failures >= 3) return { state: { ...state, lifeState: "dead", deathSaveSuccesses: 0, deathSaveFailures: 0 }, summary: "Third failure: the creature dies." };
  return { state: { ...state, deathSaveFailures: failures }, summary: "Death Save failure recorded." };
};

export const stabilizeDndCreature = (inputState: DndHealthState): DndHealthState => {
  const state = normalizeDndHealthState(inputState);
  if (state.lifeState === "dead" || state.currentHitPoints > 0) return state;
  return { ...state, lifeState: "stable", deathSaveSuccesses: 0, deathSaveFailures: 0 };
};

export const recoverStableDndCreature = (inputState: DndHealthState): DndHealthState => {
  const state = normalizeDndHealthState(inputState);
  if (state.lifeState !== "stable") return state;
  return { ...state, currentHitPoints: 1, lifeState: "conscious", deathSaveSuccesses: 0, deathSaveFailures: 0 };
};
