import type { RulesetId } from "../types/ruleCards";
import type {
  RuleCardInstance,
  RuleCardRulesetMap,
  RuleCardWorkspace,
  RuleCardWorkspaceRole
} from "../types/ruleCardWorkspaces";
import { createClientId } from "./createId";
import { gameSystemIdForRuleset } from "./cardPlatformGameSystem";

const now = () => new Date().toISOString();

const workspaceName = (role: RuleCardWorkspaceRole): string => (
  role === "player" ? "Player Table" : "DM Table"
);

export const supportedRuleset = (
  cardId: string,
  cardRulesets: RuleCardRulesetMap,
  preferred: RulesetId
): RulesetId | undefined => {
  const supported = cardRulesets[cardId] ?? [];
  return supported.includes(preferred) ? preferred : supported[0];
};

export const createRuleCardInstance = (
  cardId: string,
  ruleset: RulesetId
): RuleCardInstance => ({
  instanceId: createClientId("card-instance"),
  cardId,
  ruleset,
  gameSystemId: gameSystemIdForRuleset(ruleset),
  pinned: false
});

export const createDefaultRuleCardWorkspace = (
  role: RuleCardWorkspaceRole,
  defaultCardIds: string[],
  cardRulesets: RuleCardRulesetMap,
  defaultRuleset: RulesetId
): RuleCardWorkspace => ({
  schemaVersion: 3,
  role,
  name: workspaceName(role),
  instances: defaultCardIds.flatMap((cardId) => {
    const ruleset = supportedRuleset(cardId, cardRulesets, defaultRuleset);
    return ruleset ? [createRuleCardInstance(cardId, ruleset)] : [];
  }),
  updatedAt: now()
});

export const isRuleCardInstance = (value: unknown): value is RuleCardInstance => {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<RuleCardInstance>;
  return typeof item.instanceId === "string"
    && typeof item.cardId === "string"
    && (item.ruleset === "srd-5.1-2014" || item.ruleset === "srd-5.2.1-2024")
    && item.gameSystemId === gameSystemIdForRuleset(item.ruleset)
    && typeof item.pinned === "boolean"
    && (item.label === undefined || typeof item.label === "string");
};

export const isRuleCardWorkspace = (value: unknown): value is RuleCardWorkspace => {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<RuleCardWorkspace>;
  return item.schemaVersion === 3
    && (item.role === "player" || item.role === "dm")
    && typeof item.name === "string"
    && typeof item.updatedAt === "string"
    && Array.isArray(item.instances)
    && item.instances.every(isRuleCardInstance);
};

export const normalizeRuleCardWorkspace = (
  workspace: RuleCardWorkspace,
  cardRulesets: RuleCardRulesetMap
): RuleCardWorkspace => {
  const seen = new Set<string>();
  const instances = workspace.instances.filter((instance) => {
    const supported = cardRulesets[instance.cardId] ?? [];
    if (!supported.includes(instance.ruleset) || seen.has(instance.instanceId)) return false;
    seen.add(instance.instanceId);
    return instance.gameSystemId === gameSystemIdForRuleset(instance.ruleset);
  });
  return { ...workspace, instances };
};
