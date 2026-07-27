import type { DndGameSystemId } from "./cardPlatform";
import type { CardDefinition } from "./cardPlatform";
import type { DeckDefinition } from "./cardPlatformRuntime";

export type DndCharacterCardCategory =
  | "attack"
  | "resource"
  | "spell"
  | "feature"
  | "item";

export type DndCharacterCardBundle = {
  schemaVersion: 1;
  buildId: string;
  gameSystemId: DndGameSystemId;
  definitions: CardDefinition[];
  deck: DeckDefinition;
};
