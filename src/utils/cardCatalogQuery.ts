import type { CardCatalogEntry, CardCatalogFilters, CardCatalogSourceId } from "../types/cardCatalog";
import type { CardFamily, CardReviewStatus } from "../types/cardPlatform";

export const CARD_CATALOG_PAGE_SIZE = 36;

export const EMPTY_CARD_CATALOG_FILTERS: CardCatalogFilters = {
  query: "",
  sourceId: "all",
  family: "all",
  visibility: "all",
  review: "all",
  sort: "title"
};

const searchableText = (entry: CardCatalogEntry): string => {
  const card = entry.definition;
  return [
    card.id,
    card.gameSystemId,
    card.family,
    card.visibility,
    card.review.status,
    card.content.title,
    card.content.subtitle,
    card.content.summary,
    card.content.detail,
    ...card.content.tags,
    card.source.title,
    card.source.edition,
    card.source.section,
    card.source.license,
    entry.sourceLabel,
    ...card.actions.flatMap((action) => [
      action.label,
      action.kind,
      action.kind === "roll" ? action.formula : undefined,
      action.kind === "procedure" ? action.steps.join(" ") : undefined
    ])
  ].filter(Boolean).join(" ").toLowerCase();
};

const compare = (filters: CardCatalogFilters) => (left: CardCatalogEntry, right: CardCatalogEntry): number => {
  if (filters.sort === "family") {
    return left.definition.family.localeCompare(right.definition.family)
      || left.definition.content.title.localeCompare(right.definition.content.title);
  }
  if (filters.sort === "source") {
    return left.sourceLabel.localeCompare(right.sourceLabel)
      || left.definition.content.title.localeCompare(right.definition.content.title);
  }
  if (filters.sort === "review") {
    return left.definition.review.status.localeCompare(right.definition.review.status)
      || left.definition.content.title.localeCompare(right.definition.content.title);
  }
  return left.definition.content.title.localeCompare(right.definition.content.title);
};

export const filterCardCatalogEntries = (
  entries: CardCatalogEntry[],
  filters: CardCatalogFilters
): CardCatalogEntry[] => {
  const query = filters.query.trim().toLowerCase();
  return entries.filter((entry) => (
    (filters.sourceId === "all" || entry.sourceId === filters.sourceId)
    && (filters.family === "all" || entry.definition.family === filters.family)
    && (filters.visibility === "all" || entry.definition.visibility === filters.visibility)
    && (filters.review === "all" || entry.definition.review.status === filters.review)
    && (!query || searchableText(entry).includes(query))
  )).sort(compare(filters));
};

export const cardCatalogFilterOptions = (entries: CardCatalogEntry[]) => ({
  sources: [...new Set(entries.map((entry) => entry.sourceId))].sort() as CardCatalogSourceId[],
  families: [...new Set(entries.map((entry) => entry.definition.family))].sort() as CardFamily[],
  reviews: [...new Set(entries.map((entry) => entry.definition.review.status))].sort() as CardReviewStatus[]
});

export const paginateCardCatalogEntries = (
  entries: CardCatalogEntry[],
  requestedPage: number
) => {
  const pageCount = Math.max(1, Math.ceil(entries.length / CARD_CATALOG_PAGE_SIZE));
  const page = Math.min(Math.max(1, requestedPage), pageCount);
  const start = (page - 1) * CARD_CATALOG_PAGE_SIZE;
  return {
    page,
    pageCount,
    total: entries.length,
    entries: entries.slice(start, start + CARD_CATALOG_PAGE_SIZE)
  };
};
