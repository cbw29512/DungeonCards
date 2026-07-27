import type { GameSystemId } from "../types/cardPlatform";
import type { CardPlatformExportEnvelope } from "../types/cardPlatformRuntime";
import {
  buildCardPlatformArchive,
  parseCardPlatformArchive,
  serializeCardPlatformArchive
} from "./cardPlatformArchive";

const STORAGE_PREFIX = "dungeon-cards.private-card-library.v1";
const EMPTY_TIMESTAMP = "1970-01-01T00:00:00.000Z";

export const privateCardLibraryKey = (gameSystemId: GameSystemId): string => (
  `${STORAGE_PREFIX}.${gameSystemId}`
);

export const createEmptyPrivateCardLibrary = (
  gameSystemId: GameSystemId
): CardPlatformExportEnvelope => buildCardPlatformArchive({
  gameSystemId,
  exportedAt: EMPTY_TIMESTAMP
});

export const loadPrivateCardLibrary = (
  storage: Pick<Storage, "getItem">,
  gameSystemId: GameSystemId
): CardPlatformExportEnvelope => {
  const saved = storage.getItem(privateCardLibraryKey(gameSystemId));
  return saved
    ? parseCardPlatformArchive(saved, gameSystemId)
    : createEmptyPrivateCardLibrary(gameSystemId);
};

export const savePrivateCardLibrary = (
  storage: Pick<Storage, "setItem">,
  archive: CardPlatformExportEnvelope
): CardPlatformExportEnvelope => {
  const text = serializeCardPlatformArchive(archive);
  storage.setItem(privateCardLibraryKey(archive.gameSystemId), text);
  return parseCardPlatformArchive(text, archive.gameSystemId);
};

export const clearPrivateCardLibrary = (
  storage: Pick<Storage, "removeItem">,
  gameSystemId: GameSystemId
): void => {
  storage.removeItem(privateCardLibraryKey(gameSystemId));
};

export const privateCardLibraryIsEmpty = (
  archive: CardPlatformExportEnvelope
): boolean => archive.definitions.length === 0
  && archive.instances.length === 0
  && archive.decks.length === 0
  && archive.deckStates.length === 0;
