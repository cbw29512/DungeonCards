import type { GameSystemId } from "../types/cardPlatform";
import type { CardDeckLibraryEnvelope } from "../types/cardDeckLibrary";
import { isPlainArchiveRecord } from "./cardPlatformArchiveJson";
import {
  isCardDefinitionShape,
  isDeckDefinitionShape,
  isDeckStateShape,
  isRuntimeInstanceShape
} from "./cardPlatformArchiveShape";

const SYSTEMS = new Set<GameSystemId>(["dnd-2014", "dnd-2024", "coc-7e"]);
const stringArray = (value: unknown): value is string[] => (
  Array.isArray(value) && value.every((item) => typeof item === "string")
);

export const isCardDeckLibraryShape = (value: unknown): value is CardDeckLibraryEnvelope => (
  isPlainArchiveRecord(value)
  && value.schemaVersion === 2
  && typeof value.gameSystemId === "string"
  && SYSTEMS.has(value.gameSystemId as GameSystemId)
  && typeof value.updatedAt === "string"
  && (value.activeDeckId === undefined || typeof value.activeDeckId === "string")
  && stringArray(value.archivedDeckIds)
  && Array.isArray(value.definitions)
  && value.definitions.every(isCardDefinitionShape)
  && Array.isArray(value.instances)
  && value.instances.every(isRuntimeInstanceShape)
  && Array.isArray(value.decks)
  && value.decks.every(isDeckDefinitionShape)
  && Array.isArray(value.deckStates)
  && value.deckStates.every(isDeckStateShape)
);
