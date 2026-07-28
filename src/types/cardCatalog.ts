import type {
  CardDefinition,
  CardFamily,
  CardVisibility,
  GameSystemId
} from "./cardPlatform";
import type { CardReviewStatus } from "./cardPlatform";

export type CardCatalogSourceId =
  | "rules"
  | "conditions"
  | "spells"
  | "monsters"
  | "characters"
  | "homebrew"
  | "private"
  | "coc-procedures"
  | "coc-equipment"
  | "coc-rituals"
  | "coc-creatures";

export type CardCatalogEntry = {
  definition: CardDefinition;
  sourceId: CardCatalogSourceId;
  sourceLabel: string;
  privateImported: boolean;
};

export type CardCatalogIssue = {
  sourceId: CardCatalogSourceId;
  message: string;
};

export type CardCatalog = {
  gameSystemId: GameSystemId;
  entries: CardCatalogEntry[];
  issues: CardCatalogIssue[];
  sourceCounts: Partial<Record<CardCatalogSourceId, number>>;
  familyCounts: Partial<Record<CardFamily, number>>;
};

export type CardCatalogFilters = {
  query: string;
  sourceId: "all" | CardCatalogSourceId;
  family: "all" | CardFamily;
  visibility: "all" | CardVisibility;
  review: "all" | CardReviewStatus;
  sort: "title" | "family" | "source" | "review";
};
