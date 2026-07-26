import type { RulesetId } from "../types/ruleCards";
import { createDndHealthState, type DndHealthState } from "./dndHealth";

export type DndCombatantSide = "player" | "ally" | "enemy";
export type DndEffectTickTiming = "start" | "end" | "manual";

export type DndConcentrationState = {
  effectName: string;
};

export type DndCombatantEffect = {
  id: string;
  name: string;
  conditionId?: string;
  remainingRounds?: number;
  tickTiming: DndEffectTickTiming;
  saveAbility?: string;
  saveDc?: number;
  notes?: string;
  breaksConcentration: boolean;
};

export type DndCombatant = {
  id: string;
  name: string;
  side: DndCombatantSide;
  initiative: number;
  dexterityModifier: number;
  speedFeet: number;
  movementRemainingFeet: number;
  actionAvailable: boolean;
  bonusActionAvailable: boolean;
  reactionAvailable: boolean;
  surprised: boolean;
  surprisePending: boolean;
  concentration?: DndConcentrationState;
  effects: DndCombatantEffect[];
  health: DndHealthState;
};

export type DndEncounterState = {
  ruleset: RulesetId;
  round: number;
  currentIndex: number;
  started: boolean;
  combatants: DndCombatant[];
};

const whole = (value: number, minimum = 0): number =>
  Math.max(minimum, Math.trunc(Number.isFinite(value) ? value : minimum));

export const createDndCombatant = ({
  id,
  name,
  side,
  initiative,
  dexterityModifier,
  speedFeet,
  surprised,
  ruleset,
  maximumHitPoints = 10,
  currentHitPoints = maximumHitPoints
}: {
  id: string;
  name: string;
  side: DndCombatantSide;
  initiative: number;
  dexterityModifier: number;
  speedFeet: number;
  surprised: boolean;
  ruleset: RulesetId;
  maximumHitPoints?: number;
  currentHitPoints?: number;
}): DndCombatant => ({
  id,
  name: name.trim() || "Unnamed combatant",
  side,
  initiative: Math.trunc(initiative),
  dexterityModifier: Math.trunc(dexterityModifier),
  speedFeet: whole(speedFeet),
  movementRemainingFeet: whole(speedFeet),
  actionAvailable: true,
  bonusActionAvailable: true,
  reactionAvailable: ruleset === "srd-5.1-2014" ? !surprised : true,
  surprised,
  surprisePending: surprised,
  concentration: undefined,
  effects: [],
  health: createDndHealthState(ruleset, maximumHitPoints, currentHitPoints)
});

export const sortDndInitiative = (combatants: DndCombatant[]): DndCombatant[] =>
  combatants
    .map((combatant, index) => ({ combatant, index }))
    .sort((left, right) => right.combatant.initiative - left.combatant.initiative || left.index - right.index)
    .map(({ combatant }) => combatant);

const tickDndEffects = (
  combatant: DndCombatant,
  timing: Exclude<DndEffectTickTiming, "manual">
): DndCombatant => ({
  ...combatant,
  effects: combatant.effects
    .map((effect) => effect.tickTiming === timing && effect.remainingRounds !== undefined
      ? { ...effect, remainingRounds: Math.max(0, effect.remainingRounds - 1) }
      : effect)
    .filter((effect) => effect.remainingRounds === undefined || effect.remainingRounds > 0)
});

const resetTurnResources = (
  ruleset: RulesetId,
  combatant: DndCombatant
): DndCombatant => ({
  ...combatant,
  actionAvailable: true,
  bonusActionAvailable: true,
  reactionAvailable: ruleset === "srd-5.1-2014" && combatant.surprisePending
    ? false
    : true,
  movementRemainingFeet: combatant.speedFeet
});

export const startDndEncounter = (
  ruleset: RulesetId,
  combatants: DndCombatant[]
): DndEncounterState => {
  const ordered = sortDndInitiative(combatants).map((combatant) => ({
    ...combatant,
    reactionAvailable: ruleset === "srd-5.1-2014" ? !combatant.surprisePending : true
  }));
  if (ordered.length > 0) ordered[0] = tickDndEffects(resetTurnResources(ruleset, ordered[0]), "start");
  return { ruleset, round: ordered.length > 0 ? 1 : 0, currentIndex: 0, started: ordered.length > 0, combatants: ordered };
};

export const isDndTurnRestrictedBySurprise = (
  state: DndEncounterState,
  combatant: DndCombatant
): boolean => state.ruleset === "srd-5.1-2014" && combatant.surprisePending;

export const advanceDndTurn = (input: DndEncounterState): DndEncounterState => {
  if (!input.started || input.combatants.length === 0) return input;
  const combatants = [...input.combatants];
  const current = tickDndEffects(combatants[input.currentIndex], "end");
  combatants[input.currentIndex] = {
    ...current,
    surprisePending: false,
    reactionAvailable: current.reactionAvailable || (input.ruleset === "srd-5.1-2014" && current.surprisePending)
  };

  const wraps = input.currentIndex >= combatants.length - 1;
  const currentIndex = wraps ? 0 : input.currentIndex + 1;
  combatants[currentIndex] = tickDndEffects(
    resetTurnResources(input.ruleset, combatants[currentIndex]),
    "start"
  );

  return {
    ...input,
    round: wraps ? input.round + 1 : input.round,
    currentIndex,
    combatants
  };
};

