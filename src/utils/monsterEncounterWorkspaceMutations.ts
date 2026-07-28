import type { EncounterMonsterEntry } from "../types/encounterMonsters";
import type {
  MonsterEncounterInstance,
  MonsterEncounterWorkspace
} from "../types/monsterEncounterWorkspace";
import type { WorkspaceMoveDirection } from "../types/workspaces";
import { createMonsterEncounterInstance } from "./monsterEncounterWorkspaceModel";

const touched = (workspace: MonsterEncounterWorkspace): MonsterEncounterWorkspace => ({
  ...workspace,
  updatedAt: new Date().toISOString()
});

const updateInstance = (
  workspace: MonsterEncounterWorkspace,
  instanceId: string,
  update: (instance: MonsterEncounterInstance) => MonsterEncounterInstance
): MonsterEncounterWorkspace => touched({
  ...workspace,
  instances: workspace.instances.map((instance) => (
    instance.instanceId === instanceId ? update(instance) : instance
  ))
});

const normalizedLabel = (value: string): string => value
  .normalize("NFKC")
  .toLocaleLowerCase("en-US")
  .replace(/\s+/g, " ")
  .trim();

const copyLabel = (workspace: MonsterEncounterWorkspace, entry: EncounterMonsterEntry): string => {
  const used = new Set(workspace.instances.map((instance) => normalizedLabel(instance.label)));
  let copyNumber = 1;
  while (used.has(normalizedLabel(`${entry.name} ${copyNumber}`))) copyNumber += 1;
  return `${entry.name} ${copyNumber}`;
};

export const addMonsterEncounterInstance = (
  workspace: MonsterEncounterWorkspace,
  entry: EncounterMonsterEntry,
  instanceId: string
): MonsterEncounterWorkspace => {
  if (workspace.instances.some((instance) => instance.instanceId === instanceId)) return workspace;
  return touched({
    ...workspace,
    instances: [
      ...workspace.instances,
      createMonsterEncounterInstance(entry, instanceId, copyLabel(workspace, entry))
    ]
  });
};

export const removeMonsterEncounterInstance = (
  workspace: MonsterEncounterWorkspace,
  instanceId: string
): MonsterEncounterWorkspace => touched({
  ...workspace,
  instances: workspace.instances.filter((instance) => instance.instanceId !== instanceId)
});

export const renameMonsterEncounterInstance = (
  workspace: MonsterEncounterWorkspace,
  instanceId: string,
  label: string
): MonsterEncounterWorkspace => updateInstance(workspace, instanceId, (instance) => ({
  ...instance,
  label: label.trim().replace(/\s+/g, " ").slice(0, 80) || instance.label
}));

export const setMonsterEncounterHitPoints = (
  workspace: MonsterEncounterWorkspace,
  instanceId: string,
  currentHitPoints: number
): MonsterEncounterWorkspace => updateInstance(workspace, instanceId, (instance) => ({
  ...instance,
  currentHitPoints: Math.max(0, Math.min(instance.maximumHitPoints, Math.trunc(currentHitPoints) || 0))
}));

export const setMonsterEncounterMaximumHitPoints = (
  workspace: MonsterEncounterWorkspace,
  instanceId: string,
  maximumHitPoints: number
): MonsterEncounterWorkspace => updateInstance(workspace, instanceId, (instance) => {
  const maximum = Math.max(1, Math.min(100000, Math.trunc(maximumHitPoints) || 1));
  return {
    ...instance,
    maximumHitPoints: maximum,
    currentHitPoints: Math.min(instance.currentHitPoints, maximum)
  };
});

export const setMonsterEncounterInitiative = (
  workspace: MonsterEncounterWorkspace,
  instanceId: string,
  initiative: number | null
): MonsterEncounterWorkspace => updateInstance(workspace, instanceId, (instance) => ({
  ...instance,
  initiative: initiative === null ? null : Math.max(-100, Math.min(100, Math.trunc(initiative) || 0))
}));

