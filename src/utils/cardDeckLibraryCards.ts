import type { CardDefinition } from "../types/cardPlatform";
import type { CardDeckLibraryEnvelope } from "../types/cardDeckLibrary";
import { createCardRuntimeInstance } from "./cardPlatformRuntimeState";
import { assertValidCardDeckLibrary } from "./cardDeckLibraryValidation";

const deckParts = (library: CardDeckLibraryEnvelope, deckId: string) => {
  const deck = library.decks.find((candidate) => candidate.id === deckId);
  const state = library.deckStates.find((candidate) => candidate.deckDefinitionId === deckId);
  if (!deck || !state) throw new Error(`Playable deck not found: ${deckId}`);
  return { deck, state };
};

export const addCardToPlayableDeck = (
  library: CardDeckLibraryEnvelope,
  deckId: string,
  definition: CardDefinition,
  instanceId: string,
  ownerId?: string,
  now = new Date().toISOString()
): CardDeckLibraryEnvelope => {
  if (definition.gameSystemId !== library.gameSystemId) {
    throw new Error(`Cannot add ${definition.gameSystemId} card to ${library.gameSystemId} deck library.`);
  }
  const { deck, state } = deckParts(library, deckId);
  const storedDefinition = library.definitions.find((candidate) => candidate.id === definition.id) ?? definition;
  const privateCard = storedDefinition.visibility === "private";
  const instance = createCardRuntimeInstance(storedDefinition, instanceId, {
    ...(privateCard && ownerId ? { ownerId } : {})
  }, now);
  const next: CardDeckLibraryEnvelope = {
    ...library,
    updatedAt: now,
    definitions: library.definitions.some((candidate) => candidate.id === definition.id)
      ? library.definitions
      : [...library.definitions, definition],
    instances: [...library.instances, instance],
    decks: library.decks.map((candidate) => candidate.id === deckId ? {
      ...candidate,
      cardDefinitionIds: [...new Set([...deck.cardDefinitionIds, definition.id])]
    } : candidate),
    deckStates: library.deckStates.map((candidate) => candidate.id === state.id ? {
      ...candidate,
      cardInstanceIds: [...candidate.cardInstanceIds, instance.id],
      activeCardInstanceId: instance.id,
      updatedAt: now
    } : candidate)
  };
  assertValidCardDeckLibrary(next);
  return next;
};

export const removeCardFromPlayableDeck = (
  library: CardDeckLibraryEnvelope,
  deckId: string,
  instanceId: string,
  now = new Date().toISOString()
): CardDeckLibraryEnvelope => {
  const { state } = deckParts(library, deckId);
  const remainingStates = library.deckStates.map((candidate) => candidate.id === state.id ? {
    ...candidate,
    cardInstanceIds: candidate.cardInstanceIds.filter((id) => id !== instanceId),
    activeCardInstanceId: candidate.activeCardInstanceId === instanceId ? undefined : candidate.activeCardInstanceId,
    updatedAt: now
  } : candidate);
  const referenced = new Set(remainingStates.flatMap((candidate) => candidate.cardInstanceIds));
  const next: CardDeckLibraryEnvelope = {
    ...library,
    updatedAt: now,
    instances: library.instances.filter((instance) => instance.id !== instanceId || referenced.has(instance.id)),
    deckStates: remainingStates
  };
  assertValidCardDeckLibrary(next);
  return next;
};

export const reorderPlayableDeckCard = (
  library: CardDeckLibraryEnvelope,
  deckId: string,
  instanceId: string,
  direction: -1 | 1,
  now = new Date().toISOString()
): CardDeckLibraryEnvelope => {
  const { state } = deckParts(library, deckId);
  const current = state.cardInstanceIds.indexOf(instanceId);
  if (current < 0) throw new Error(`Card instance not found in deck: ${instanceId}`);
  const target = Math.min(Math.max(0, current + direction), state.cardInstanceIds.length - 1);
  if (target === current) return library;
  const ids = [...state.cardInstanceIds];
  [ids[current], ids[target]] = [ids[target]!, ids[current]!];
  const next = {
    ...library,
    updatedAt: now,
    deckStates: library.deckStates.map((candidate) => candidate.id === state.id
      ? { ...candidate, cardInstanceIds: ids, updatedAt: now }
      : candidate)
  };
  assertValidCardDeckLibrary(next);
  return next;
};

export const updatePlayableCardText = (
  library: CardDeckLibraryEnvelope,
  instanceId: string,
  updates: { customName?: string; notes?: string },
  now = new Date().toISOString()
): CardDeckLibraryEnvelope => {
  const next = {
    ...library,
    updatedAt: now,
    instances: library.instances.map((instance) => instance.id === instanceId ? {
      ...instance,
      ...(updates.customName !== undefined ? { customName: updates.customName.trim() || undefined } : {}),
      ...(updates.notes !== undefined ? { notes: updates.notes } : {}),
      updatedAt: now
    } : instance)
  };
  assertValidCardDeckLibrary(next);
  return next;
};
