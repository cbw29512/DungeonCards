import type { RulesetId } from "../types/ruleCards";
import {
  createDndCombatant,
  type DndCombatant,
  type DndCombatantEffect,
  type DndEncounterState
} from "./dndEncounter";
import { normalizeDndHealthState } from "./dndHealth";
import type {
  DndMonsterActionKind,
  DndMonsterLiveAction,
  DndMonsterLiveReference
} from "./dndMonsterLiveReference";
import {
  normalizeDndGridPosition,
  parseDndCreatureSize,
  type DndGridPosition
} from "./dndSpatialCombat";

const STORAGE_PREFIX = "dm-forge-dnd-encounter-session-v1";
const MAX_COMBATANTS = 200;
const MAX_ACTIONS_PER_MONSTER = 200;
const MAX_EFFECTS_PER_COMBATANT = 100;

export type DndEncounterSessionSnapshot = {
  schemaVersion: 1;
  ruleset: RulesetId;
  encounter: DndEncounterState;
  monsterReferences: Record<string, DndMonsterLiveReference>;
  positions: Record<string, DndGridPosition>;
  updatedAt: string;
};

export interface DndEncounterSessionRepository {
  load(ruleset: RulesetId): DndEncounterSessionSnapshot;
  save(snapshot: DndEncounterSessionSnapshot): void;
  clear(ruleset: RulesetId): void;
}

const storageKey = (ruleset: RulesetId): string => `${STORAGE_PREFIX}-${ruleset}`;
const object = (value: unknown): Record<string, unknown> | undefined => (
  value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : undefined
);
const integer = (value: unknown, fallback: number, minimum: number, maximum: number): number => {
  const parsed = typeof value === "number" ? value : Number(value);
  const whole = Number.isFinite(parsed) ? Math.trunc(parsed) : fallback;
  return Math.max(minimum, Math.min(maximum, whole));
};
const text = (value: unknown, fallback: string, maximum: number): string => {
  if (typeof value !== "string") return fallback;
  return value.trim().replace(/\s+/g, " ").slice(0, maximum) || fallback;
};
const optionalText = (value: unknown, maximum: number): string | undefined => {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim().replace(/\s+/g, " ").slice(0, maximum);
  return normalized || undefined;
};
const boolean = (value: unknown, fallback: boolean): boolean => (
  typeof value === "boolean" ? value : fallback
);
const rulesetMatches = (value: unknown, ruleset: RulesetId): boolean => value === ruleset;

export const createEmptyDndEncounterSession = (
  ruleset: RulesetId
): DndEncounterSessionSnapshot => ({
  schemaVersion: 1,
  ruleset,
  encounter: {
    ruleset,
    round: 0,
    currentIndex: 0,
    started: false,
    combatants: []
  },
  monsterReferences: {},
  positions: {},
  updatedAt: new Date().toISOString()
});

const normalizeEffect = (value: unknown, index: number): DndCombatantEffect | undefined => {
  const candidate = object(value);
  if (!candidate) return undefined;
  const name = text(candidate.name, "", 120);
  if (!name) return undefined;
  const tickTiming = candidate.tickTiming === "start" || candidate.tickTiming === "end" || candidate.tickTiming === "manual"
    ? candidate.tickTiming
    : "manual";
  return {
    id: text(candidate.id, `effect-${index + 1}`, 120),
    name,
    conditionId: optionalText(candidate.conditionId, 120),
    remainingRounds: candidate.remainingRounds === undefined
      ? undefined
      : integer(candidate.remainingRounds, 1, 1, 100000),
    tickTiming,
    saveAbility: optionalText(candidate.saveAbility, 30),
    saveDc: candidate.saveDc === undefined ? undefined : integer(candidate.saveDc, 1, 1, 1000),
    notes: optionalText(candidate.notes, 500),
    breaksConcentration: boolean(candidate.breaksConcentration, false)
  };
};

