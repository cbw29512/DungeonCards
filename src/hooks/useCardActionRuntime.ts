import { useEffect, useRef, useState } from "react";
import type { CardActionDefinition } from "../types/cardPlatformActions";
import type { CardActionExecutionOptions, CardActionExecutionResult, CardActionHistoryEnvelope } from "../types/cardActionExecution";
import type { CardDeckLibraryEnvelope } from "../types/cardDeckLibrary";
import { createClientId } from "../utils/clientId";
import { applyCardActionResult, createCardActionHistoryEntry } from "../utils/cardActionDeckState";
import { executeCardAction } from "../utils/cardActionExecution";
import { clearCardActionHistory, createEmptyCardActionHistory, loadCardActionHistory } from "../utils/cardActionHistoryStorage";
import { commitCardActionTransaction } from "../utils/cardActionTransaction";

type ResultMap = Partial<Record<string, CardActionExecutionResult>>;
const resultKey = (instanceId: string, actionId: string): string => `${instanceId}:${actionId}`;

export const useCardActionRuntime = (
  library: CardDeckLibraryEnvelope,
  onLibraryChange: (library: CardDeckLibraryEnvelope) => void
) => {
  const [history, setHistory] = useState<CardActionHistoryEnvelope>(() => createEmptyCardActionHistory(library.gameSystemId));
  const historyRef = useRef(history);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionResults, setActionResults] = useState<ResultMap>({});
  useEffect(() => {
    if (typeof window === "undefined") return;
    const loaded = loadCardActionHistory(window.localStorage, library.gameSystemId);
    historyRef.current = loaded.history;
    setHistory(loaded.history);
    setHistoryError(loaded.error ?? null);
    setActionError(null);
    setActionResults({});
  }, [library.gameSystemId]);

  const executeAction = (
    deckId: string,
    instanceId: string,
    action: CardActionDefinition,
    options: CardActionExecutionOptions = {}
  ): boolean => {
    if (typeof window === "undefined") return false;
    try {
      const state = library.deckStates.find((candidate) => candidate.deckDefinitionId === deckId);
      const instance = library.instances.find((candidate) => candidate.id === instanceId);
      const definition = instance
        ? library.definitions.find((candidate) => candidate.id === instance.definitionId)
        : undefined;
      if (!state || !instance || !definition || !state.cardInstanceIds.includes(instanceId)) {
        throw new Error("The selected card action no longer belongs to this playable deck.");
      }
      const availableDefinitionIds = new Set(state.cardInstanceIds.flatMap((id) => {
        const candidate = library.instances.find((item) => item.id === id);
        return candidate ? [candidate.definitionId] : [];
      }));
      const result = executeCardAction(definition, instance, action, { ...options, availableDefinitionIds });
      const executedAt = new Date().toISOString();
      const nextLibrary = applyCardActionResult(library, deckId, instanceId, result, executedAt);
      const entry = createCardActionHistoryEntry({
        id: createClientId("action-history"),
        executedAt,
        library,
        deckId,
        instanceId,
        action,
        result
      });
      const committed = commitCardActionTransaction(window.localStorage, nextLibrary, historyRef.current, entry);
      historyRef.current = committed.history;
      setHistory(committed.history);
      onLibraryChange(committed.library);
      setActionResults((current) => ({ ...current, [resultKey(instanceId, action.id)]: result }));
      setActionError(null);
      return true;
    } catch (error) {
      console.error("Executing a playable card action failed", { deckId, instanceId, actionId: action.id, error });
      setActionError(error instanceof Error ? error.message : "The card action could not be executed.");
      return false;
    }
  };

  const clearHistory = (): boolean => {
    if (typeof window === "undefined") return false;
    try {
      clearCardActionHistory(window.localStorage, library.gameSystemId);
      const empty = createEmptyCardActionHistory(library.gameSystemId);
      historyRef.current = empty;
      setHistory(empty);
      setHistoryError(null);
      return true;
    } catch (error) {
      setHistoryError(error instanceof Error ? error.message : "Action history could not be cleared.");
      return false;
    }
  };

  return {
    history,
    historyError,
    actionError,
    actionResults,
    executeAction,
    clearHistory,
    getActionResult: (instanceId: string, actionId: string) => actionResults[resultKey(instanceId, actionId)]
  };
};