export const addMonsterEncounterCondition = (
  workspace: MonsterEncounterWorkspace,
  instanceId: string,
  condition: string
): MonsterEncounterWorkspace => updateInstance(workspace, instanceId, (instance) => {
  const label = condition.trim().replace(/\s+/g, " ").slice(0, 60);
  if (!label || instance.conditions.some((value) => value.toLocaleLowerCase("en-US") === label.toLocaleLowerCase("en-US"))) {
    return instance;
  }
  return { ...instance, conditions: [...instance.conditions, label] };
});

export const removeMonsterEncounterCondition = (
  workspace: MonsterEncounterWorkspace,
  instanceId: string,
  condition: string
): MonsterEncounterWorkspace => updateInstance(workspace, instanceId, (instance) => ({
  ...instance,
  conditions: instance.conditions.filter((value) => value !== condition)
}));

export const toggleMonsterEncounterPin = (
  workspace: MonsterEncounterWorkspace,
  instanceId: string
): MonsterEncounterWorkspace => updateInstance(workspace, instanceId, (instance) => ({
  ...instance,
  pinned: !instance.pinned
}));

export const setMonsterEncounterReaction = (
  workspace: MonsterEncounterWorkspace,
  instanceId: string,
  available: boolean
): MonsterEncounterWorkspace => updateInstance(workspace, instanceId, (instance) => ({
  ...instance,
  reactionAvailable: available
}));

export const setMonsterEncounterRecharge = (
  workspace: MonsterEncounterWorkspace,
  instanceId: string,
  ready: boolean
): MonsterEncounterWorkspace => updateInstance(workspace, instanceId, (instance) => ({
  ...instance,
  rechargeReady: ready
}));

export const setMonsterEncounterLegendaryRemaining = (
  workspace: MonsterEncounterWorkspace,
  instanceId: string,
  remaining: number
): MonsterEncounterWorkspace => updateInstance(workspace, instanceId, (instance) => ({
  ...instance,
  legendaryActionsRemaining: Math.max(0, Math.min(instance.legendaryActionsMaximum, Math.trunc(remaining) || 0))
}));

export const startMonsterEncounterTurn = (
  workspace: MonsterEncounterWorkspace,
  instanceId: string
): MonsterEncounterWorkspace => updateInstance(workspace, instanceId, (instance) => ({
  ...instance,
  reactionAvailable: true,
  legendaryActionsRemaining: instance.legendaryActionsMaximum
}));

export const orderMonsterEncounterInstances = (
  instances: MonsterEncounterInstance[]
): MonsterEncounterInstance[] => [
  ...instances.filter((instance) => instance.pinned),
  ...instances.filter((instance) => !instance.pinned)
];

export const moveMonsterEncounterInstance = (
  workspace: MonsterEncounterWorkspace,
  instanceId: string,
  direction: WorkspaceMoveDirection
): MonsterEncounterWorkspace => {
  const ordered = orderMonsterEncounterInstances(workspace.instances);
  const index = ordered.findIndex((instance) => instance.instanceId === instanceId);
  if (index < 0) return workspace;
  const targetIndex = direction === "earlier" ? index - 1 : index + 1;
  const current = ordered[index];
  const target = ordered[targetIndex];
  if (!current || !target || current.pinned !== target.pinned) return workspace;
  const next = [...ordered];
  [next[index], next[targetIndex]] = [target, current];
  return touched({ ...workspace, instances: next });
};

export const sortMonsterEncounterByInitiative = (
  workspace: MonsterEncounterWorkspace
): MonsterEncounterWorkspace => touched({
  ...workspace,
  instances: [...workspace.instances].sort((left, right) => {
    if (left.pinned !== right.pinned) return left.pinned ? -1 : 1;
    if (left.initiative === null && right.initiative === null) return 0;
    if (left.initiative === null) return 1;
    if (right.initiative === null) return -1;
    return right.initiative - left.initiative;
  })
});