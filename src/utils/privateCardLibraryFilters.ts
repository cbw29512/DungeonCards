import type { CardDefinition, CardVisibility } from "../types/cardPlatform";

export type PrivateLibraryCardFilters = {
  query: string;
  family: string;
  visibility: "all" | CardVisibility;
  review: string;
};

export const EMPTY_PRIVATE_LIBRARY_FILTERS: PrivateLibraryCardFilters = {
  query: "",
  family: "all",
  visibility: "all",
  review: "all"
};

export const privateLibraryFilterOptions = (cards: CardDefinition[]) => ({
  families: [...new Set(cards.map((card) => card.family))].sort(),
  reviews: [...new Set(cards.map((card) => card.review.status))].sort()
});

export const filterPrivateLibraryCards = (
  cards: CardDefinition[],
  filters: PrivateLibraryCardFilters
): CardDefinition[] => {
  const query = filters.query.trim().toLowerCase();
  return cards.filter((card) => {
    if (filters.family !== "all" && card.family !== filters.family) return false;
    if (filters.visibility !== "all" && card.visibility !== filters.visibility) return false;
    if (filters.review !== "all" && card.review.status !== filters.review) return false;
    if (!query) return true;
    const text = [
      card.content.title,
      card.content.subtitle,
      card.content.summary,
      card.content.detail,
      card.family,
      card.visibility,
      card.review.status,
      card.source.title,
      card.source.edition,
      ...card.content.tags,
      ...card.actions.map((action) => action.label)
    ].filter(Boolean).join(" ").toLowerCase();
    return text.includes(query);
  });
};
