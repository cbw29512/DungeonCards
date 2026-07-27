import type {
  CardDefinition,
  CardReview,
  CardSourceReference,
  CardVisibility,
  GameSystemId
} from "../types/cardPlatform";
import type { DiceCard } from "../types/cards";

export type DiceCardAdapterOptions = {
  gameSystemId: GameSystemId;
  source: CardSourceReference;
  review?: CardReview;
  visibility?: CardVisibility;
};

export const adaptDiceCard = (
  card: DiceCard,
  options: DiceCardAdapterOptions
): CardDefinition => ({
  schemaVersion: 2,
  id: `legacy-dice:${options.gameSystemId}:${card.id}`,
  gameSystemId: options.gameSystemId,
  family: "roll-action",
  visibility: options.visibility ?? "public",
  content: {
    title: card.name,
    subtitle: card.category,
    summary: card.description,
    icon: card.imageEmoji,
    tags: ["legacy-dice", card.category]
  },
  source: options.source,
  review: options.review ?? { status: "draft" },
  actions: [{
    id: "roll",
    kind: "roll",
    label: `Roll ${card.name}`,
    rollSystem: "dice-formula",
    formula: card.formula,
    criticalAt: card.critOn,
    failureAt: card.failOn
  }],
  resources: [],
  linkedCardIds: [],
  print: {
    format: "standard-card",
    sizeId: "poker-2.5x3.5",
    faces: "front-back"
  }
});
