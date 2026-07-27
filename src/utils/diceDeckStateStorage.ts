import type { GameSystemId } from "../types/cardPlatform";
import type { RollResult } from "../types/cards";
import type {
  DiceDeckPersistedState,
  DiceRollHistoryEntry
} from "../types/diceDeckState";

export const MAX_DICE_ROLL_HISTORY = 25;
const STORAGE_PREFIX = "dungeon-cards.dice-deck-state.v1";
const SYSTEM_IDS = new Set<GameSystemId>(["dnd-2014", "dnd-2024", "coc-7e"]);
const SAFE_ID = /^[a-z0-9][a-z0-9._-]{0,99}$/;

export type DiceDeckStorageAdapter = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export const diceDeckStateKey = (gameSystemId: GameSystemId, deckId: string): string => (
  `${STORAGE_PREFIX}.${gameSystemId}.${deckId}`
);

export const createEmptyDiceDeckState = (
  gameSystemId: GameSystemId,
  deckId: string
): DiceDeckPersistedState => ({
  schemaVersion: 1,
  gameSystemId,
  deckId,
  favoriteCardIds: [],
  rollHistory: [],
  updatedAt: new Date().toISOString()
});

const isStringArray = (value: unknown): value is string[] => (
  Array.isArray(value) && value.every((item) => typeof item === "string" && SAFE_ID.test(item))
);

const isRollResult = (value: unknown): value is RollResult => {
  if (!value || typeof value !== "object") return false;
  const result = value as Partial<RollResult>;
  return typeof result.formula === "string"
    && Array.isArray(result.dice)
    && result.dice.every((die) => Number.isSafeInteger(die.sides)
      && die.sides! >= 2
      && Array.isArray(die.results)
      && die.results.every((roll) => Number.isSafeInteger(roll) && roll >= 1 && roll <= die.sides!)
      && (die.keptResults === undefined || (Array.isArray(die.keptResults)
        && die.keptResults.every((roll) => Number.isSafeInteger(roll) && roll >= 1 && roll <= die.sides!))))
    && Number.isFinite(result.modifier)
    && Number.isFinite(result.total)
    && typeof result.isCritical === "boolean"
    && typeof result.isFailure === "boolean";
};

const isHistoryEntry = (value: unknown): value is DiceRollHistoryEntry => {
  if (!value || typeof value !== "object") return false;
  const entry = value as Partial<DiceRollHistoryEntry>;
  return typeof entry.id === "string" && SAFE_ID.test(entry.id)
    && typeof entry.cardId === "string" && SAFE_ID.test(entry.cardId)
    && typeof entry.cardName === "string" && entry.cardName.length > 0 && entry.cardName.length <= 120
    && typeof entry.category === "string"
    && typeof entry.formula === "string" && entry.formula.length > 0 && entry.formula.length <= 100
    && typeof entry.gameSystemId === "string" && SYSTEM_IDS.has(entry.gameSystemId as GameSystemId)
    && typeof entry.rolledAt === "string" && Number.isFinite(Date.parse(entry.rolledAt))
    && isRollResult(entry.result);
};

const validateState = (
  value: unknown,
  expectedSystemId: GameSystemId,
  expectedDeckId: string
): DiceDeckPersistedState => {
  if (!SAFE_ID.test(expectedDeckId) || !value || typeof value !== "object") {
    throw new Error("Saved deck state has an invalid shape.");
  }
  const state = value as Partial<DiceDeckPersistedState>;
  const valid = state.schemaVersion === 1
    && state.gameSystemId === expectedSystemId
    && state.deckId === expectedDeckId
    && isStringArray(state.favoriteCardIds)
    && new Set(state.favoriteCardIds).size === state.favoriteCardIds.length
    && Array.isArray(state.rollHistory)
    && state.rollHistory.length <= MAX_DICE_ROLL_HISTORY
    && state.rollHistory.every((entry) => isHistoryEntry(entry) && entry.gameSystemId === expectedSystemId)
    && typeof state.updatedAt === "string"
    && Number.isFinite(Date.parse(state.updatedAt));
  if (!valid) throw new Error("Saved deck state has an invalid shape.");
  return state as DiceDeckPersistedState;
};

export const loadDiceDeckState = (
  storage: DiceDeckStorageAdapter,
  gameSystemId: GameSystemId,
  deckId: string
): DiceDeckPersistedState => {
  const raw = storage.getItem(diceDeckStateKey(gameSystemId, deckId));
  return raw ? validateState(JSON.parse(raw), gameSystemId, deckId) : createEmptyDiceDeckState(gameSystemId, deckId);
};

export const saveDiceDeckState = (
  storage: DiceDeckStorageAdapter,
  state: DiceDeckPersistedState
): void => {
  const validated = validateState(state, state.gameSystemId, state.deckId);
  storage.setItem(diceDeckStateKey(state.gameSystemId, state.deckId), JSON.stringify(validated));
};

export const clearDiceDeckState = (
  storage: DiceDeckStorageAdapter,
  gameSystemId: GameSystemId,
  deckId: string
): void => storage.removeItem(diceDeckStateKey(gameSystemId, deckId));
