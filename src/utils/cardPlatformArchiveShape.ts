import type { CardDefinition, GameSystemId } from "../types/cardPlatform";
import type { CardPlatformExportEnvelope, CardRuntimeInstance, DeckDefinition, DeckRuntimeState } from "../types/cardPlatformRuntime";
import { isPlainArchiveRecord } from "./cardPlatformArchiveJson";

const SYSTEMS = new Set<GameSystemId>(["dnd-2014", "dnd-2024", "coc-7e"]);
const VISIBILITY = new Set(["public", "player-safe", "game-master-only", "private"]);
const FAMILIES = new Set(["rule", "procedure", "roll-action", "spell", "ritual", "weapon", "item", "condition", "creature", "npc", "clue", "handout", "location", "scene", "table", "generator", "character-action", "investigator-action"]);
const SOURCE_KINDS = new Set(["srd", "free-rules", "original", "licensed", "user-owned-private", "reference-only"]);
const REVIEW = new Set(["draft", "rules-reviewed", "playtested", "verified"]);
const DECK_KINDS = new Set(["personal", "game-master", "encounter", "character", "investigator", "campaign", "print", "favorites"]);
const stringArray = (value: unknown): value is string[] => Array.isArray(value) && value.every((item) => typeof item === "string");
const optionalString = (value: unknown): boolean => value === undefined || typeof value === "string";
const optionalNumber = (value: unknown): boolean => value === undefined || typeof value === "number";
const system = (value: unknown): value is GameSystemId => typeof value === "string" && SYSTEMS.has(value as GameSystemId);

const action = (value: unknown): boolean => {
  if (!isPlainArchiveRecord(value) || typeof value.id !== "string" || typeof value.label !== "string") return false;
  if (value.kind === "roll") return ["dice-formula", "d20", "percentile"].includes(String(value.rollSystem))
    && optionalString(value.formula) && optionalString(value.notes) && optionalNumber(value.criticalAt)
    && optionalNumber(value.failureAt) && (value.allowsAdvantage === undefined || typeof value.allowsAdvantage === "boolean");
  if (value.kind === "procedure") return stringArray(value.steps);
  if (value.kind === "link") return stringArray(value.targetCardIds);
  return false;
};

const resource = (value: unknown): boolean => isPlainArchiveRecord(value)
  && typeof value.id === "string" && typeof value.label === "string"
  && (value.maximum === "unlimited" || typeof value.maximum === "number")
  && typeof value.initial === "number"
  && ["none", "turn", "round", "short-rest", "long-rest", "daily", "session", "manual"].includes(String(value.refresh))
  && optionalString(value.unit) && optionalString(value.notes);

export const isCardDefinitionShape = (value: unknown): value is CardDefinition => {
  if (!isPlainArchiveRecord(value) || !isPlainArchiveRecord(value.content)
    || !isPlainArchiveRecord(value.source) || !isPlainArchiveRecord(value.review)
    || !isPlainArchiveRecord(value.print)) return false;
  return value.schemaVersion === 2 && typeof value.id === "string" && system(value.gameSystemId)
    && typeof value.family === "string" && FAMILIES.has(value.family)
    && typeof value.visibility === "string" && VISIBILITY.has(value.visibility)
    && typeof value.content.title === "string" && typeof value.content.summary === "string"
    && optionalString(value.content.subtitle) && optionalString(value.content.detail)
    && optionalString(value.content.icon) && stringArray(value.content.tags)
    && typeof value.source.kind === "string" && SOURCE_KINDS.has(value.source.kind)
    && typeof value.source.title === "string" && optionalString(value.source.url)
    && optionalString(value.source.edition) && optionalString(value.source.section)
    && optionalNumber(value.source.page) && optionalString(value.source.license)
    && optionalString(value.source.notes) && typeof value.source.publicDistributionAllowed === "boolean"
    && typeof value.review.status === "string" && REVIEW.has(value.review.status)
    && optionalString(value.review.reviewedAt) && optionalString(value.review.reviewer)
    && (value.review.notes === undefined || stringArray(value.review.notes))
    && Array.isArray(value.actions) && value.actions.every(action)
    && Array.isArray(value.resources) && value.resources.every(resource)
    && stringArray(value.linkedCardIds) && typeof value.print.format === "string" && typeof value.print.sizeId === "string";
};

export const isRuntimeInstanceShape = (value: unknown): value is CardRuntimeInstance => isPlainArchiveRecord(value)
  && value.schemaVersion === 2 && typeof value.id === "string" && typeof value.definitionId === "string"
  && system(value.gameSystemId) && optionalString(value.ownerId) && optionalString(value.customName)
  && (value.visibility === undefined || (typeof value.visibility === "string" && VISIBILITY.has(value.visibility)))
  && isPlainArchiveRecord(value.resourceState) && Object.values(value.resourceState).every((item) => typeof item === "number")
  && Array.isArray(value.conditions) && value.conditions.every((condition) => isPlainArchiveRecord(condition)
    && typeof condition.id === "string" && typeof condition.label === "string"
    && optionalNumber(condition.remainingRounds) && optionalString(condition.notes))
  && typeof value.notes === "string" && typeof value.isArchived === "boolean"
  && typeof value.createdAt === "string" && typeof value.updatedAt === "string";

export const isDeckDefinitionShape = (value: unknown): value is DeckDefinition => isPlainArchiveRecord(value)
  && value.schemaVersion === 2 && typeof value.id === "string" && system(value.gameSystemId)
  && typeof value.kind === "string" && DECK_KINDS.has(value.kind) && typeof value.name === "string"
  && optionalString(value.description) && typeof value.visibility === "string" && VISIBILITY.has(value.visibility)
  && stringArray(value.cardDefinitionIds);

export const isDeckStateShape = (value: unknown): value is DeckRuntimeState => isPlainArchiveRecord(value)
  && value.schemaVersion === 2 && typeof value.id === "string" && typeof value.deckDefinitionId === "string"
  && system(value.gameSystemId) && stringArray(value.cardInstanceIds)
  && optionalString(value.activeCardInstanceId) && typeof value.notes === "string" && typeof value.updatedAt === "string";

export const isArchiveEnvelopeShape = (value: unknown): value is CardPlatformExportEnvelope => isPlainArchiveRecord(value)
  && value.format === "dm-forge-card-platform" && value.schemaVersion === 2 && system(value.gameSystemId)
  && typeof value.exportedAt === "string" && Array.isArray(value.definitions) && value.definitions.every(isCardDefinitionShape)
  && Array.isArray(value.instances) && value.instances.every(isRuntimeInstanceShape)
  && Array.isArray(value.decks) && value.decks.every(isDeckDefinitionShape)
  && Array.isArray(value.deckStates) && value.deckStates.every(isDeckStateShape);
