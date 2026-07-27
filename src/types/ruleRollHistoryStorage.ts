import type { DndGameSystemId } from "./cardPlatform";
import type { RuleRollHistoryEntry } from "./ruleCards";
import type { RuleCardWorkspaceRole } from "./ruleCardWorkspaces";

export type RuleRollHistoryEnvelope = {
  schemaVersion: 1;
  role: RuleCardWorkspaceRole;
  gameSystemId: DndGameSystemId;
  entries: RuleRollHistoryEntry[];
  updatedAt: string;
};
