import type { RulesetId } from "../types/ruleCards";
import type {
  RuleCardInstance,
  RuleCardWorkspace
} from "../types/ruleCardWorkspaces";
import type { WorkspaceMoveDirection } from "../types/workspaces";
import { gameSystemIdForRuleset } from "./cardPlatformGameSystem";
import { createRuleCardInstance } from "./ruleCardWorkspaceModel";

const now = () => new Date().toISOString();

export const addRuleCardInstance = (
  workspace: RuleCardWorkspace,
  cardId: string,
  ruleset: RulesetId
): RuleCardWorkspace => ({
  ...workspace,
  instances: [...workspace.instances, createRuleCardInstance(cardId, ruleset)],
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

export const changeRuleCardInstanceRuleset = (
  workspace: RuleCardWorkspace,
  instanceId: string,
  ruleset: RulesetId
): RuleCardWorkspace => ({
  ...workspace,
  instances: workspace.instances.map((item) => item.instanceId === instanceId
    ? { ...item, ruleset, gameSystemId: gameSystemIdForRuleset(ruleset) }
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
  const target = index + (direction === "earlier" ? -1 : 1);
  if (target < 0 || target >= ordered.length || ordered[target].pinned !== ordered[index].pinned) {
    return workspace;
  }
  [ordered[index], ordered[target]] = [ordered[target], ordered[index]];
  return { ...workspace, instances: ordered, updatedAt: now() };
};
