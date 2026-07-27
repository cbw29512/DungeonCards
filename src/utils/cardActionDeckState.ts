import type { CardActionDefinition } from "../types/cardPlatformActions";
import type { CardActionExecutionResult, CardActionHistoryEntry } from "../types/cardActionExecution";
import type { CardDeckLibraryEnvelope } from "../types/cardDeckLibrary";
import { assertValidCardDeckLibrary } from "./cardDeckLibraryValidation";

export const applyCardActionResult = (
  library: CardDeckLibraryEnvelope,
  deckId: string,
  instanceId: string,
  result: CardActionExecutionResult,
  now: string
): CardDeckLibraryEnvelope => {
  const state = library.deckStates.find((candidate) => candidate.deckDefinitionId === deckId);
  const instance = library.instances.find((candidate) => candidate.id === instanceId);
  if (!state || !instance || !state.cardInstanceIds.includes(instanceId)) {
    throw new Error("Action result does not belong to the selected playable deck copy.");
  }
  let activeCardInstanceId = instanceId;
  if (result.actionKind === "link" && result.targetCardIds?.length) {
    const targetDefinitions = new Set(result.targetCardIds);
    const linked = state.cardInstanceIds.find((id) => {
      const candidate = library.instances.find((item) => item.id === id);
      return candidate ? targetDefinitions.has(candidate.definitionId) : false;
    });
    if (linked) activeCardInstanceId = linked;
  }
  const next = {
    ...library,
    updatedAt: now,
    instances: library.instances.map((candidate) => candidate.id === instanceId
      ? { ...candidate, resourceState: { ...result.resourceState }, updatedAt: now }
      : candidate),
    deckStates: library.deckStates.map((candidate) => candidate.id === state.id
      ? { ...candidate, activeCardInstanceId, updatedAt: now }
      : candidate)
  };
  assertValidCardDeckLibrary(next);
  return next;
};

export const createCardActionHistoryEntry = (input: {
  id: string;
  executedAt: string;
  library: CardDeckLibraryEnvelope;
  deckId: string;
  instanceId: string;
  action: CardActionDefinition;
  result: CardActionExecutionResult;
}): CardActionHistoryEntry => {
  const instance = input.library.instances.find((candidate) => candidate.id === input.instanceId);
  if (!instance) throw new Error(`Card instance not found: ${input.instanceId}`);
  return {
    schemaVersion: 1,
    id: input.id,
    gameSystemId: input.library.gameSystemId,
    executedAt: input.executedAt,
    deckId: input.deckId,
    cardInstanceId: input.instanceId,
    definitionId: instance.definitionId,
    actionId: input.action.id,
    actionKind: input.action.kind,
    label: input.action.label,
    summary: input.result.summary,
    ...(input.result.roll ? { roll: input.result.roll } : {}),
    resourceChanges: input.result.resourceChanges.map((change) => ({ ...change }))
  };
};
