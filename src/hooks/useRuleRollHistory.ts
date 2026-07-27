import { useEffect, useMemo, useState } from "react";
import type { DndGameSystemId } from "../types/cardPlatform";
import type { RuleRollHistoryEntry } from "../types/ruleCards";
import type { RuleCardWorkspaceRole } from "../types/ruleCardWorkspaces";
import type { RuleRollHistoryEnvelope } from "../types/ruleRollHistoryStorage";
import { mergeRuleRollHistory } from "../utils/ruleRollHistoryModel";
import {
  clearRuleRollHistory,
  createEmptyRuleHistory,
  loadRuleRollHistory,
  MAX_RULE_ROLL_HISTORY_PER_SYSTEM,
  saveRuleRollHistory
} from "../utils/ruleRollHistoryStorage";

type HistoryBySystem = Record<DndGameSystemId, RuleRollHistoryEnvelope>;

const emptyHistories = (role: RuleCardWorkspaceRole): HistoryBySystem => ({
  "dnd-2014": createEmptyRuleHistory(role, "dnd-2014"),
  "dnd-2024": createEmptyRuleHistory(role, "dnd-2024")
});

const loadHistories = (role: RuleCardWorkspaceRole): HistoryBySystem => {
  if (typeof window === "undefined") return emptyHistories(role);
  return {
    "dnd-2014": loadRuleRollHistory(window.localStorage, role, "dnd-2014"),
    "dnd-2024": loadRuleRollHistory(window.localStorage, role, "dnd-2024")
  };
};

export const useRuleRollHistory = (role: RuleCardWorkspaceRole) => {
  const [bySystem, setBySystem] = useState<HistoryBySystem>(() => {
    try {
      return loadHistories(role);
    } catch {
      return emptyHistories(role);
    }
  });
  const [storageError, setStorageError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setBySystem(loadHistories(role));
      setStorageError(null);
    } catch (error) {
      console.error("Loading rule roll history failed", { role, error });
      setBySystem(emptyHistories(role));
      setStorageError("Saved rule-card history could not be loaded.");
    }
  }, [role]);

  const entries = useMemo(() => mergeRuleRollHistory([
    bySystem["dnd-2014"],
    bySystem["dnd-2024"]
  ]), [bySystem]);

  const addEntry = (entry: RuleRollHistoryEntry): boolean => {
    const current = bySystem[entry.gameSystemId];
    const next: RuleRollHistoryEnvelope = {
      ...current,
      entries: [entry, ...current.entries].slice(0, MAX_RULE_ROLL_HISTORY_PER_SYSTEM),
      updatedAt: new Date().toISOString()
    };
    try {
      saveRuleRollHistory(window.localStorage, next);
      setBySystem((histories) => ({ ...histories, [entry.gameSystemId]: next }));
      setStorageError(null);
      return true;
    } catch (error) {
      console.error("Persisting rule roll history failed", { role, gameSystemId: entry.gameSystemId, error });
      setStorageError("Rule-card history could not be saved in this browser.");
      return false;
    }
  };

  const clear = (): boolean => {
    try {
      clearRuleRollHistory(window.localStorage, role);
      setBySystem(emptyHistories(role));
      setStorageError(null);
      return true;
    } catch (error) {
      console.error("Clearing rule roll history failed", { role, error });
      setStorageError("Rule-card history could not be cleared.");
      return false;
    }
  };

  return { entries, storageError, addEntry, clear };
};