export const moveDndCombatant = (
  state: DndEncounterState,
  combatantId: string,
  direction: -1 | 1
): DndEncounterState => {
  const index = state.combatants.findIndex((combatant) => combatant.id === combatantId);
  const targetIndex = index + direction;
  if (index < 0 || targetIndex < 0 || targetIndex >= state.combatants.length) return state;
  const activeId = state.combatants[state.currentIndex]?.id;
  const combatants = [...state.combatants];
  [combatants[index], combatants[targetIndex]] = [combatants[targetIndex], combatants[index]];
  const currentIndex = Math.max(0, combatants.findIndex((combatant) => combatant.id === activeId));
  return { ...state, combatants, currentIndex };
};

export const updateDndCombatant = (
  state: DndEncounterState,
  combatantId: string,
  patch: Partial<DndCombatant>
): DndEncounterState => ({
  ...state,
  combatants: state.combatants.map((combatant) => combatant.id === combatantId ? { ...combatant, ...patch } : combatant)
});

export const addDndCombatantEffect = (
  state: DndEncounterState,
  combatantId: string,
  effect: DndCombatantEffect
): DndEncounterState => {
  const combatant = state.combatants.find((candidate) => candidate.id === combatantId);
  if (!combatant || !effect.name.trim()) return state;
  return updateDndCombatant(state, combatantId, {
    effects: [...combatant.effects, {
      ...effect,
      name: effect.name.trim(),
      remainingRounds: effect.remainingRounds === undefined ? undefined : Math.max(1, whole(effect.remainingRounds, 1)),
      saveDc: effect.saveDc === undefined ? undefined : Math.max(1, whole(effect.saveDc, 1))
    }],
    concentration: effect.breaksConcentration ? undefined : combatant.concentration
  });
};

export const removeDndCombatantEffect = (
  state: DndEncounterState,
  combatantId: string,
  effectId: string
): DndEncounterState => {
  const combatant = state.combatants.find((candidate) => candidate.id === combatantId);
  if (!combatant) return state;
  return updateDndCombatant(state, combatantId, {
    effects: combatant.effects.filter((effect) => effect.id !== effectId)
  });
};

export const resolveDndEffectSave = (
  state: DndEncounterState,
  combatantId: string,
  effectId: string,
  roll: number,
  saveBonus: number
): { state: DndEncounterState; total: number; succeeded: boolean } => {
  const combatant = state.combatants.find((candidate) => candidate.id === combatantId);
  const effect = combatant?.effects.find((candidate) => candidate.id === effectId);
  const total = Math.min(20, Math.max(1, whole(roll, 1))) + Math.trunc(saveBonus);
  if (!combatant || !effect?.saveDc) return { state, total, succeeded: false };
  const succeeded = total >= effect.saveDc;
  return {
    state: succeeded ? removeDndCombatantEffect(state, combatantId, effectId) : state,
    total,
    succeeded
  };
};

export const spendDndTurnResource = (
  state: DndEncounterState,
  combatantId: string,
  resource: "action" | "bonusAction" | "reaction"
): DndEncounterState => updateDndCombatant(state, combatantId, {
  ...(resource === "action" ? { actionAvailable: false } : {}),
  ...(resource === "bonusAction" ? { bonusActionAvailable: false } : {}),
  ...(resource === "reaction" ? { reactionAvailable: false } : {})
});

export const spendDndMovement = (
  state: DndEncounterState,
  combatantId: string,
  feet: number
): DndEncounterState => {
  const combatant = state.combatants.find((candidate) => candidate.id === combatantId);
  if (!combatant) return state;
  return updateDndCombatant(state, combatantId, {
    movementRemainingFeet: Math.max(0, combatant.movementRemainingFeet - whole(feet))
  });
};

export const calculateDndConcentrationDc = (
  ruleset: RulesetId,
  damageTaken: number
): number => {
  const dc = Math.max(10, Math.floor(whole(damageTaken) / 2));
  return ruleset === "srd-5.2.1-2024" ? Math.min(30, dc) : dc;
};

export const resolveDndConcentrationSave = ({
  ruleset,
  damageTaken,
  roll,
  constitutionSaveBonus
}: {
  ruleset: RulesetId;
  damageTaken: number;
  roll: number;
  constitutionSaveBonus: number;
}): { dc: number; total: number; maintained: boolean } => {
  const dc = calculateDndConcentrationDc(ruleset, damageTaken);
  const total = Math.min(20, Math.max(1, whole(roll, 1))) + Math.trunc(constitutionSaveBonus);
  return { dc, total, maintained: total >= dc };
};

export const startDndConcentration = (
  state: DndEncounterState,
  combatantId: string,
  effectName: string
): DndEncounterState => updateDndCombatant(state, combatantId, {
  concentration: { effectName: effectName.trim() || "Unnamed effect" }
});

export const endDndConcentration = (
  state: DndEncounterState,
  combatantId: string
): DndEncounterState => updateDndCombatant(state, combatantId, { concentration: undefined });
