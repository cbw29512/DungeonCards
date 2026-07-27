import type { CardDefinition } from "../types/cardPlatform";
import type {
  CardActionDefinition,
  CardResourceDefinition
} from "../types/cardPlatformActions";

const safeId = /^[a-z0-9][a-z0-9._:-]*$/;
const unique = (values: string[]): boolean => new Set(values).size === values.length;

const validAction = (action: CardActionDefinition): string[] => {
  const issues: string[] = [];
  if (!safeId.test(action.id) || !action.label.trim()) issues.push("Every card action needs a safe ID and label.");
  if (action.kind === "roll") {
    if (action.rollSystem === "dice-formula" && !action.formula?.trim()) issues.push(`${action.label} needs a dice formula.`);
    if (action.criticalAt !== undefined && !Number.isInteger(action.criticalAt)) issues.push(`${action.label} has an invalid critical threshold.`);
    if (action.failureAt !== undefined && !Number.isInteger(action.failureAt)) issues.push(`${action.label} has an invalid failure threshold.`);
  }
  if (action.kind === "procedure" && action.steps.length === 0) issues.push(`${action.label} needs at least one procedure step.`);
  if (action.kind === "link" && action.targetCardIds.length === 0) issues.push(`${action.label} needs at least one target card.`);
  return issues;
};

const validResource = (resource: CardResourceDefinition): string[] => {
  const issues: string[] = [];
  if (!safeId.test(resource.id) || !resource.label.trim()) issues.push("Every card resource needs a safe ID and label.");
  if (!Number.isInteger(resource.initial) || resource.initial < 0) issues.push(`${resource.label} has an invalid initial value.`);
  if (resource.maximum !== "unlimited") {
    if (!Number.isInteger(resource.maximum) || resource.maximum < 0) issues.push(`${resource.label} has an invalid maximum.`);
    else if (resource.initial > resource.maximum) issues.push(`${resource.label} starts above its maximum.`);
  }
  if (resource.maximum === "unlimited" && resource.initial !== 0) issues.push(`${resource.label} must use zero as its tracked unlimited value.`);
  return issues;
};

export const validateCardDefinition = (card: CardDefinition): string[] => {
  const issues: string[] = [];
  try {
    if (card.schemaVersion !== 2) issues.push("Card definitions must use schema version 2.");
    if (!safeId.test(card.id)) issues.push("Card ID is not safe for storage or URLs.");
    if (!card.content.title.trim() || !card.content.summary.trim()) issues.push("Card title and summary are required.");
    if (!unique(card.content.tags)) issues.push("Card tags must be unique.");
    if (!card.source.title.trim()) issues.push("Card source title is required.");
    if (card.source.url && !card.source.url.startsWith("https://")) issues.push("Card source URL must use HTTPS.");
    if (["public", "player-safe"].includes(card.visibility) && !card.source.publicDistributionAllowed) {
      issues.push("Public or player-safe cards require a distributable source.");
    }
    if (card.source.kind === "user-owned-private" && card.source.publicDistributionAllowed) {
      issues.push("User-owned private sources cannot be marked distributable.");
    }
    if (card.review.status === "verified" && !card.review.reviewedAt) issues.push("Verified cards require a review date.");
    if (card.review.reviewedAt && Number.isNaN(Date.parse(card.review.reviewedAt))) issues.push("Card review date is invalid.");
    if (!unique(card.actions.map((action) => action.id))) issues.push("Card action IDs must be unique.");
    if (!unique(card.resources.map((resource) => resource.id))) issues.push("Card resource IDs must be unique.");
    if (!unique(card.linkedCardIds)) issues.push("Linked card IDs must be unique.");
    if (card.linkedCardIds.includes(card.id)) issues.push("A card cannot link to itself.");
    for (const action of card.actions) issues.push(...validAction(action));
    for (const resource of card.resources) issues.push(...validResource(resource));
    if (card.print.format !== "workspace-panel" && card.print.sizeId !== "poker-2.5x3.5") {
      issues.push("Standard cards and folio panels must use the universal poker-card size.");
    }
  } catch (error) {
    console.error("Unexpected Card Platform definition validation failure", { cardId: card.id, error });
    issues.push("Card definition validation failed unexpectedly.");
  }
  return issues;
};
