import type {
  CardPrintLayout,
  CardReview,
  CardSourceReference,
  CardVisibility
} from "../types/cardPlatform";
import type { CocRuleSourceRecord } from "../types/coc";

export type CocAdapterOptions = {
  review?: CardReview;
  source?: CocRuleSourceRecord;
  visibility?: CardVisibility;
};

export const cocCardPrint: CardPrintLayout = {
  format: "standard-card",
  sizeId: "poker-2.5x3.5",
  faces: "front-back"
};

export const safeCocId = (value: string): string => (
  value.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-|-$/g, "") || "entry"
);

export const cocSourceReference = (source?: CocRuleSourceRecord): CardSourceReference => source ? {
  kind: source.status === "prototype" ? "original" : "reference-only",
  title: source.sourceTitle,
  url: source.sourceUrl,
  edition: "coc-7e",
  section: source.chapterOrSection,
  page: source.page,
  publicDistributionAllowed: true,
  notes: source.notes.join(" ") || undefined
} : {
  kind: "original",
  title: "DM Forge original percentile-horror content",
  edition: "coc-7e",
  publicDistributionAllowed: true,
  notes: "Original public-safe game content; not copied from an official creature, equipment, ritual, scenario, or sourcebook catalog."
};

export const cocReview = (source?: CocRuleSourceRecord): CardReview => {
  if (!source) return { status: "draft" };
  if (source.status === "verified" && source.verifiedAt) return {
    status: "verified",
    reviewedAt: source.verifiedAt,
    reviewer: source.primaryReviewer,
    notes: source.notes
  };
  return {
    status: source.status === "needs-review" ? "rules-reviewed" : "draft",
    reviewer: source.primaryReviewer,
    notes: source.notes
  };
};
