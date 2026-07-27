import type { GameSystemId } from "../types/cardPlatform";
import type { CardDeckLibraryEnvelope, CardDeckLibraryLoad } from "../types/cardDeckLibrary";
import { parseSafeArchiveJson } from "./cardPlatformArchiveJson";
import { isCardDeckLibraryShape } from "./cardDeckLibraryShape";
import { assertValidCardDeckLibrary, inspectCardDeckLibrary } from "./cardDeckLibraryValidation";

const STORAGE_PREFIX = "dungeon-cards.card-deck-library.v2";
const EMPTY_TIMESTAMP = "1970-01-01T00:00:00.000Z";

export const cardDeckLibraryKey = (gameSystemId: GameSystemId): string => (
  `${STORAGE_PREFIX}.${gameSystemId}`
);

export const createEmptyCardDeckLibrary = (
  gameSystemId: GameSystemId,
  updatedAt = EMPTY_TIMESTAMP
): CardDeckLibraryEnvelope => ({
  schemaVersion: 2,
  gameSystemId,
  updatedAt,
  definitions: [],
  instances: [],
  decks: [],
  deckStates: [],
  archivedDeckIds: []
});

export const canonicalCardDeckLibrary = (
  library: CardDeckLibraryEnvelope
): CardDeckLibraryEnvelope => ({
  ...library,
  definitions: [...library.definitions].sort((left, right) => left.id.localeCompare(right.id)),
  instances: [...library.instances].sort((left, right) => left.id.localeCompare(right.id)),
  decks: [...library.decks].sort((left, right) => left.id.localeCompare(right.id)),
  deckStates: [...library.deckStates].sort((left, right) => left.id.localeCompare(right.id)),
  archivedDeckIds: [...library.archivedDeckIds].sort()
});

export const serializeCardDeckLibrary = (library: CardDeckLibraryEnvelope): string => {
  assertValidCardDeckLibrary(library);
  return `${JSON.stringify(canonicalCardDeckLibrary(library), null, 2)}\n`;
};

export const parseCardDeckLibrary = (
  text: string,
  expectedGameSystemId: GameSystemId
): CardDeckLibraryLoad => {
  const value = parseSafeArchiveJson(text);
  if (!isCardDeckLibraryShape(value)) throw new Error("Saved deck data does not match Card Platform deck-library schema version 2.");
  if (value.gameSystemId !== expectedGameSystemId) {
    throw new Error(`Expected ${expectedGameSystemId} deck data but received ${value.gameSystemId}.`);
  }
  const library = canonicalCardDeckLibrary(value);
  return { library, issues: inspectCardDeckLibrary(library) };
};

export const loadCardDeckLibrary = (
  storage: Pick<Storage, "getItem">,
  gameSystemId: GameSystemId
): CardDeckLibraryLoad => {
  const saved = storage.getItem(cardDeckLibraryKey(gameSystemId));
  if (!saved) return { library: createEmptyCardDeckLibrary(gameSystemId), issues: [] };
  try {
    return parseCardDeckLibrary(saved, gameSystemId);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Saved deck data could not be read.";
    return {
      library: createEmptyCardDeckLibrary(gameSystemId),
      issues: [{ scope: "library", message }]
    };
  }
};

export const saveCardDeckLibrary = (
  storage: Pick<Storage, "setItem">,
  library: CardDeckLibraryEnvelope
): CardDeckLibraryEnvelope => {
  const text = serializeCardDeckLibrary(library);
  storage.setItem(cardDeckLibraryKey(library.gameSystemId), text);
  return parseCardDeckLibrary(text, library.gameSystemId).library;
};

export const clearCardDeckLibrary = (
  storage: Pick<Storage, "removeItem">,
  gameSystemId: GameSystemId
): void => storage.removeItem(cardDeckLibraryKey(gameSystemId));
