import type { GameSystemId } from "../types/cardPlatform";
import type {
  CardPlatformExportEnvelope,
  CardRuntimeInstance,
  DeckDefinition,
  DeckRuntimeState
} from "../types/cardPlatformRuntime";
import type { CardDefinition } from "../types/cardPlatform";
import {
  CARD_PLATFORM_ARCHIVE_FORMAT,
  CARD_PLATFORM_ARCHIVE_SCHEMA_VERSION,
  MAX_CARD_PLATFORM_ARCHIVE_BYTES
} from "./cardPlatformArchiveLimits";
import { parseSafeArchiveJson } from "./cardPlatformArchiveJson";
import { isArchiveEnvelopeShape } from "./cardPlatformArchiveShape";
import { validateCardPlatformArchive } from "./cardPlatformArchiveValidation";

export type CardPlatformArchiveInput = {
  gameSystemId: GameSystemId;
  exportedAt?: string;
  definitions?: CardDefinition[];
  instances?: CardRuntimeInstance[];
  decks?: DeckDefinition[];
  deckStates?: DeckRuntimeState[];
};

const canonical = (archive: CardPlatformExportEnvelope): CardPlatformExportEnvelope => ({
  ...archive,
  definitions: [...archive.definitions].sort((left, right) => left.id.localeCompare(right.id)),
  instances: [...archive.instances].sort((left, right) => left.id.localeCompare(right.id)),
  decks: [...archive.decks].sort((left, right) => left.id.localeCompare(right.id)),
  deckStates: [...archive.deckStates].sort((left, right) => left.id.localeCompare(right.id))
});

const assertValidArchive = (archive: CardPlatformExportEnvelope): void => {
  const issues = validateCardPlatformArchive(archive);
  if (issues.length > 0) throw new Error(`Card Platform archive is invalid: ${issues.join(" ")}`);
};

export const buildCardPlatformArchive = (
  input: CardPlatformArchiveInput
): CardPlatformExportEnvelope => {
  const archive: CardPlatformExportEnvelope = canonical({
    format: CARD_PLATFORM_ARCHIVE_FORMAT,
    schemaVersion: CARD_PLATFORM_ARCHIVE_SCHEMA_VERSION,
    gameSystemId: input.gameSystemId,
    exportedAt: input.exportedAt ?? new Date().toISOString(),
    definitions: input.definitions ?? [],
    instances: input.instances ?? [],
    decks: input.decks ?? [],
    deckStates: input.deckStates ?? []
  });
  assertValidArchive(archive);
  return archive;
};

export const serializeCardPlatformArchive = (
  archive: CardPlatformExportEnvelope
): string => {
  assertValidArchive(archive);
  const text = `${JSON.stringify(canonical(archive), null, 2)}\n`;
  if (new TextEncoder().encode(text).byteLength > MAX_CARD_PLATFORM_ARCHIVE_BYTES) {
    throw new Error("Card Platform archive exceeds the 5 MB export limit.");
  }
  return text;
};

export const parseCardPlatformArchive = (
  text: string,
  expectedGameSystemId?: GameSystemId
): CardPlatformExportEnvelope => {
  const value = parseSafeArchiveJson(text);
  if (!isArchiveEnvelopeShape(value)) throw new Error("Card Platform archive does not match schema version 2.");
  if (expectedGameSystemId && value.gameSystemId !== expectedGameSystemId) {
    throw new Error(`Expected ${expectedGameSystemId} archive but received ${value.gameSystemId}.`);
  }
  assertValidArchive(value);
  return canonical(value);
};

const SAFE_OWNER_ID = /^[A-Za-z0-9._:@-]{1,200}$/;

export const prepareCardPlatformImport = (
  archive: CardPlatformExportEnvelope,
  targetOwnerId?: string
): CardPlatformExportEnvelope => {
  assertValidArchive(archive);
  if (targetOwnerId !== undefined && !SAFE_OWNER_ID.test(targetOwnerId)) {
    throw new Error("Import owner ID is invalid.");
  }
  const definitions = new Map(archive.definitions.map((definition) => [definition.id, definition]));
  const instances = archive.instances.map((instance) => {
    const definition = definitions.get(instance.definitionId)!;
    const visibility = instance.visibility ?? definition.visibility;
    const { ownerId: _archivedOwnerId, ...portable } = instance;
    if (visibility !== "private") return portable;
    if (!targetOwnerId) throw new Error(`Private card instance ${instance.id} requires a target owner.`);
    return { ...portable, ownerId: targetOwnerId };
  });
  const prepared = canonical({ ...archive, instances });
  assertValidArchive(prepared);
  return prepared;
};
