import type { GameSystemId } from "./cardPlatform";
import type { RulesetId } from "./ruleCards";
import type { WorkspaceMoveDirection } from "./workspaces";

export type RuleCardWorkspaceRole = "player" | "dm";
export type DndCardSystemId = Extract<GameSystemId, "dnd-2014" | "dnd-2024">;
export type RuleCardRulesetMap = Record<string, RulesetId[]>;

export type RuleCardInstance = {
  instanceId: string;
  cardId: string;
  ruleset: RulesetId;
  gameSystemId: DndCardSystemId;
  label?: string;
  pinned: boolean;
};

export type RuleCardWorkspace = {
  schemaVersion: 3;
  role: RuleCardWorkspaceRole;
  name: string;
  instances: RuleCardInstance[];
  updatedAt: string;
};

export type RuleCardWorkspaceLoadInput = {
  role: RuleCardWorkspaceRole;
  cardRulesets: RuleCardRulesetMap;
  defaultCardIds: string[];
  defaultRuleset: RulesetId;
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
