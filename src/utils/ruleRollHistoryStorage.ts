import type { DndGameSystemId } from "../types/cardPlatform";
import type { RollResult } from "../types/cards";
import type { RuleRollHistoryEntry, RuleRollResult, RulesetId } from "../types/ruleCards";
import type { RuleCardWorkspaceRole } from "../types/ruleCardWorkspaces";
import type { RuleRollHistoryEnvelope } from "../types/ruleRollHistoryStorage";
import { rulesetForGameSystemId } from "./cardPlatformGameSystem";

export const MAX_RULE_ROLL_HISTORY_PER_SYSTEM = 30;
const STORAGE_PREFIX = "dungeon-cards.rule-roll-history.v1";
const SAFE_ID = /^[a-z0-9][a-z0-9._-]{0,99}$/;
const SYSTEM_IDS: DndGameSystemId[] = ["dnd-2014", "dnd-2024"];

export type RuleHistoryStorageAdapter = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export const ruleRollHistoryKey = (
  role: RuleCardWorkspaceRole,
  gameSystemId: DndGameSystemId
): string => `${STORAGE_PREFIX}.${role}.${gameSystemId}`;

export const createEmptyRuleHistory = (
  role: RuleCardWorkspaceRole,
  gameSystemId: DndGameSystemId
): RuleRollHistoryEnvelope => ({
  schemaVersion: 1,
  role,
  gameSystemId,
  entries: [],
  updatedAt: new Date().toISOString()
});

const isRollResult = (value: unknown): value is RollResult => {
  if (!value || typeof value !== "object") return false;
  const result = value as Partial<RollResult>;
  return typeof result.formula === "string"
    && Array.isArray(result.dice)
    && result.dice.every((die) => Number.isSafeInteger(die.sides)
      && die.sides >= 2
      && Array.isArray(die.results)
      && die.results.every((roll) => Number.isSafeInteger(roll) && roll >= 1 && roll <= die.sides))
    && Number.isFinite(result.modifier)
    && Number.isFinite(result.total)
    && typeof result.isCritical === "boolean"
    && typeof result.isFailure === "boolean";
};

const isRuleResult = (value: unknown): value is RuleRollResult => {
  if (!isRollResult(value)) return false;
  const result = value as RuleRollResult;
  const secondary = result.secondary;
  return (result.tableResult === undefined || typeof result.tableResult === "string")
    && (secondary === undefined || (
      typeof secondary.label === "string"
      && typeof secondary.formula === "string"
      && isRollResult(secondary.result)
      && (secondary.tableResult === undefined || typeof secondary.tableResult === "string")
    ));
};

const expectedRuleset = (gameSystemId: DndGameSystemId): RulesetId => {
  const ruleset = rulesetForGameSystemId(gameSystemId);
  if (!ruleset) throw new Error("Rule roll history has an unsupported system.");
  return ruleset;
};

const isEntry = (
  value: unknown,
  gameSystemId: DndGameSystemId
): value is RuleRollHistoryEntry => {
  if (!value || typeof value !== "object") return false;
  const entry = value as Partial<RuleRollHistoryEntry>;
  return typeof entry.id === "string" && SAFE_ID.test(entry.id)
    && typeof entry.cardId === "string" && SAFE_ID.test(entry.cardId)
    && typeof entry.cardName === "string" && entry.cardName.length > 0 && entry.cardName.length <= 120
    && entry.gameSystemId === gameSystemId
    && entry.ruleset === expectedRuleset(gameSystemId)
    && typeof entry.modeLabel === "string" && entry.modeLabel.length > 0 && entry.modeLabel.length <= 120
    && typeof entry.rolledAt === "string" && Number.isFinite(Date.parse(entry.rolledAt))
    && isRuleResult(entry.result);
};

const validateEnvelope = (
  value: unknown,
  role: RuleCardWorkspaceRole,
  gameSystemId: DndGameSystemId
): RuleRollHistoryEnvelope => {
  if (!value || typeof value !== "object") throw new Error("Saved rule history has an invalid shape.");
  const envelope = value as Partial<RuleRollHistoryEnvelope>;
  const valid = envelope.schemaVersion === 1
    && envelope.role === role
    && envelope.gameSystemId === gameSystemId
    && Array.isArray(envelope.entries)
    && envelope.entries.length <= MAX_RULE_ROLL_HISTORY_PER_SYSTEM
    && envelope.entries.every((entry) => isEntry(entry, gameSystemId))
    && typeof envelope.updatedAt === "string"
    && Number.isFinite(Date.parse(envelope.updatedAt));
  if (!valid) throw new Error("Saved rule history has an invalid shape.");
  return envelope as RuleRollHistoryEnvelope;
};

export const loadRuleRollHistory = (
  storage: RuleHistoryStorageAdapter,
  role: RuleCardWorkspaceRole,
  gameSystemId: DndGameSystemId
): RuleRollHistoryEnvelope => {
  const raw = storage.getItem(ruleRollHistoryKey(role, gameSystemId));
  return raw ? validateEnvelope(JSON.parse(raw), role, gameSystemId) : createEmptyRuleHistory(role, gameSystemId);
};

export const saveRuleRollHistory = (
  storage: RuleHistoryStorageAdapter,
  envelope: RuleRollHistoryEnvelope
): void => {
  const valid = validateEnvelope(envelope, envelope.role, envelope.gameSystemId);
  storage.setItem(ruleRollHistoryKey(envelope.role, envelope.gameSystemId), JSON.stringify(valid));
};

export const clearRuleRollHistory = (
  storage: RuleHistoryStorageAdapter,
  role: RuleCardWorkspaceRole
): void => SYSTEM_IDS.forEach((systemId) => storage.removeItem(ruleRollHistoryKey(role, systemId)));
