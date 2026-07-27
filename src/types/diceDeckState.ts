import type { GameSystemId } from "./cardPlatform";
import type { RollHistoryEntry } from "./cards";

export type DiceRollHistoryEntry = RollHistoryEntry & {
  gameSystemId: GameSystemId;
};

export type DiceDeckPersistedState = {
  schemaVersion: 1;
  gameSystemId: GameSystemId;
  deckId: string;
  favoriteCardIds: string[];
  rollHistory: DiceRollHistoryEntry[];
  updatedAt: string;
};
