import type { CardPlatformExportEnvelope } from "../types/cardPlatformRuntime";
import {
  MAX_ARCHIVE_DECKS,
  MAX_ARCHIVE_DECK_STATES,
  MAX_ARCHIVE_DEFINITIONS,
  MAX_ARCHIVE_INSTANCES
} from "./cardPlatformArchiveLimits";
import { validateCardRuntimeInstance, validateDeckDefinition, validateDeckRuntimeState } from "./cardPlatformRuntimeValidation";
import { validateCardDefinition } from "./cardPlatformValidation";

const duplicateIds = (values: string[]): string[] => {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  values.forEach((value) => seen.has(value) ? duplicates.add(value) : seen.add(value));
  return [...duplicates];
};

export const validateCardPlatformArchive = (
  archive: CardPlatformExportEnvelope
): string[] => {
  const issues: string[] = [];
  if (Number.isNaN(Date.parse(archive.exportedAt))) issues.push("Archive export timestamp is invalid.");
  if (archive.definitions.length > MAX_ARCHIVE_DEFINITIONS) issues.push("Archive contains too many card definitions.");
  if (archive.instances.length > MAX_ARCHIVE_INSTANCES) issues.push("Archive contains too many card instances.");
  if (archive.decks.length > MAX_ARCHIVE_DECKS) issues.push("Archive contains too many deck definitions.");
  if (archive.deckStates.length > MAX_ARCHIVE_DECK_STATES) issues.push("Archive contains too many deck states.");

  const definitionDuplicates = duplicateIds(archive.definitions.map((item) => item.id));
  const instanceDuplicates = duplicateIds(archive.instances.map((item) => item.id));
  const deckDuplicates = duplicateIds(archive.decks.map((item) => item.id));
  const stateDuplicates = duplicateIds(archive.deckStates.map((item) => item.id));
  if (definitionDuplicates.length) issues.push(`Duplicate card definitions: ${definitionDuplicates.join(", ")}.`);
  if (instanceDuplicates.length) issues.push(`Duplicate card instances: ${instanceDuplicates.join(", ")}.`);
  if (deckDuplicates.length) issues.push(`Duplicate deck definitions: ${deckDuplicates.join(", ")}.`);
  if (stateDuplicates.length) issues.push(`Duplicate deck states: ${stateDuplicates.join(", ")}.`);

  const definitions = new Map(archive.definitions.map((item) => [item.id, item]));
  const instances = new Map(archive.instances.map((item) => [item.id, item]));
  const decks = new Map(archive.decks.map((item) => [item.id, item]));

  for (const card of archive.definitions) {
    if (card.gameSystemId !== archive.gameSystemId) issues.push(`${card.id} belongs to another game system.`);
    issues.push(...validateCardDefinition(card).map((issue) => `${card.id}: ${issue}`));
    for (const linkedId of card.linkedCardIds) {
      if (!definitions.has(linkedId)) issues.push(`${card.id} links to missing card ${linkedId}.`);
    }
    for (const action of card.actions) {
      if (action.kind === "link") {
        action.targetCardIds.forEach((targetId) => {
          if (!definitions.has(targetId)) issues.push(`${card.id} action ${action.id} targets missing card ${targetId}.`);
        });
      }
    }
  }

  for (const instance of archive.instances) {
    const definition = definitions.get(instance.definitionId);
    if (instance.gameSystemId !== archive.gameSystemId) issues.push(`${instance.id} belongs to another game system.`);
    if (!definition) issues.push(`${instance.id} references missing definition ${instance.definitionId}.`);
    else issues.push(...validateCardRuntimeInstance(instance, definition).map((issue) => `${instance.id}: ${issue}`));
  }

  for (const deck of archive.decks) {
    if (deck.gameSystemId !== archive.gameSystemId) issues.push(`${deck.id} belongs to another game system.`);
    issues.push(...validateDeckDefinition(deck).map((issue) => `${deck.id}: ${issue}`));
    deck.cardDefinitionIds.forEach((definitionId) => {
      if (!definitions.has(definitionId)) issues.push(`${deck.id} references missing card ${definitionId}.`);
    });
  }

  for (const state of archive.deckStates) {
    const deck = decks.get(state.deckDefinitionId);
    if (state.gameSystemId !== archive.gameSystemId) issues.push(`${state.id} belongs to another game system.`);
    if (!deck) issues.push(`${state.id} references missing deck ${state.deckDefinitionId}.`);
    else issues.push(...validateDeckRuntimeState(state, deck, [...instances.values()]).map((issue) => `${state.id}: ${issue}`));
  }
  return issues;
};