const normalizeCombatant = (
  value: unknown,
  ruleset: RulesetId,
  index: number,
  seenIds: Set<string>
): DndCombatant | undefined => {
  const candidate = object(value);
  if (!candidate) return undefined;
  const id = text(candidate.id, "", 160);
  if (!id || seenIds.has(id)) return undefined;
  seenIds.add(id);
  const health = object(candidate.health);
  const maximumHitPoints = integer(health?.maximumHitPoints, 1, 1, 1000000);
  const currentHitPoints = integer(health?.currentHitPoints, maximumHitPoints, 0, maximumHitPoints);
  const side = candidate.side === "player" || candidate.side === "ally" || candidate.side === "enemy"
    ? candidate.side
    : "enemy";
  const speedFeet = integer(candidate.speedFeet, 30, 0, 10000);
  const base = createDndCombatant({
    id,
    name: text(candidate.name, `Combatant ${index + 1}`, 120),
    side,
    initiative: integer(candidate.initiative, 0, -1000, 1000),
    dexterityModifier: integer(candidate.dexterityModifier, 0, -100, 100),
    speedFeet,
    surprised: boolean(candidate.surprised, false),
    ruleset,
    maximumHitPoints,
    currentHitPoints
  });
  const effects = Array.isArray(candidate.effects)
    ? candidate.effects.slice(0, MAX_EFFECTS_PER_COMBATANT)
        .map(normalizeEffect)
        .filter((effect): effect is DndCombatantEffect => Boolean(effect))
    : [];
  const concentration = object(candidate.concentration);
  return {
    ...base,
    movementRemainingFeet: integer(candidate.movementRemainingFeet, speedFeet, 0, 10000),
    actionAvailable: boolean(candidate.actionAvailable, true),
    bonusActionAvailable: boolean(candidate.bonusActionAvailable, true),
    reactionAvailable: boolean(candidate.reactionAvailable, true),
    surprised: boolean(candidate.surprised, false),
    surprisePending: boolean(candidate.surprisePending, false),
    concentration: concentration
      ? { effectName: text(concentration.effectName, "Concentration", 160) }
      : undefined,
    effects,
    health: normalizeDndHealthState({
      ...base.health,
      ruleset,
      maximumHitPoints,
      currentHitPoints,
      temporaryHitPoints: integer(health?.temporaryHitPoints, 0, 0, 1000000),
      deathSaveSuccesses: integer(health?.deathSaveSuccesses, 0, 0, 2),
      deathSaveFailures: integer(health?.deathSaveFailures, 0, 0, 2),
      lifeState: health?.lifeState === "dead" || health?.lifeState === "stable" || health?.lifeState === "unconscious"
        ? health.lifeState
        : "conscious"
    })
  };
};

const normalizeEncounter = (value: unknown, ruleset: RulesetId): DndEncounterState => {
  const candidate = object(value);
  if (!candidate || !rulesetMatches(candidate.ruleset, ruleset)) {
    return createEmptyDndEncounterSession(ruleset).encounter;
  }
  const seenIds = new Set<string>();
  const combatants = Array.isArray(candidate.combatants)
    ? candidate.combatants.slice(0, MAX_COMBATANTS)
        .map((combatant, index) => normalizeCombatant(combatant, ruleset, index, seenIds))
        .filter((combatant): combatant is DndCombatant => Boolean(combatant))
    : [];
  const started = boolean(candidate.started, false) && combatants.length > 0;
  return {
    ruleset,
    round: started ? integer(candidate.round, 1, 1, 1000000) : 0,
    currentIndex: started
      ? integer(candidate.currentIndex, 0, 0, Math.max(0, combatants.length - 1))
      : 0,
    started,
    combatants
  };
};

