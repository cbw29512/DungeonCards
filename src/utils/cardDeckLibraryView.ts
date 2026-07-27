import type { CardDeckLibraryDeckView, CardDeckLibraryEnvelope } from "../types/cardDeckLibrary";

export const getCardDeckLibraryDeckView = (
  library: CardDeckLibraryEnvelope,
  deckId: string
): CardDeckLibraryDeckView | undefined => {
  const deck = library.decks.find((candidate) => candidate.id === deckId);
  const state = library.deckStates.find((candidate) => candidate.deckDefinitionId === deckId);
  if (!deck || !state) return undefined;
  const instancesById = new Map(library.instances.map((instance) => [instance.id, instance]));
  const definitionIds = new Set(library.definitions.map((definition) => definition.id));
  const instances = state.cardInstanceIds.flatMap((id) => instancesById.get(id) ?? []);
  return {
    deck,
    state,
    instances,
    missingInstanceIds: state.cardInstanceIds.filter((id) => !instancesById.has(id)),
    missingDefinitionIds: [...new Set([
      ...deck.cardDefinitionIds.filter((id) => !definitionIds.has(id)),
      ...instances.map((instance) => instance.definitionId).filter((id) => !definitionIds.has(id))
    ])],
    archived: library.archivedDeckIds.includes(deck.id)
  };
};

export const getActiveCardDeckLibraryView = (
  library: CardDeckLibraryEnvelope
): CardDeckLibraryDeckView | undefined => library.activeDeckId
  ? getCardDeckLibraryDeckView(library, library.activeDeckId)
  : undefined;
