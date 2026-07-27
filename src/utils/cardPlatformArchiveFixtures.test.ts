import type { CardDefinition } from "../types/cardPlatform";
import type {
  CardPlatformExportEnvelope,
  CardRuntimeInstance,
  DeckDefinition,
  DeckRuntimeState
} from "../types/cardPlatformRuntime";

export const publicArchiveCard: CardDefinition = {
  schemaVersion: 2,
  id: "archive:test:public-card",
  gameSystemId: "dnd-2024",
  family: "procedure",
  visibility: "player-safe",
  content: { title: "Public Test Card", summary: "A portable procedure card.", tags: ["test"] },
  source: { kind: "original", title: "DM Forge archive test", publicDistributionAllowed: true },
  review: { status: "draft" },
  actions: [{ id: "procedure", kind: "procedure", label: "Use card", steps: ["Resolve the procedure."] }],
  resources: [],
  linkedCardIds: [],
  print: { format: "standard-card", sizeId: "poker-2.5x3.5", faces: "front-back" }
};

export const privateArchiveCard: CardDefinition = {
  ...publicArchiveCard,
  id: "archive:test:private-card",
  visibility: "private",
  content: { title: "Private Test Card", summary: "A private tracked card.", tags: ["test", "private"] },
  source: { kind: "user-owned-private", title: "Owned private source", publicDistributionAllowed: false },
  resources: [{ id: "uses", label: "Uses", maximum: 3, initial: 3, refresh: "long-rest" }]
};

export const publicArchiveInstance: CardRuntimeInstance = {
  schemaVersion: 2,
  id: "archive-instance:public",
  definitionId: publicArchiveCard.id,
  gameSystemId: "dnd-2024",
  ownerId: "archived-owner",
  resourceState: {},
  conditions: [],
  notes: "",
  isArchived: false,
  createdAt: "2026-07-27T16:00:00.000Z",
  updatedAt: "2026-07-27T16:00:00.000Z"
};

export const privateArchiveInstance: CardRuntimeInstance = {
  ...publicArchiveInstance,
  id: "archive-instance:private",
  definitionId: privateArchiveCard.id,
  resourceState: { uses: 2 }
};

export const archiveDeck: DeckDefinition = {
  schemaVersion: 2,
  id: "archive-deck:test",
  gameSystemId: "dnd-2024",
  kind: "personal",
  name: "Archive Test Deck",
  visibility: "private",
  cardDefinitionIds: [publicArchiveCard.id, privateArchiveCard.id]
};

export const archiveDeckState: DeckRuntimeState = {
  schemaVersion: 2,
  id: "archive-deck-state:test",
  deckDefinitionId: archiveDeck.id,
  gameSystemId: "dnd-2024",
  cardInstanceIds: [publicArchiveInstance.id, privateArchiveInstance.id],
  activeCardInstanceId: privateArchiveInstance.id,
  notes: "Portable test state",
  updatedAt: "2026-07-27T16:00:00.000Z"
};

export const validArchiveFixture = (): CardPlatformExportEnvelope => ({
  format: "dm-forge-card-platform",
  schemaVersion: 2,
  gameSystemId: "dnd-2024",
  exportedAt: "2026-07-27T16:00:00.000Z",
  definitions: [privateArchiveCard, publicArchiveCard],
  instances: [privateArchiveInstance, publicArchiveInstance],
  decks: [archiveDeck],
  deckStates: [archiveDeckState]
});
