import type { CardDeckLibraryEnvelope, CardDeckLibraryIssue } from "../types/cardDeckLibrary";
import { validateCardDefinition } from "./cardPlatformValidation";
import {
  validateCardRuntimeInstance,
  validateDeckDefinition,
  validateDeckRuntimeState
} from "./cardPlatformRuntimeValidation";

const unique = (values: string[]): boolean => new Set(values).size === values.length;
const validDate = (value: string): boolean => !Number.isNaN(Date.parse(value));

export const inspectCardDeckLibrary = (
  library: CardDeckLibraryEnvelope
): CardDeckLibraryIssue[] => {
  const issues: CardDeckLibraryIssue[] = [];
  const add = (scope: CardDeckLibraryIssue["scope"], message: string, id?: string) => (
    issues.push({ scope, message, ...(id ? { id } : {}) })
  );
  if (library.schemaVersion !== 2) add("library", "Deck libraries must use schema version 2.");
  if (!validDate(library.updatedAt)) add("library", "Deck library timestamp is invalid.");
  for (const [scope, values] of [
    ["definition", library.definitions],
    ["instance", library.instances],
    ["deck", library.decks],
    ["deck-state", library.deckStates]
  ] as const) {
    if (!unique(values.map((value) => value.id))) add(scope, `${scope} IDs must be unique.`);
    values.filter((value) => value.gameSystemId !== library.gameSystemId)
      .forEach((value) => add(scope, `Belongs to ${value.gameSystemId}, not ${library.gameSystemId}.`, value.id));
  }
  const definitions = new Map(library.definitions.map((definition) => [definition.id, definition]));
  const instances = new Map(library.instances.map((instance) => [instance.id, instance]));
  const decks = new Map(library.decks.map((deck) => [deck.id, deck]));
  const states = new Map(library.deckStates.map((state) => [state.deckDefinitionId, state]));
  library.definitions.forEach((definition) => validateCardDefinition(definition)
    .forEach((message) => add("definition", message, definition.id)));
  library.instances.forEach((instance) => {
    const definition = definitions.get(instance.definitionId);
    if (!definition) return add("instance", `Missing definition ${instance.definitionId}.`, instance.id);
    validateCardRuntimeInstance(instance, definition)
      .forEach((message) => add("instance", message, instance.id));
  });
  library.decks.forEach((deck) => {
    validateDeckDefinition(deck).forEach((message) => add("deck", message, deck.id));
    deck.cardDefinitionIds.filter((id) => !definitions.has(id))
      .forEach((id) => add("deck", `Missing definition ${id}.`, deck.id));
    if (!states.has(deck.id)) add("deck", "Deck has no runtime state.", deck.id);
  });
  library.deckStates.forEach((state) => {
    const deck = decks.get(state.deckDefinitionId);
    if (!deck) return add("deck-state", `Missing deck ${state.deckDefinitionId}.`, state.id);
    const stateInstances = state.cardInstanceIds.flatMap((id) => instances.get(id) ?? []);
    validateDeckRuntimeState(state, deck, stateInstances)
      .forEach((message) => add("deck-state", message, state.id));
    state.cardInstanceIds.filter((id) => !instances.has(id))
      .forEach((id) => add("deck-state", `Missing card instance ${id}.`, state.id));
  });
  if (library.activeDeckId && !decks.has(library.activeDeckId)) add("library", "Active deck does not exist.", library.activeDeckId);
  if (!unique(library.archivedDeckIds)) add("library", "Archived deck IDs must be unique.");
  library.archivedDeckIds.filter((id) => !decks.has(id))
    .forEach((id) => add("library", "Archived deck does not exist.", id));
  return issues;
};

export const assertValidCardDeckLibrary = (library: CardDeckLibraryEnvelope): void => {
  const issues = inspectCardDeckLibrary(library);
  if (issues.length > 0) throw new Error(`Card deck library is invalid: ${issues.map((issue) => issue.message).join(" ")}`);
};
