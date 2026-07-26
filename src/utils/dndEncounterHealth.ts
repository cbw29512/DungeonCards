import {
  applyDndDamage,
  applyDndHealing,
  chooseDndTemporaryHitPoints,
  recoverStableDndCreature,
  resolveDndDeathSave,
  stabilizeDndCreature
} from "./dndHealth";
import { updateDndCombatant, type DndEncounterState } from "./dndEncounter";

const shouldEndConcentration = (lifeState: string): boolean =>
  lifeState === "unconscious" || lifeState === "stable" || lifeState === "dead";

const updateCombatantHealth = (
  state: DndEncounterState,
  combatantId: string,
  health: DndEncounterState["combatants"][number]["health"]
): DndEncounterState => {
  const combatant = state.combatants.find((candidate) => candidate.id === combatantId);
  if (!combatant) return state;
  const regainedConsciousness = combatant.health.lifeState !== "conscious" && health.lifeState === "conscious";
  const isActiveTurn = state.started && state.combatants[state.currentIndex]?.id === combatantId;
  const restoreCurrentTurn = regainedConsciousness && isActiveTurn;
  return updateDndCombatant(state, combatantId, {
    health,
    concentration: shouldEndConcentration(health.lifeState) ? undefined : combatant.concentration,
    actionAvailable: restoreCurrentTurn ? true : combatant.actionAvailable,
    bonusActionAvailable: restoreCurrentTurn ? true : combatant.bonusActionAvailable,
    reactionAvailable: restoreCurrentTurn ? true : combatant.reactionAvailable,
    movementRemainingFeet: restoreCurrentTurn ? combatant.speedFeet : combatant.movementRemainingFeet
  });
};

export const applyDndCombatantDamage = (
  state: DndEncounterState,
  combatantId: string,
  damage: number,
  criticalHit = false
): { state: DndEncounterState; summary: string } => {
  const combatant = state.combatants.find((candidate) => candidate.id === combatantId);
  if (!combatant) return { state, summary: "Combatant not found." };
  const result = applyDndDamage(combatant.health, damage, criticalHit);
  return {
    state: updateCombatantHealth(state, combatantId, result.state),
    summary: result.summary
  };
};

export const applyDndCombatantHealing = (
  state: DndEncounterState,
  combatantId: string,
  healing: number
): DndEncounterState => {
  const combatant = state.combatants.find((candidate) => candidate.id === combatantId);
  if (!combatant) return state;
  return updateCombatantHealth(state, combatantId, applyDndHealing(combatant.health, healing));
};

export const chooseDndCombatantTemporaryHitPoints = (
  state: DndEncounterState,
  combatantId: string,
  offeredTemporaryHitPoints: number,
  choice: "keep" | "replace"
): DndEncounterState => {
  const combatant = state.combatants.find((candidate) => candidate.id === combatantId);
  if (!combatant) return state;
  return updateCombatantHealth(
    state,
    combatantId,
    chooseDndTemporaryHitPoints(combatant.health, offeredTemporaryHitPoints, choice)
  );
};

export const resolveDndCombatantDeathSave = (
  state: DndEncounterState,
  combatantId: string,
  roll: number
): { state: DndEncounterState; summary: string } => {
  const combatant = state.combatants.find((candidate) => candidate.id === combatantId);
  if (!combatant) return { state, summary: "Combatant not found." };
  const result = resolveDndDeathSave(combatant.health, roll);
  return {
    state: updateCombatantHealth(state, combatantId, result.state),
    summary: result.summary
  };
};

export const stabilizeDndCombatant = (
  state: DndEncounterState,
  combatantId: string
): DndEncounterState => {
  const combatant = state.combatants.find((candidate) => candidate.id === combatantId);
  if (!combatant) return state;
  return updateCombatantHealth(state, combatantId, stabilizeDndCreature(combatant.health));
};

export const recoverStableDndCombatant = (
  state: DndEncounterState,
  combatantId: string
): DndEncounterState => {
  const combatant = state.combatants.find((candidate) => candidate.id === combatantId);
  if (!combatant) return state;
  return updateCombatantHealth(state, combatantId, recoverStableDndCreature(combatant.health));
};
