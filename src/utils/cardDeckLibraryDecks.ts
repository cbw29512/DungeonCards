import type { CardVisibility } from "../types/cardPlatform";
import type { CardDeckLibraryEnvelope } from "../types/cardDeckLibrary";
import type { DeckKind } from "../types/cardPlatformRuntime";
import { createDeckRuntimeState } from "./cardPlatformRuntimeState";
import { assertValidCardDeckLibrary } from "./cardDeckLibraryValidation";

const updated = (library: CardDeckLibraryEnvelope, now: string): CardDeckLibraryEnvelope => ({
  ...library,
  updatedAt: now
});

export type CreatePlayableDeckInput = {
  deckId: string;
  stateId: string;
  name: string;
  kind: DeckKind;
  visibility?: CardVisibility;
  description?: string;
  now?: string;
};

export const createPlayableDeck = (
  library: CardDeckLibraryEnvelope,
  input: CreatePlayableDeckInput
): CardDeckLibraryEnvelope => {
  const now = input.now ?? new Date().toISOString();
  const deck = {
    schemaVersion: 2 as const,
    id: input.deckId,
    gameSystemId: library.gameSystemId,
    kind: input.kind,
    name: input.name.trim(),
    ...(input.description?.trim() ? { description: input.description.trim() } : {}),
    visibility: input.visibility ?? "private" as const,
    cardDefinitionIds: []
  };
  const next = updated({
    ...library,
    decks: [...library.decks, deck],
    deckStates: [...library.deckStates, createDeckRuntimeState(deck, input.stateId, [], now)],
    activeDeckId: deck.id
  }, now);
  assertValidCardDeckLibrary(next);
  return next;
};

export const renamePlayableDeck = (
  library: CardDeckLibraryEnvelope,
  deckId: string,
  name: string,
  now = new Date().toISOString()
): CardDeckLibraryEnvelope => {
  const next = updated({
    ...library,
    decks: library.decks.map((deck) => deck.id === deckId ? { ...deck, name: name.trim() } : deck)
  }, now);
  assertValidCardDeckLibrary(next);
  return next;
};

export const setActivePlayableDeck = (
  library: CardDeckLibraryEnvelope,
  deckId: string,
  now = new Date().toISOString()
): CardDeckLibraryEnvelope => {
  if (!library.decks.some((deck) => deck.id === deckId)) throw new Error(`Deck not found: ${deckId}`);
  return updated({ ...library, activeDeckId: deckId }, now);
};

export const setPlayableDeckArchived = (
  library: CardDeckLibraryEnvelope,
  deckId: string,
  archived: boolean,
  now = new Date().toISOString()
): CardDeckLibraryEnvelope => {
  if (!library.decks.some((deck) => deck.id === deckId)) throw new Error(`Deck not found: ${deckId}`);
  const archivedDeckIds = archived
    ? [...new Set([...library.archivedDeckIds, deckId])]
    : library.archivedDeckIds.filter((id) => id !== deckId);
  const activeDeckId = archived && library.activeDeckId === deckId ? undefined : library.activeDeckId;
  const next = updated({ ...library, archivedDeckIds, ...(activeDeckId ? { activeDeckId } : { activeDeckId: undefined }) }, now);
  assertValidCardDeckLibrary(next);
  return next;
};

export const deletePlayableDeck = (
  library: CardDeckLibraryEnvelope,
  deckId: string,
  now = new Date().toISOString()
): CardDeckLibraryEnvelope => {
  const removedState = library.deckStates.find((state) => state.deckDefinitionId === deckId);
  const remainingStates = library.deckStates.filter((state) => state.deckDefinitionId !== deckId);
  const referencedInstances = new Set(remainingStates.flatMap((state) => state.cardInstanceIds));
  const removedInstanceIds = new Set(removedState?.cardInstanceIds ?? []);
  const instances = library.instances.filter((instance) => (
    !removedInstanceIds.has(instance.id) || referencedInstances.has(instance.id)
  ));
  const next = updated({
    ...library,
    decks: library.decks.filter((deck) => deck.id !== deckId),
    deckStates: remainingStates,
    instances,
    archivedDeckIds: library.archivedDeckIds.filter((id) => id !== deckId),
    activeDeckId: library.activeDeckId === deckId ? undefined : library.activeDeckId
  }, now);
  assertValidCardDeckLibrary(next);
  return next;
};
