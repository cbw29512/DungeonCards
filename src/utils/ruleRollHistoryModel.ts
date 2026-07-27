import type { RuleRollHistoryEntry } from "../types/ruleCards";
import type { RuleRollHistoryEnvelope } from "../types/ruleRollHistoryStorage";

export const mergeRuleRollHistory = (
  envelopes: RuleRollHistoryEnvelope[]
): RuleRollHistoryEntry[] => (
  envelopes
    .flatMap((envelope) => envelope.entries)
    .sort((left, right) => Date.parse(right.rolledAt) - Date.parse(left.rolledAt))
);
