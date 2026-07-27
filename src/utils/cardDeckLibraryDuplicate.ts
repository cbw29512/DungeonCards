import type { CardDeckLibraryEnvelope } from "../types/cardDeckLibrary";
import { assertValidCardDeckLibrary } from "./cardDeckLibraryValidation";

export type DuplicatePlayableDeckInput = {
  sourceDeckId: string;
  deckId: string;
  stateId: string;
  name?: string;
  createInstanceId(sourceInstanceId: string, index: number): string;
  now?: string;
};

export const duplicatePlayableDeck = (
  library: CardDeckLibraryEnvelope,
  input: DuplicatePlayableDeckInput
): CardDeckLibraryEnvelope => {
  const sourceDeck = library.decks.find((deck) => deck.id === input.sourceDeckId);
  const sourceState = library.deckStates.find((state) => state.deckDefinitionId === input.sourceDeckId);
  if (!sourceDeck || !sourceState) throw new Error(`Playable deck not found: ${input.sourceDeckId}`);
  const now = input.now ?? new Date().toISOString();
  const sourceInstances = new Map(library.instances.map((instance) => [instance.id, instance]));
  const idMap = new Map<string, string>();
  const instances = sourceState.cardInstanceIds.flatMap((sourceId, index) => {
    const source = sourceInstances.get(sourceId);
    if (!source) return [];
    const id = input.createInstanceId(sourceId, index);
    idMap.set(sourceId, id);
    return [{
      ...source,
      id,
      resourceState: { ...source.resourceState },
      conditions: source.conditions.map((condition) => ({ ...condition })),
      createdAt: now,
      updatedAt: now
    }];
  });
  const deck = {
    ...sourceDeck,
    id: input.deckId,
    name: input.name?.trim() || `${sourceDeck.name} Copy`,
    cardDefinitionIds: [...sourceDeck.cardDefinitionIds]
  };
  const state = {
    ...sourceState,
    id: input.stateId,
    deckDefinitionId: deck.id,
    cardInstanceIds: sourceState.cardInstanceIds.flatMap((id) => idMap.get(id) ?? []),
    activeCardInstanceId: sourceState.activeCardInstanceId
      ? idMap.get(sourceState.activeCardInstanceId)
      : undefined,
    updatedAt: now
  };
  const next: CardDeckLibraryEnvelope = {
    ...library,
    updatedAt: now,
    definitions: [...library.definitions],
    instances: [...library.instances, ...instances],
    decks: [...library.decks, deck],
    deckStates: [...library.deckStates, state],
    activeDeckId: deck.id
  };
  assertValidCardDeckLibrary(next);
  return next;
};
