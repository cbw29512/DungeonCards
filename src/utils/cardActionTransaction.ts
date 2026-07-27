import type { CardActionHistoryEntry, CardActionHistoryEnvelope } from "../types/cardActionExecution";
import type { CardDeckLibraryEnvelope } from "../types/cardDeckLibrary";
import { buildNextCardActionHistory, serializeCardActionHistory } from "./cardActionHistoryState";
import { cardActionHistoryKey, parseCardActionHistory } from "./cardActionHistoryStorage";
import { cardDeckLibraryKey, parseCardDeckLibrary, serializeCardDeckLibrary } from "./cardDeckLibraryStorage";

export type CardActionTransactionResult = {
  library: CardDeckLibraryEnvelope;
  history: CardActionHistoryEnvelope;
};

const restore = (
  storage: Pick<Storage, "setItem" | "removeItem">,
  key: string,
  previous: string | null
): void => {
  if (previous === null) storage.removeItem(key);
  else storage.setItem(key, previous);
};

export const commitCardActionTransaction = (
  storage: Pick<Storage, "getItem" | "setItem" | "removeItem">,
  nextLibrary: CardDeckLibraryEnvelope,
  currentHistory: CardActionHistoryEnvelope,
  entry: CardActionHistoryEntry
): CardActionTransactionResult => {
  if (nextLibrary.gameSystemId !== currentHistory.gameSystemId || entry.gameSystemId !== nextLibrary.gameSystemId) {
    throw new Error("Card action transactions cannot cross game systems.");
  }
  const nextHistory = buildNextCardActionHistory(currentHistory, entry);
  const libraryText = serializeCardDeckLibrary(nextLibrary);
  const historyText = serializeCardActionHistory(nextHistory);
  const libraryKey = cardDeckLibraryKey(nextLibrary.gameSystemId);
  const historyKey = cardActionHistoryKey(nextLibrary.gameSystemId);
  const previousLibrary = storage.getItem(libraryKey);
  const previousHistory = storage.getItem(historyKey);
  try {
    storage.setItem(libraryKey, libraryText);
    storage.setItem(historyKey, historyText);
  } catch (error) {
    try {
      restore(storage, libraryKey, previousLibrary);
      restore(storage, historyKey, previousHistory);
    } catch (rollbackError) {
      console.error("Rolling back a failed card action transaction failed", { rollbackError });
    }
    throw error;
  }
  return {
    library: parseCardDeckLibrary(libraryText, nextLibrary.gameSystemId).library,
    history: parseCardActionHistory(historyText, nextLibrary.gameSystemId)
  };
};
