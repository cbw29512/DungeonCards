import type {
  CardDefinition,
  CardVisibility,
  GameSystemId
} from "./cardPlatform";

export type CardRuntimeCondition = {
  id: string;
  label: string;
  remainingRounds?: number;
  notes?: string;
};

export type CardRuntimeInstance = {
  schemaVersion: 2;
  id: string;
  definitionId: string;
  gameSystemId: GameSystemId;
  ownerId?: string;
  customName?: string;
  visibility?: CardVisibility;
  resourceState: Record<string, number>;
  conditions: CardRuntimeCondition[];
  notes: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
};

export type DeckKind =
  | "personal"
  | "game-master"
  | "encounter"
  | "character"
  | "investigator"
  | "campaign"
  | "print"
  | "favorites";

export type DeckDefinition = {
  schemaVersion: 2;
  id: string;
  gameSystemId: GameSystemId;
  kind: DeckKind;
  name: string;
  description?: string;
  visibility: CardVisibility;
  cardDefinitionIds: string[];
};

export type DeckRuntimeState = {
  schemaVersion: 2;
  id: string;
  deckDefinitionId: string;
  gameSystemId: GameSystemId;
  cardInstanceIds: string[];
  activeCardInstanceId?: string;
  notes: string;
  updatedAt: string;
};

export type CardPlatformExportEnvelope = {
  schemaVersion: 2;
  gameSystemId: GameSystemId;
  exportedAt: string;
  definitions: CardDefinition[];
  instances: CardRuntimeInstance[];
  decks: DeckDefinition[];
  deckStates: DeckRuntimeState[];
};
