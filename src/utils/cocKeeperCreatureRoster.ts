import type { CocCreatureRecord } from "../types/coc";
import type {
  CocKeeperCreatureInstance,
  CocKeeperCreatureRoster
} from "../types/cocKeeperCreatureRoster";

export const COC_KEEPER_CREATURE_ROSTER_KEY = "dungeon-cards-coc-keeper-creature-roster-v1";

export type CocKeeperRosterStorage = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem?(key: string): void;
};

const now = (): string => new Date().toISOString();
const boundedInteger = (value: unknown, minimum: number, maximum: number, fallback: number): number => {
  const numeric = typeof value === "number" ? value : Number(value);
  const normalized = Number.isFinite(numeric) ? Math.trunc(numeric) : fallback;
  return Math.max(minimum, Math.min(maximum, normalized));
};
const cleanLabel = (value: unknown, fallback: string): string => {
  const label = typeof value === "string" ? value.trim().replace(/\s+/g, " ").slice(0, 80) : "";
  return label || fallback;
};
const normalizedLabel = (value: string): string => value
  .normalize("NFKC")
  .toLocaleLowerCase("en-US")
  .replace(/\s+/g, " ")
  .trim();
const uniqueStatuses = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  return value.flatMap((candidate) => {
    if (typeof candidate !== "string") return [];
    const label = candidate.trim().replace(/\s+/g, " ").slice(0, 60);
    const key = normalizedLabel(label);
    if (!label || seen.has(key)) return [];
    seen.add(key);
    return [label];
  }).slice(0, 20);
};

const touched = (
  roster: CocKeeperCreatureRoster,
  updatedAt: string = now()
): CocKeeperCreatureRoster => ({ ...roster, updatedAt });

const updateInstance = (
  roster: CocKeeperCreatureRoster,
  instanceId: string,
  update: (instance: CocKeeperCreatureInstance) => CocKeeperCreatureInstance,
  updatedAt?: string
): CocKeeperCreatureRoster => touched({
  ...roster,
  instances: roster.instances.map((instance) => (
    instance.instanceId === instanceId ? update(instance) : instance
  ))
}, updatedAt);

export const createEmptyCocKeeperCreatureRoster = (
  updatedAt: string = new Date(0).toISOString()
): CocKeeperCreatureRoster => ({
  schemaVersion: 1,
  instances: [],
  selectedInstanceId: null,
  updatedAt
});

const nextCopyLabel = (
  roster: CocKeeperCreatureRoster,
  creature: CocCreatureRecord
): string => {
  const used = new Set(roster.instances.map((instance) => normalizedLabel(instance.label)));
  let copy = 1;
  while (used.has(normalizedLabel(`${creature.name} ${copy}`))) copy += 1;
  return `${creature.name} ${copy}`;
};

export const createCocKeeperCreatureInstance = (
  creature: CocCreatureRecord,
  instanceId: string,
  label: string = creature.name
): CocKeeperCreatureInstance => ({
  instanceId,
  creatureId: creature.id,
  label: cleanLabel(label, creature.name),
  currentHitPoints: Math.max(0, Math.trunc(creature.hitPoints)),
  maximumHitPoints: Math.max(1, Math.trunc(creature.hitPoints) || 1),
  currentMagicPoints: Math.max(0, Math.trunc(creature.magicPoints)),
  maximumMagicPoints: Math.max(0, Math.trunc(creature.magicPoints)),
  statuses: [],
  notes: ""
});

export const addCocKeeperCreatureInstance = (
  roster: CocKeeperCreatureRoster,
  creature: CocCreatureRecord,
  instanceId: string,
  updatedAt?: string
): CocKeeperCreatureRoster => {
  if (!instanceId || roster.instances.some((instance) => instance.instanceId === instanceId)) return roster;
  const instance = createCocKeeperCreatureInstance(creature, instanceId, nextCopyLabel(roster, creature));
  return touched({
    ...roster,
    instances: [...roster.instances, instance],
    selectedInstanceId: instanceId
  }, updatedAt);
};

export const removeCocKeeperCreatureInstance = (
  roster: CocKeeperCreatureRoster,
  instanceId: string,
  updatedAt?: string
): CocKeeperCreatureRoster => {
  const index = roster.instances.findIndex((instance) => instance.instanceId === instanceId);
  if (index < 0) return roster;
  const instances = roster.instances.filter((instance) => instance.instanceId !== instanceId);
  const selectedInstanceId = roster.selectedInstanceId === instanceId
    ? instances[Math.min(index, instances.length - 1)]?.instanceId ?? null
    : roster.selectedInstanceId;
  return touched({ ...roster, instances, selectedInstanceId }, updatedAt);
};

