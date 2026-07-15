import type { WorkspaceMoveDirection } from "./workspaces";

export type RuleCardWorkspaceRole = "player" | "dm";

export type RuleCardInstance = {
  instanceId: string;
  cardId: string;
  label?: string;
  pinned: boolean;
};

export type RuleCardWorkspace = {
  schemaVersion: 2;
  role: RuleCardWorkspaceRole;
  name: string;
  instances: RuleCardInstance[];
  updatedAt: string;
};

export type RuleCardWorkspaceLoadInput = {
  role: RuleCardWorkspaceRole;
  allowedCardIds: string[];
  defaultCardIds: string[];
};

export type ResolvedRuleCardInstance<T> = RuleCardInstance & {
  card: T;
};

export interface RuleCardWorkspaceRepository {
  load(input: RuleCardWorkspaceLoadInput): RuleCardWorkspace;
  save(workspace: RuleCardWorkspace): void;
  clear(role: RuleCardWorkspaceRole): void;
}

export type RuleCardInstanceMove = {
  instanceId: string;
  direction: WorkspaceMoveDirection;
};
