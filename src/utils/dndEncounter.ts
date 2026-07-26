import type { RulesetId } from "../types/ruleCards";

export type DndCombatantSide = "player" | "ally" | "enemy";

export type DndConcentrationState = {
  effectName: string;
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
  ruleset
}: {
  id: string;
  name: string;
  side: DndCombatantSide;
  initiative: number;
  dexterityModifier: number;
  speedFeet: number;
  surprised: boolean;
  ruleset: RulesetId;
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
  concentration: undefined
});

export const sortDndInitiative = (combatants: DndCombatant[]): DndCombatant[] =>
  combatants
    .map((combatant, index) => ({ combatant, index }))
    .sort((left, right) => right.combatant.initiative - left.combatant.initiative || left.index - right.index)
    .map(({ combatant }) => combatant);

const resetTurnResources = (combatant: DndCombatant): DndCombatant => ({
  ...combatant,
  actionAvailable: true,
  bonusActionAvailable: true,
  reactionAvailable: true,
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
  if (ordered.length > 0) ordered[0] = resetTurnResources(ordered[0]);
  return { ruleset, round: ordered.length > 0 ? 1 : 0, currentIndex: 0, started: ordered.length > 0, combatants: ordered };
};

export const isDndTurnRestrictedBySurprise = (
  state: DndEncounterState,
  combatant: DndCombatant
): boolean => state.ruleset === "srd-5.1-2014" && combatant.surprisePending;

export const advanceDndTurn = (input: DndEncounterState): DndEncounterState => {
  if (!input.started || input.combatants.length === 0) return input;
  const combatants = [...input.combatants];
  const current = combatants[input.currentIndex];
  combatants[input.currentIndex] = {
    ...current,
    surprisePending: false,
    reactionAvailable: current.reactionAvailable || (input.ruleset === "srd-5.1-2014" && current.surprisePending)
  };

  const wraps = input.currentIndex >= combatants.length - 1;
  const currentIndex = wraps ? 0 : input.currentIndex + 1;
  combatants[currentIndex] = resetTurnResources(combatants[currentIndex]);

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