const actionKinds: DndMonsterActionKind[] = ["action", "bonusAction", "reaction", "legendaryAction"];
const normalizeLiveAction = (value: unknown, index: number): DndMonsterLiveAction | undefined => {
  const candidate = object(value);
  if (!candidate) return undefined;
  const kind = actionKinds.includes(candidate.kind as DndMonsterActionKind)
    ? candidate.kind as DndMonsterActionKind
    : undefined;
  const name = text(candidate.name, "", 160);
  if (!kind || !name) return undefined;
  const rechargeMinimum = candidate.rechargeMinimum === undefined
    ? undefined
    : integer(candidate.rechargeMinimum, 1, 1, 6);
  return {
    id: text(candidate.id, `${kind}-${index + 1}`, 180),
    kind,
    name,
    summary: text(candidate.summary, "Open the sourced monster folio for the complete procedure.", 1000),
    reachOrRange: optionalText(candidate.reachOrRange, 160),
    rechargeLabel: optionalText(candidate.rechargeLabel, 120),
    rechargeMinimum,
    rechargeReady: boolean(candidate.rechargeReady, true)
  };
};

const normalizeMonsterReferences = (
  value: unknown,
  combatantIds: Set<string>
): Record<string, DndMonsterLiveReference> => {
  const candidate = object(value);
  if (!candidate) return {};
  return Object.fromEntries(Object.entries(candidate).flatMap(([combatantId, raw]) => {
    if (!combatantIds.has(combatantId)) return [];
    const reference = object(raw);
    if (!reference) return [];
    const actions = Array.isArray(reference.actions)
      ? reference.actions.slice(0, MAX_ACTIONS_PER_MONSTER)
          .map(normalizeLiveAction)
          .filter((action): action is DndMonsterLiveAction => Boolean(action))
      : [];
    return [[combatantId, {
      monsterId: text(reference.monsterId, combatantId, 180),
      sourceReference: text(reference.sourceReference, "Saved encounter source", 300),
      size: parseDndCreatureSize(typeof reference.size === "string" ? reference.size : undefined),
      armorClass: text(reference.armorClass, "", 120),
      savingThrows: text(reference.savingThrows, "", 500),
      senses: text(reference.senses, "", 500),
      actions
    } satisfies DndMonsterLiveReference]];
  }));
};

const normalizePositions = (
  value: unknown,
  combatantIds: Set<string>
): Record<string, DndGridPosition> => {
  const candidate = object(value);
  if (!candidate) return {};
  return Object.fromEntries(Object.entries(candidate).flatMap(([combatantId, raw]) => {
    if (!combatantIds.has(combatantId)) return [];
    const position = object(raw);
    if (!position) return [];
    return [[combatantId, normalizeDndGridPosition({
      x: integer(position.x, 0, -100000, 100000),
      y: integer(position.y, 0, -100000, 100000),
      size: parseDndCreatureSize(typeof position.size === "string" ? position.size : undefined)
    })]];
  }));
};

export const normalizeDndEncounterSession = (
  value: unknown,
  ruleset: RulesetId
): DndEncounterSessionSnapshot => {
  const candidate = object(value);
  if (!candidate || candidate.schemaVersion !== 1 || !rulesetMatches(candidate.ruleset, ruleset)) {
    return createEmptyDndEncounterSession(ruleset);
  }
  const encounter = normalizeEncounter(candidate.encounter, ruleset);
  const combatantIds = new Set(encounter.combatants.map((combatant) => combatant.id));
  return {
    schemaVersion: 1,
    ruleset,
    encounter,
    monsterReferences: normalizeMonsterReferences(candidate.monsterReferences, combatantIds),
    positions: normalizePositions(candidate.positions, combatantIds),
    updatedAt: typeof candidate.updatedAt === "string" ? candidate.updatedAt : new Date().toISOString()
  };
};

export const createDndEncounterSessionRepository = (
  storage: Storage
): DndEncounterSessionRepository => ({
  load: (ruleset) => {
    try {
      const raw = storage.getItem(storageKey(ruleset));
      return raw ? normalizeDndEncounterSession(JSON.parse(raw), ruleset) : createEmptyDndEncounterSession(ruleset);
    } catch (error) {
      console.error("Loading the D&D encounter session failed", { ruleset, error });
      return createEmptyDndEncounterSession(ruleset);
    }
  },
  save: (snapshot) => storage.setItem(storageKey(snapshot.ruleset), JSON.stringify({
    ...snapshot,
    schemaVersion: 1,
    updatedAt: new Date().toISOString()
  })),
  clear: (ruleset) => storage.removeItem(storageKey(ruleset))
});