import type {
  RuleCardWorkspace,
  RuleCardWorkspaceLoadInput,
  RuleCardWorkspaceRepository
} from "../types/ruleCardWorkspaces";
import {
  createDefaultRuleCardWorkspace,
  createRuleCardInstance,
  isRuleCardWorkspace,
  normalizeRuleCardWorkspace,
  supportedRuleset
} from "./ruleCardWorkspaceModel";

const STORAGE_PREFIX = "dungeon-rule-card-workspace-v3";
const LEGACY_V2_PREFIX = "dungeon-rule-card-workspace-v2";
const LEGACY_V1_PREFIX = "dungeon-cards-workspace-v1";

type LegacyInstance = {
  instanceId?: unknown;
  cardId?: unknown;
  label?: unknown;
  pinned?: unknown;
};

type LegacyWorkspace = {
  schemaVersion?: unknown;
  role?: unknown;
  name?: unknown;
  instances?: unknown;
  updatedAt?: unknown;
};

const migrateV2 = (
  value: unknown,
  input: RuleCardWorkspaceLoadInput
): RuleCardWorkspace | undefined => {
  if (!value || typeof value !== "object") return undefined;
  const legacy = value as LegacyWorkspace;
  if (legacy.schemaVersion !== 2 || legacy.role !== input.role || !Array.isArray(legacy.instances)) return undefined;
  const instances = legacy.instances.flatMap((raw) => {
    const item = raw as LegacyInstance;
    if (typeof item.cardId !== "string") return [];
    const ruleset = supportedRuleset(item.cardId, input.cardRulesets, input.defaultRuleset);
    if (!ruleset) return [];
    const migrated = createRuleCardInstance(item.cardId, ruleset);
    return [{
      ...migrated,
      instanceId: typeof item.instanceId === "string" ? item.instanceId : migrated.instanceId,
      ...(typeof item.label === "string" ? { label: item.label } : {}),
      pinned: typeof item.pinned === "boolean" ? item.pinned : false
    }];
  });
  return {
    schemaVersion: 3,
    role: input.role,
    name: typeof legacy.name === "string" ? legacy.name : "Rule Card Table",
    instances,
    updatedAt: typeof legacy.updatedAt === "string" ? legacy.updatedAt : new Date().toISOString()
  };
};

const migrateV1 = (
  value: unknown,
  input: RuleCardWorkspaceLoadInput
): RuleCardWorkspace | undefined => {
  if (!value || typeof value !== "object") return undefined;
  const ids = (value as { activeCardIds?: unknown }).activeCardIds;
  if (!Array.isArray(ids)) return undefined;
  return createDefaultRuleCardWorkspace(
    input.role,
    ids.filter((id): id is string => typeof id === "string"),
    input.cardRulesets,
    input.defaultRuleset
  );
};

const readJson = (storage: Storage, key: string): unknown => {
  const raw = storage.getItem(key);
  return raw ? JSON.parse(raw) : undefined;
};

export const createRuleCardWorkspaceRepository = (
  storage: Storage
): RuleCardWorkspaceRepository => ({
  load: (input) => {
    const fallback = createDefaultRuleCardWorkspace(
      input.role,
      input.defaultCardIds,
      input.cardRulesets,
      input.defaultRuleset
    );
    try {
      const current = readJson(storage, `${STORAGE_PREFIX}-${input.role}`);
      if (isRuleCardWorkspace(current) && current.role === input.role) {
        return normalizeRuleCardWorkspace(current, input.cardRulesets);
      }
      const v2 = migrateV2(readJson(storage, `${LEGACY_V2_PREFIX}-${input.role}`), input);
      if (v2) return normalizeRuleCardWorkspace(v2, input.cardRulesets);
      const v1 = migrateV1(readJson(storage, `${LEGACY_V1_PREFIX}-${input.role}`), input);
      return normalizeRuleCardWorkspace(v1 ?? fallback, input.cardRulesets);
    } catch (error) {
      console.error("Loading the rule card workspace failed", { role: input.role, error });
      return normalizeRuleCardWorkspace(fallback, input.cardRulesets);
    }
  },
  save: (workspace) => storage.setItem(
    `${STORAGE_PREFIX}-${workspace.role}`,
    JSON.stringify(workspace)
  ),
  clear: (role) => storage.removeItem(`${STORAGE_PREFIX}-${role}`)
});
