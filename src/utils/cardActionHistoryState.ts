import type { CardActionHistoryEntry, CardActionHistoryEnvelope } from "../types/cardActionExecution";
import { MAX_CARD_ACTION_HISTORY_ENTRIES, parseCardActionHistory } from "./cardActionHistoryStorage";

export const buildNextCardActionHistory = (
  history: CardActionHistoryEnvelope,
  entry: CardActionHistoryEntry
): CardActionHistoryEnvelope => {
  if (entry.gameSystemId !== history.gameSystemId) throw new Error("Action history cannot cross game systems.");
  return {
    ...history,
    entries: [entry, ...history.entries.filter((item) => item.id !== entry.id)]
      .slice(0, MAX_CARD_ACTION_HISTORY_ENTRIES)
  };
};

export const serializeCardActionHistory = (
  history: CardActionHistoryEnvelope
): string => {
  const text = `${JSON.stringify(history, null, 2)}\n`;
  parseCardActionHistory(text, history.gameSystemId);
  return text;
};