export const selectCocKeeperCreatureInstance = (
  roster: CocKeeperCreatureRoster,
  instanceId: string | null,
  updatedAt?: string
): CocKeeperCreatureRoster => {
  const selectedInstanceId = instanceId && roster.instances.some((instance) => instance.instanceId === instanceId)
    ? instanceId
    : null;
  return touched({ ...roster, selectedInstanceId }, updatedAt);
};

export const renameCocKeeperCreatureInstance = (
  roster: CocKeeperCreatureRoster,
  instanceId: string,
  label: string,
  updatedAt?: string
): CocKeeperCreatureRoster => updateInstance(roster, instanceId, (instance) => ({
  ...instance,
  label: cleanLabel(label, instance.label)
}), updatedAt);

export const setCocKeeperCreatureHitPoints = (
  roster: CocKeeperCreatureRoster,
  instanceId: string,
  value: number,
  updatedAt?: string
): CocKeeperCreatureRoster => updateInstance(roster, instanceId, (instance) => ({
  ...instance,
  currentHitPoints: boundedInteger(value, 0, instance.maximumHitPoints, instance.currentHitPoints)
}), updatedAt);

export const setCocKeeperCreatureMaximumHitPoints = (
  roster: CocKeeperCreatureRoster,
  instanceId: string,
  value: number,
  updatedAt?: string
): CocKeeperCreatureRoster => updateInstance(roster, instanceId, (instance) => {
  const maximumHitPoints = boundedInteger(value, 1, 100000, instance.maximumHitPoints);
  return {
    ...instance,
    maximumHitPoints,
    currentHitPoints: Math.min(instance.currentHitPoints, maximumHitPoints)
  };
}, updatedAt);

export const setCocKeeperCreatureMagicPoints = (
  roster: CocKeeperCreatureRoster,
  instanceId: string,
  value: number,
  updatedAt?: string
): CocKeeperCreatureRoster => updateInstance(roster, instanceId, (instance) => ({
  ...instance,
  currentMagicPoints: boundedInteger(value, 0, instance.maximumMagicPoints, instance.currentMagicPoints)
}), updatedAt);

export const setCocKeeperCreatureMaximumMagicPoints = (
  roster: CocKeeperCreatureRoster,
  instanceId: string,
  value: number,
  updatedAt?: string
): CocKeeperCreatureRoster => updateInstance(roster, instanceId, (instance) => {
  const maximumMagicPoints = boundedInteger(value, 0, 100000, instance.maximumMagicPoints);
  return {
    ...instance,
    maximumMagicPoints,
    currentMagicPoints: Math.min(instance.currentMagicPoints, maximumMagicPoints)
  };
}, updatedAt);

export const addCocKeeperCreatureStatus = (
  roster: CocKeeperCreatureRoster,
  instanceId: string,
  status: string,
  updatedAt?: string
): CocKeeperCreatureRoster => updateInstance(roster, instanceId, (instance) => ({
  ...instance,
  statuses: uniqueStatuses([...instance.statuses, status])
}), updatedAt);

export const removeCocKeeperCreatureStatus = (
  roster: CocKeeperCreatureRoster,
  instanceId: string,
  status: string,
  updatedAt?: string
): CocKeeperCreatureRoster => updateInstance(roster, instanceId, (instance) => ({
  ...instance,
  statuses: instance.statuses.filter((candidate) => candidate !== status)
}), updatedAt);

export const setCocKeeperCreatureNotes = (
  roster: CocKeeperCreatureRoster,
  instanceId: string,
  notes: string,
  updatedAt?: string
): CocKeeperCreatureRoster => updateInstance(roster, instanceId, (instance) => ({
  ...instance,
  notes: notes.slice(0, 2000)
}), updatedAt);

export const restoreCocKeeperCreatureInstance = (
  roster: CocKeeperCreatureRoster,
  instanceId: string,
  creature: CocCreatureRecord,
  updatedAt?: string
): CocKeeperCreatureRoster => updateInstance(roster, instanceId, (instance) => ({
  ...instance,
  currentHitPoints: creature.hitPoints,
  maximumHitPoints: Math.max(1, creature.hitPoints),
  currentMagicPoints: creature.magicPoints,
  maximumMagicPoints: Math.max(0, creature.magicPoints),
  statuses: [],
  notes: ""
}), updatedAt);

