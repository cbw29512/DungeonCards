import type { GameSystemId } from "../types/cardPlatform";
import type { CardActionHistoryEntry, CardActionHistoryEnvelope, CardActionHistoryLoad } from "../types/cardActionExecution";
import { isPlainArchiveRecord, parseSafeArchiveJson } from "./cardPlatformArchiveJson";

export const MAX_CARD_ACTION_HISTORY_ENTRIES = 500;
const KEY_PREFIX = "dungeon-cards.card-action-history.v1";
const SAFE_ID = /^[A-Za-z0-9._:@-]{1,240}$/;
const SYSTEMS = new Set<GameSystemId>(["dnd-2014", "dnd-2024", "coc-7e"]);
const text = (value: unknown, maximum = 500): value is string => typeof value === "string" && value.length <= maximum;
const optionalNumber = (value: unknown): boolean => value === undefined || (typeof value === "number" && Number.isFinite(value));
const integerArray = (value: unknown, maximum = 100): value is number[] => Array.isArray(value) && value.length <= maximum && value.every((item) => Number.isSafeInteger(item));

const resourceChange = (value: unknown): boolean => isPlainArchiveRecord(value)
  && text(value.resourceId, 240) && Number.isSafeInteger(value.before)
  && Number.isSafeInteger(value.after) && Number.isSafeInteger(value.amount);

const rollDetails = (value: unknown): boolean => value === undefined || (
  isPlainArchiveRecord(value)
  && ["dice-formula", "d20", "percentile"].includes(String(value.rollSystem))
  && (value.formula === undefined || text(value.formula, 120))
  && optionalNumber(value.total) && optionalNumber(value.percentileRoll)
  && optionalNumber(value.percentileTarget)
  && (value.percentileDifficulty === undefined || ["regular", "hard", "extreme"].includes(String(value.percentileDifficulty)))
  && (value.percentileMode === undefined || ["normal", "bonus", "double-bonus", "penalty", "double-penalty"].includes(String(value.percentileMode)))
  && (value.successLevel === undefined || ["critical", "extreme", "hard", "regular", "failure", "fumble"].includes(String(value.successLevel)))
  && (value.meetsDifficulty === undefined || typeof value.meetsDifficulty === "boolean")
  && (value.isCritical === undefined || typeof value.isCritical === "boolean")
  && (value.isFailure === undefined || typeof value.isFailure === "boolean")
  && (value.dice === undefined || (Array.isArray(value.dice) && value.dice.length <= 20 && value.dice.every((die) => (
    isPlainArchiveRecord(die) && Number.isSafeInteger(die.sides)
    && integerArray(die.results) && (die.keptResults === undefined || integerArray(die.keptResults))
  ))))
);

const historyEntry = (value: unknown, gameSystemId: GameSystemId): value is CardActionHistoryEntry => isPlainArchiveRecord(value)
  && value.schemaVersion === 1 && text(value.id, 240) && SAFE_ID.test(value.id)
  && value.gameSystemId === gameSystemId && text(value.executedAt, 40) && !Number.isNaN(Date.parse(value.executedAt))
  && [value.deckId, value.cardInstanceId, value.definitionId, value.actionId].every((id) => text(id, 240) && SAFE_ID.test(id))
  && ["roll", "procedure", "link"].includes(String(value.actionKind))
  && text(value.label) && text(value.summary, 1_000) && rollDetails(value.roll)
  && Array.isArray(value.resourceChanges) && value.resourceChanges.length <= 50
  && value.resourceChanges.every(resourceChange);

export const cardActionHistoryKey = (gameSystemId: GameSystemId): string => `${KEY_PREFIX}.${gameSystemId}`;

export const createEmptyCardActionHistory = (gameSystemId: GameSystemId): CardActionHistoryEnvelope => ({
  format: "dm-forge-card-action-history",
  schemaVersion: 1,
  gameSystemId,
  entries: []
});

export const parseCardActionHistory = (textValue: string, expectedSystem: GameSystemId): CardActionHistoryEnvelope => {
  const value = parseSafeArchiveJson(textValue);
  if (!isPlainArchiveRecord(value) || value.format !== "dm-forge-card-action-history" || value.schemaVersion !== 1
    || typeof value.gameSystemId !== "string" || !SYSTEMS.has(value.gameSystemId as GameSystemId)
    || value.gameSystemId !== expectedSystem || !Array.isArray(value.entries)
    || value.entries.length > MAX_CARD_ACTION_HISTORY_ENTRIES
    || !value.entries.every((entry) => historyEntry(entry, expectedSystem))) {
    throw new Error("Saved card action history is invalid or belongs to another game system.");
  }
  const ids = value.entries.map((entry) => entry.id);
  if (new Set(ids).size !== ids.length) throw new Error("Saved card action history contains duplicate IDs.");
  return value as CardActionHistoryEnvelope;
};

export const loadCardActionHistory = (
  storage: Pick<Storage, "getItem">,
  gameSystemId: GameSystemId
): CardActionHistoryLoad => {
  const saved = storage.getItem(cardActionHistoryKey(gameSystemId));
  if (!saved) return { history: createEmptyCardActionHistory(gameSystemId) };
  try {
    return { history: parseCardActionHistory(saved, gameSystemId) };
  } catch (error) {
    return {
      history: createEmptyCardActionHistory(gameSystemId),
      error: error instanceof Error ? error.message : "Saved card action history could not be read."
    };
  }
};

export const appendCardActionHistory = (
  storage: Pick<Storage, "setItem">,
  history: CardActionHistoryEnvelope,
  entry: CardActionHistoryEntry
): CardActionHistoryEnvelope => {
  if (entry.gameSystemId !== history.gameSystemId) throw new Error("Action history cannot cross game systems.");
  const next = { ...history, entries: [entry, ...history.entries.filter((item) => item.id !== entry.id)].slice(0, MAX_CARD_ACTION_HISTORY_ENTRIES) };
  const textValue = `${JSON.stringify(next, null, 2)}\n`;
  const parsed = parseCardActionHistory(textValue, history.gameSystemId);
  storage.setItem(cardActionHistoryKey(history.gameSystemId), textValue);
  return parsed;
};

export const clearCardActionHistory = (
  storage: Pick<Storage, "removeItem">,
  gameSystemId: GameSystemId
): void => storage.removeItem(cardActionHistoryKey(gameSystemId));
