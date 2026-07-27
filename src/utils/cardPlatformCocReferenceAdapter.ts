import type { CardDefinition } from "../types/cardPlatform";
import type { CocQuickReferenceCard, CocRuleSourceRecord } from "../types/coc";
import {
  cocCardPrint,
  cocReview,
  cocSourceReference,
  safeCocId,
  type CocAdapterOptions
} from "./cardPlatformCocAdapterShared";

export const adaptCocQuickReference = (
  card: CocQuickReferenceCard,
  source: CocRuleSourceRecord,
  options: Omit<CocAdapterOptions, "source"> = {}
): CardDefinition => {
  if (card.sourceId !== source.id) {
    throw new Error(`Call of Cthulhu reference ${card.id} does not match source ${source.id}.`);
  }
  return {
    schemaVersion: 2,
    id: `legacy-coc:procedure:${safeCocId(card.id)}`,
    gameSystemId: "coc-7e",
    family: "procedure",
    visibility: options.visibility ?? "player-safe",
    content: {
      title: card.title,
      subtitle: card.stamp,
      summary: card.text,
      tags: ["legacy-coc", "quick-reference", safeCocId(source.ruleName)]
    },
    source: cocSourceReference(source),
    review: options.review ?? cocReview(source),
    actions: [{
      id: "procedure",
      kind: "procedure",
      label: card.title,
      steps: [card.text]
    }],
    resources: [],
    linkedCardIds: [],
    print: cocCardPrint
  };
};
