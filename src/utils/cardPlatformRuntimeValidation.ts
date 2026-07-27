import type { CardDefinition } from "../types/cardPlatform";
import type {
  CardRuntimeInstance,
  DeckDefinition,
  DeckRuntimeState
} from "../types/cardPlatformRuntime";

const safeId = /^[a-z0-9][a-z0-9._:-]*$/;
const unique = (values: string[]): boolean => new Set(values).size === values.length;
const validDate = (value: string): boolean => !Number.isNaN(Date.parse(value));

export const validateCardRuntimeInstance = (
  instance: CardRuntimeInstance,
  definition: CardDefinition
): string[] => {
  const issues: string[] = [];
  try {
    if (instance.schemaVersion !== 2) issues.push("Card instances must use schema version 2.");
    if (!safeId.test(instance.id)) issues.push("Card instance ID is not safe for storage.");
    if (instance.definitionId !== definition.id) issues.push("Card instance references the wrong definition.");
    if (instance.gameSystemId !== definition.gameSystemId) issues.push("Card instance game system does not match its definition.");
    if ((instance.visibility ?? definition.visibility) === "private" && !instance.ownerId?.trim()) issues.push("Private card instances require an owner.");
    const expected = new Map(definition.resources.map((resource) => [resource.id, resource]));
    for (const resource of expected.values()) {
      const current = instance.resourceState[resource.id];
      if (current === undefined) issues.push(`Missing runtime resource: ${resource.label}`);
      else if (!Number.isInteger(current) || current < 0) issues.push(`${resource.label} runtime value is invalid.`);
      else if (resource.maximum !== "unlimited" && current > resource.maximum) issues.push(`${resource.label} runtime value exceeds its maximum.`);
      else if (resource.maximum === "unlimited" && current !== 0) issues.push(`${resource.label} must retain zero as its unlimited tracked value.`);
    }
    for (const resourceId of Object.keys(instance.resourceState)) {
      if (!expected.has(resourceId)) issues.push(`Unknown runtime resource: ${resourceId}`);
    }
    if (!unique(instance.conditions.map((condition) => condition.id))) issues.push("Runtime condition IDs must be unique.");
    if (!validDate(instance.createdAt) || !validDate(instance.updatedAt)) issues.push("Card instance timestamps are invalid.");
  } catch (error) {
    console.error("Unexpected Card Platform runtime validation failure", { instanceId: instance.id, error });
    issues.push("Card runtime validation failed unexpectedly.");
  }
  return issues;
};

export const validateDeckDefinition = (deck: DeckDefinition): string[] => {
  const issues: string[] = [];
  if (deck.schemaVersion !== 2) issues.push("Deck definitions must use schema version 2.");
  if (!safeId.test(deck.id) || !deck.name.trim()) issues.push("Deck ID and name are required.");
  if (!unique(deck.cardDefinitionIds)) issues.push("Deck card-definition IDs must be unique.");
  return issues;
};

export const validateDeckRuntimeState = (
  state: DeckRuntimeState,
  definition: DeckDefinition,
  instances: CardRuntimeInstance[]
): string[] => {
  const issues: string[] = [];
  if (state.schemaVersion !== 2) issues.push("Deck runtime state must use schema version 2.");
  if (state.deckDefinitionId !== definition.id) issues.push("Deck runtime state references the wrong definition.");
  if (state.gameSystemId !== definition.gameSystemId) issues.push("Deck runtime game system does not match its definition.");
  if (!unique(state.cardInstanceIds)) issues.push("Deck card-instance IDs must be unique.");
  const available = new Map(instances.map((instance) => [instance.id, instance]));
  for (const instanceId of state.cardInstanceIds) {
    const instance = available.get(instanceId);
    if (!instance) issues.push(`Unknown deck card instance: ${instanceId}`);
    else if (instance.gameSystemId !== state.gameSystemId) issues.push(`Deck card instance ${instanceId} belongs to another game system.`);
  }
  if (state.activeCardInstanceId && !state.cardInstanceIds.includes(state.activeCardInstanceId)) issues.push("Active card instance must belong to the deck.");
  if (!validDate(state.updatedAt)) issues.push("Deck runtime timestamp is invalid.");
  return issues;
};
