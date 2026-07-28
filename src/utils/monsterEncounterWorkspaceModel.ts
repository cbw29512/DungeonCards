import type { DndGameSystemId } from "../types/cardPlatform";
import type { EncounterMonsterEntry } from "../types/encounterMonsters";
import type {
  MonsterEncounterInstance,
  MonsterEncounterWorkspace
} from "../types/monsterEncounterWorkspace";

const now = (): string => new Date().toISOString();
const integer = (value: unknown, fallback: number): number => {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? Math.trunc(number) : fallback;
};
const bounded = (value: unknown, minimum: number, maximum: number, fallback: number): number => (
  Math.max(minimum, Math.min(maximum, integer(value, fallback)))
);
const meaningfulSectionText = (value: string): boolean => {
  const normalized = value.trim();
  return normalized.length > 0 && !/^(?:[-–—]+|none|n\/a)$/i.test(normalized);
};
const uniqueConditions = (values: unknown): string[] => {
  if (!Array.isArray(values)) return [];
  const seen = new Set<string>();
  return values.flatMap((value) => {
    if (typeof value !== "string") return [];
    const label = value.trim().replace(/\s+/g, " ").slice(0, 60);
    const key = label.toLocaleLowerCase("en-US");
    if (!label || seen.has(key)) return [];
    seen.add(key);
    return [label];
  });
};

export const monsterHitPointMaximum = (entry: EncounterMonsterEntry): number => {
  const raw = entry.kind === "formatted" ? entry.monster.hp : entry.monster.hitPoints;
  const match = raw.match(/\b(\d+)\b/);
  return Math.max(1, match ? Number(match[1]) : 1);
};

export const monsterHasSpecialReaction = (entry: EncounterMonsterEntry): boolean => (
  entry.kind === "formatted"
    ? entry.monster.reactions.length > 0
    : meaningfulSectionText(entry.monster.reactions)
);

export const monsterHasRecharge = (entry: EncounterMonsterEntry): boolean => {
  const text = entry.kind === "formatted"
    ? [...entry.monster.actions, ...entry.monster.bonusActions, ...entry.monster.traits]
        .map((action) => `${action.name} ${action.text ?? ""}`)
        .join(" ")
    : `${entry.monster.traits} ${entry.monster.actions} ${entry.monster.bonusActions}`;
  return /\brecharge\b/i.test(text);
};

export const monsterLegendaryActionMaximum = (entry: EncounterMonsterEntry): number => {
  const legendaryText = entry.kind === "formatted"
    ? entry.monster.legendaryActions.map((action) => `${action.name} ${action.text ?? ""}`).join(" ")
    : entry.monster.legendaryActions;
  if (!meaningfulSectionText(legendaryText)) return 0;
  const explicit = legendaryText.match(/(?:take|has?)\s+(\d+)\s+legendary actions?/i);
  return explicit ? Math.max(1, Number(explicit[1])) : 3;
};

export const createMonsterEncounterInstance = (
  entry: EncounterMonsterEntry,
  instanceId: string,
  label: string
): MonsterEncounterInstance => {
  const maximumHitPoints = monsterHitPointMaximum(entry);
  const legendaryActionsMaximum = monsterLegendaryActionMaximum(entry);
  return {
    instanceId,
    monsterId: entry.id,
    label: label.trim().slice(0, 80) || entry.name,
    pinned: false,
    currentHitPoints: maximumHitPoints,
    maximumHitPoints,
    initiative: null,
    conditions: [],
    reactionAvailable: true,
    rechargeReady: monsterHasRecharge(entry),
    legendaryActionsMaximum,
    legendaryActionsRemaining: legendaryActionsMaximum
  };
};

export const createEmptyMonsterEncounterWorkspace = (
  gameSystemId: DndGameSystemId
): MonsterEncounterWorkspace => ({
  schemaVersion: 3,
  gameSystemId,
  name: "Monster Encounter",
  instances: [],
  updatedAt: now()
});

export const isMonsterEncounterWorkspace = (value: unknown): value is MonsterEncounterWorkspace => {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<MonsterEncounterWorkspace>;
  return item.schemaVersion === 3
    && (item.gameSystemId === "dnd-2014" || item.gameSystemId === "dnd-2024")
    && typeof item.name === "string"
    && typeof item.updatedAt === "string"
    && Array.isArray(item.instances);
};

export const normalizeMonsterEncounterWorkspace = (
  workspace: MonsterEncounterWorkspace,
  gameSystemId: DndGameSystemId,
  entries: EncounterMonsterEntry[]
): MonsterEncounterWorkspace => {
  if (workspace.gameSystemId !== gameSystemId) return createEmptyMonsterEncounterWorkspace(gameSystemId);
  const byId = new Map(entries.map((entry) => [entry.id, entry]));
  const instanceIds = new Set<string>();
  const instances = workspace.instances.flatMap((candidate) => {
    if (!candidate || typeof candidate !== "object") return [];
    const entry = byId.get(candidate.monsterId);
    if (!entry || typeof candidate.instanceId !== "string" || instanceIds.has(candidate.instanceId)) return [];
    instanceIds.add(candidate.instanceId);
    const defaults = createMonsterEncounterInstance(entry, candidate.instanceId, candidate.label || entry.name);
    const maximumHitPoints = bounded(candidate.maximumHitPoints, 1, 100000, defaults.maximumHitPoints);
    const legendaryActionsMaximum = bounded(
      candidate.legendaryActionsMaximum,
      0,
      20,
      defaults.legendaryActionsMaximum
    );
    return [{
      ...defaults,
      label: typeof candidate.label === "string" ? candidate.label.trim().slice(0, 80) || defaults.label : defaults.label,
      pinned: candidate.pinned === true,
      maximumHitPoints,
      currentHitPoints: bounded(candidate.currentHitPoints, 0, maximumHitPoints, maximumHitPoints),
      initiative: candidate.initiative === null || candidate.initiative === undefined
        ? null
        : bounded(candidate.initiative, -100, 100, 0),
      conditions: uniqueConditions(candidate.conditions),
      reactionAvailable: candidate.reactionAvailable === undefined
        ? true
        : candidate.reactionAvailable !== false,
      rechargeReady: candidate.rechargeReady === undefined
        ? defaults.rechargeReady
        : candidate.rechargeReady !== false,
      legendaryActionsMaximum,
      legendaryActionsRemaining: bounded(
        candidate.legendaryActionsRemaining,
        0,
        legendaryActionsMaximum,
        legendaryActionsMaximum
      )
    }];
  });
  return {
    schemaVersion: 3,
    gameSystemId,
    name: workspace.name.trim().slice(0, 100) || "Monster Encounter",
    instances,
    updatedAt: typeof workspace.updatedAt === "string" ? workspace.updatedAt : now()
  };
};