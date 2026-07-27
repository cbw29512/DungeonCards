import type { CardResourceRefresh } from "../types/cardPlatformActions";
import type { CardDeckLibraryEnvelope } from "../types/cardDeckLibrary";
import { assertValidCardDeckLibrary } from "./cardDeckLibraryValidation";

const cardParts = (library: CardDeckLibraryEnvelope, instanceId: string) => {
  const instance = library.instances.find((candidate) => candidate.id === instanceId);
  if (!instance) throw new Error(`Card instance not found: ${instanceId}`);
  const definition = library.definitions.find((candidate) => candidate.id === instance.definitionId);
  if (!definition) throw new Error(`Card definition not found: ${instance.definitionId}`);
  return { instance, definition };
};

const replaceResources = (
  library: CardDeckLibraryEnvelope,
  instanceId: string,
  resourceState: Record<string, number>,
  now: string
): CardDeckLibraryEnvelope => {
  const next = {
    ...library,
    updatedAt: now,
    instances: library.instances.map((instance) => instance.id === instanceId
      ? { ...instance, resourceState, updatedAt: now }
      : instance)
  };
  assertValidCardDeckLibrary(next);
  return next;
};

export const setPlayableCardResource = (
  library: CardDeckLibraryEnvelope,
  instanceId: string,
  resourceId: string,
  requestedValue: number,
  now = new Date().toISOString()
): CardDeckLibraryEnvelope => {
  const { instance, definition } = cardParts(library, instanceId);
  const resource = definition.resources.find((candidate) => candidate.id === resourceId);
  if (!resource) throw new Error(`Card resource not found: ${resourceId}`);
  const value = resource.maximum === "unlimited"
    ? 0
    : Math.min(resource.maximum, Math.max(0, Math.trunc(requestedValue)));
  return replaceResources(library, instanceId, { ...instance.resourceState, [resourceId]: value }, now);
};

export const adjustPlayableCardResource = (
  library: CardDeckLibraryEnvelope,
  instanceId: string,
  resourceId: string,
  delta: number,
  now = new Date().toISOString()
): CardDeckLibraryEnvelope => {
  const { instance } = cardParts(library, instanceId);
  return setPlayableCardResource(
    library,
    instanceId,
    resourceId,
    (instance.resourceState[resourceId] ?? 0) + delta,
    now
  );
};

export const resetPlayableCardResource = (
  library: CardDeckLibraryEnvelope,
  instanceId: string,
  resourceId: string,
  now = new Date().toISOString()
): CardDeckLibraryEnvelope => {
  const { definition } = cardParts(library, instanceId);
  const resource = definition.resources.find((candidate) => candidate.id === resourceId);
  if (!resource) throw new Error(`Card resource not found: ${resourceId}`);
  return setPlayableCardResource(library, instanceId, resourceId, resource.initial, now);
};

export const resetPlayableCard = (
  library: CardDeckLibraryEnvelope,
  instanceId: string,
  now = new Date().toISOString()
): CardDeckLibraryEnvelope => {
  const { definition } = cardParts(library, instanceId);
  return replaceResources(library, instanceId, Object.fromEntries(definition.resources.map((resource) => [
    resource.id,
    resource.maximum === "unlimited" ? 0 : resource.initial
  ])), now);
};

export const refreshPlayableDeckResources = (
  library: CardDeckLibraryEnvelope,
  deckId: string,
  refresh: CardResourceRefresh,
  now = new Date().toISOString()
): CardDeckLibraryEnvelope => {
  const state = library.deckStates.find((candidate) => candidate.deckDefinitionId === deckId);
  if (!state) throw new Error(`Deck runtime state not found: ${deckId}`);
  const included = new Set(state.cardInstanceIds);
  const definitions = new Map(library.definitions.map((definition) => [definition.id, definition]));
  const instances = library.instances.map((instance) => {
    if (!included.has(instance.id)) return instance;
    const definition = definitions.get(instance.definitionId);
    if (!definition) return instance;
    const resourceState = { ...instance.resourceState };
    definition.resources.filter((resource) => resource.refresh === refresh).forEach((resource) => {
      resourceState[resource.id] = resource.maximum === "unlimited" ? 0 : resource.initial;
    });
    return { ...instance, resourceState, updatedAt: now };
  });
  const next = { ...library, updatedAt: now, instances };
  assertValidCardDeckLibrary(next);
  return next;
};
