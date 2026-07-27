import type { CardActionHistoryEntry } from "../types/cardActionExecution";

export const CARD_ACTION_HISTORY_PAGE_SIZE = 50;

export type CardActionHistoryFilters = {
  query: string;
  deckId: string;
  cardInstanceId: string;
  actionKind: "all" | "roll" | "procedure" | "link";
};

export const EMPTY_CARD_ACTION_HISTORY_FILTERS: CardActionHistoryFilters = {
  query: "",
  deckId: "all",
  cardInstanceId: "all",
  actionKind: "all"
};

export const filterCardActionHistory = (
  entries: CardActionHistoryEntry[],
  filters: CardActionHistoryFilters
): CardActionHistoryEntry[] => {
  const query = filters.query.trim().toLowerCase();
  return entries.filter((entry) => (
    (filters.deckId === "all" || entry.deckId === filters.deckId)
    && (filters.cardInstanceId === "all" || entry.cardInstanceId === filters.cardInstanceId)
    && (filters.actionKind === "all" || entry.actionKind === filters.actionKind)
    && (!query || [
      entry.label,
      entry.summary,
      entry.definitionId,
      entry.actionId,
      entry.roll?.formula,
      entry.roll?.successLevel
    ].filter(Boolean).join(" ").toLowerCase().includes(query))
  ));
};

export const paginateCardActionHistory = (
  entries: CardActionHistoryEntry[],
  requestedPage: number
) => {
  const pageCount = Math.max(1, Math.ceil(entries.length / CARD_ACTION_HISTORY_PAGE_SIZE));
  const page = Math.min(Math.max(1, requestedPage), pageCount);
  const start = (page - 1) * CARD_ACTION_HISTORY_PAGE_SIZE;
  return {
    page,
    pageCount,
    total: entries.length,
    entries: entries.slice(start, start + CARD_ACTION_HISTORY_PAGE_SIZE)
  };
};
