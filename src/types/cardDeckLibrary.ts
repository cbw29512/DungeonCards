import type { CardDefinition, GameSystemId } from "./cardPlatform";
import type {
  CardRuntimeInstance,
  DeckDefinition,
  DeckRuntimeState
} from "./cardPlatformRuntime";

export type CardDeckLibraryEnvelope = {
  schemaVersion: 2;
  gameSystemId: GameSystemId;
  updatedAt: string;
  definitions: CardDefinition[];
  instances: CardRuntimeInstance[];
  decks: DeckDefinition[];
  deckStates: DeckRuntimeState[];
  activeDeckId?: string;
  archivedDeckIds: string[];
};

export type CardDeckLibraryIssue = {
  scope: "library" | "definition" | "instance" | "deck" | "deck-state";
  id?: string;
  message: string;
};

export type CardDeckLibraryLoad = {
  library: CardDeckLibraryEnvelope;
  issues: CardDeckLibraryIssue[];
};

export type CardDeckLibraryDeckView = {
  deck: DeckDefinition;
  state: DeckRuntimeState;
  instances: CardRuntimeInstance[];
  missingInstanceIds: string[];
  missingDefinitionIds: string[];
  archived: boolean;
};