export const normalizeCocKeeperCreatureRoster = (
  value: unknown,
  creatures: CocCreatureRecord[],
  updatedAt: string = now()
): CocKeeperCreatureRoster => {
  if (!value || typeof value !== "object") return createEmptyCocKeeperCreatureRoster(updatedAt);
  const candidate = value as Partial<CocKeeperCreatureRoster>;
  if (candidate.schemaVersion !== 1 || !Array.isArray(candidate.instances)) {
    return createEmptyCocKeeperCreatureRoster(updatedAt);
  }
  const byId = new Map(creatures.map((creature) => [creature.id, creature]));
  const instanceIds = new Set<string>();
  const instances = candidate.instances.flatMap((raw) => {
    if (!raw || typeof raw !== "object") return [];
    const instance = raw as Partial<CocKeeperCreatureInstance>;
    const creature = typeof instance.creatureId === "string" ? byId.get(instance.creatureId) : undefined;
    if (!creature || typeof instance.instanceId !== "string" || !instance.instanceId || instanceIds.has(instance.instanceId)) return [];
    instanceIds.add(instance.instanceId);
    const defaults = createCocKeeperCreatureInstance(creature, instance.instanceId, creature.name);
    const maximumHitPoints = boundedInteger(instance.maximumHitPoints, 1, 100000, defaults.maximumHitPoints);
    const maximumMagicPoints = boundedInteger(instance.maximumMagicPoints, 0, 100000, defaults.maximumMagicPoints);
    return [{
      ...defaults,
      label: cleanLabel(instance.label, creature.name),
      maximumHitPoints,
      currentHitPoints: boundedInteger(instance.currentHitPoints, 0, maximumHitPoints, maximumHitPoints),
      maximumMagicPoints,
      currentMagicPoints: boundedInteger(instance.currentMagicPoints, 0, maximumMagicPoints, maximumMagicPoints),
      statuses: uniqueStatuses(instance.statuses),
      notes: typeof instance.notes === "string" ? instance.notes.slice(0, 2000) : ""
    }];
  });
  const selectedInstanceId = typeof candidate.selectedInstanceId === "string"
    && instances.some((instance) => instance.instanceId === candidate.selectedInstanceId)
    ? candidate.selectedInstanceId
    : instances[0]?.instanceId ?? null;
  return {
    schemaVersion: 1,
    instances,
    selectedInstanceId,
    updatedAt: typeof candidate.updatedAt === "string" ? candidate.updatedAt : updatedAt
  };
};

export const loadCocKeeperCreatureRoster = (
  storage: CocKeeperRosterStorage,
  creatures: CocCreatureRecord[]
): { roster: CocKeeperCreatureRoster; error?: string } => {
  const raw = storage.getItem(COC_KEEPER_CREATURE_ROSTER_KEY);
  if (!raw) return { roster: createEmptyCocKeeperCreatureRoster() };
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || (parsed as Partial<CocKeeperCreatureRoster>).schemaVersion !== 1) {
      return {
        roster: createEmptyCocKeeperCreatureRoster(),
        error: "Saved Keeper roster used an unsupported format and was reset safely."
      };
    }
    return { roster: normalizeCocKeeperCreatureRoster(parsed, creatures) };
  } catch {
    return {
      roster: createEmptyCocKeeperCreatureRoster(),
      error: "Saved Keeper roster could not be read and was reset safely."
    };
  }
};

export const saveCocKeeperCreatureRoster = (
  storage: CocKeeperRosterStorage,
  roster: CocKeeperCreatureRoster,
  creatures: CocCreatureRecord[]
): CocKeeperCreatureRoster => {
  const normalized = normalizeCocKeeperCreatureRoster(roster, creatures, roster.updatedAt);
  storage.setItem(COC_KEEPER_CREATURE_ROSTER_KEY, JSON.stringify(normalized));
  return normalized;
};

export const clearCocKeeperCreatureRoster = (
  storage: CocKeeperRosterStorage
): CocKeeperCreatureRoster => {
  storage.removeItem?.(COC_KEEPER_CREATURE_ROSTER_KEY);
  return createEmptyCocKeeperCreatureRoster();
};
