import type {
  RuleCardInstance,
  RuleCardWorkspace,
  RuleCardWorkspaceLoadInput,
  RuleCardWorkspaceRepository,
  RuleCardWorkspaceRole
} from "../types/ruleCardWorkspaces";
import type { WorkspaceMoveDirection } from "../types/workspaces";
import { createClientId } from "./createId";

const STORAGE_PREFIX = "dungeon-rule-card-workspace-v2";
const LEGACY_PREFIX = "dungeon-cards-workspace-v1";
const now = () => new Date().toISOString();

const workspaceName = (role: RuleCardWorkspaceRole) =>
  role === "player" ? "Player Table" : "DM Table";

const createInstance = (cardId: string): RuleCardInstance => ({
  instanceId: createClientId("card-instance"),
  cardId,
  pinned: false
});

export const createDefaultRuleCardWorkspace = (
  role: RuleCardWorkspaceRole,
  defaultCardIds: string[]
): RuleCardWorkspace => ({
  schemaVersion: 2,
  role,
  name: workspaceName(role),
  instances: defaultCardIds.map(createInstance),
  updatedAt: now()
});

const isInstance = (value: unknown): value is RuleCardInstance => {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<RuleCardInstance>;
  return typeof item.instanceId === "string"
    && typeof item.cardId === "string"
    && typeof item.pinned === "boolean"
    && (item.label === undefined || typeof item.label === "string");
};

const isWorkspace = (value: unknown): value is RuleCardWorkspace => {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<RuleCardWorkspace>;
  return item.schemaVersion === 2
    && (item.role === "player" || item.role === "dm")
    && typeof item.name === "string"
    && typeof item.updatedAt === "string"
    && Array.isArray(item.instances)
    && item.instances.every(isInstance);
};

export const normalizeRuleCardWorkspace = (
  workspace: RuleCardWorkspace,
  allowedCardIds: string[]
): RuleCardWorkspace => {
  const allowed = new Set(allowedCardIds);
  const seen = new Set<string>();
  const instances = workspace.instances.filter((instance) => {
    if (!allowed.has(instance.cardId) || seen.has(instance.instanceId)) return false;
    seen.add(instance.instanceId);
    return true;
  });
  return { ...workspace, instances };
};

export const addRuleCardInstance = (
  workspace: RuleCardWorkspace,
  cardId: string
): RuleCardWorkspace => ({
  ...workspace,
  instances: [...workspace.instances, createInstance(cardId)],
  updatedAt: now()
});

export const removeRuleCardInstance = (
  workspace: RuleCardWorkspace,
  instanceId: string
): RuleCardWorkspace => ({
  ...workspace,
  instances: workspace.instances.filter((item) => item.instanceId !== instanceId),
  updatedAt: now()
});

export const renameRuleCardInstance = (
  workspace: RuleCardWorkspace,
  instanceId: string,
  label: string
): RuleCardWorkspace => ({
  ...workspace,
  instances: workspace.instances.map((item) => item.instanceId === instanceId
    ? { ...item, label: label.trim() || undefined }
    : item),
  updatedAt: now()
});

export const toggleRuleCardInstancePin = (
  workspace: RuleCardWorkspace,
  instanceId: string
): RuleCardWorkspace => ({
  ...workspace,
  instances: workspace.instances.map((item) => item.instanceId === instanceId
    ? { ...item, pinned: !item.pinned }
    : item),
  updatedAt: now()
});

export const orderRuleCardInstances = (instances: RuleCardInstance[]) => [
  ...instances.filter((item) => item.pinned),
  ...instances.filter((item) => !item.pinned)
];

export const moveRuleCardInstance = (
  workspace: RuleCardWorkspace,
  instanceId: string,
  direction: WorkspaceMoveDirection
): RuleCardWorkspace => {
  const ordered = orderRuleCardInstances(workspace.instances);
  const index = ordered.findIndex((item) => item.instanceId === instanceId);
  if (index < 0) return workspace;
  const step = direction === "earlier" ? -1 : 1;
  const target = index + step;
  if (target < 0 || target >= ordered.length || ordered[target].pinned !== ordered[index].pinned) {
    return workspace;
  }
  [ordered[index], ordered[target]] = [ordered[target], ordered[index]];
  return { ...workspace, instances: ordered, updatedAt: now() };
};

const migrateLegacy = (
  storage: Storage,
  input: RuleCardWorkspaceLoadInput
): RuleCardWorkspace | undefined => {
  try {
    const raw = storage.getItem(`${LEGACY_PREFIX}-${input.role}`);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as { activeCardIds?: unknown };
    if (!Array.isArray(parsed.activeCardIds)) return undefined;
    const allowed = new Set(input.allowedCardIds);
    const ids = parsed.activeCardIds.filter(
      (value): value is string => typeof value === "string" && allowed.has(value)
    );
    return createDefaultRuleCardWorkspace(input.role, ids);
  } catch (error) {
    console.error("Migrating the legacy rule card workspace failed", { role: input.role, error });
    return undefined;
  }
};

export const createRuleCardWorkspaceRepository = (
  storage: Storage
): RuleCardWorkspaceRepository => ({
  load: (input) => {
    const fallback = createDefaultRuleCardWorkspace(input.role, input.defaultCardIds);
    try {
      const raw = storage.getItem(`${STORAGE_PREFIX}-${input.role}`);
      if (!raw) {
        return normalizeRuleCardWorkspace(migrateLegacy(storage, input) ?? fallback, input.allowedCardIds);
      }
      const parsed: unknown = JSON.parse(raw);
      return normalizeRuleCardWorkspace(
        isWorkspace(parsed) && parsed.role === input.role ? parsed : fallback,
        input.allowedCardIds
      );
    } catch (error) {
      console.error("Loading the rule card workspace failed", { role: input.role, error });
      return normalizeRuleCardWorkspace(fallback, input.allowedCardIds);
    }
  },
  save: (workspace) => storage.setItem(
    `${STORAGE_PREFIX}-${workspace.role}`,
    JSON.stringify(workspace)
  ),
  clear: (role) => storage.removeItem(`${STORAGE_PREFIX}-${role}`)
});
