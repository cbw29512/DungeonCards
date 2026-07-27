import type { GameSystemId } from "../types/cardPlatform";
import type { CardPlatformExportEnvelope } from "../types/cardPlatformRuntime";
import type {
  PrivateLibraryConflictCounts,
  PrivateLibraryImportPreview
} from "../types/privateCardLibrary";
import { parseCardPlatformArchive, prepareCardPlatformImport } from "./cardPlatformArchive";
import { MAX_CARD_PLATFORM_ARCHIVE_BYTES } from "./cardPlatformArchiveLimits";

const overlapCount = (currentIds: string[], incomingIds: string[]): number => {
  const current = new Set(currentIds);
  return new Set(incomingIds.filter((id) => current.has(id))).size;
};

export const countPrivateLibraryConflicts = (
  current: CardPlatformExportEnvelope,
  incoming: CardPlatformExportEnvelope
): PrivateLibraryConflictCounts => ({
  definitions: overlapCount(current.definitions.map((item) => item.id), incoming.definitions.map((item) => item.id)),
  instances: overlapCount(current.instances.map((item) => item.id), incoming.instances.map((item) => item.id)),
  decks: overlapCount(current.decks.map((item) => item.id), incoming.decks.map((item) => item.id)),
  deckStates: overlapCount(current.deckStates.map((item) => item.id), incoming.deckStates.map((item) => item.id))
});

const countBy = (values: string[]): Record<string, number> => values.reduce<Record<string, number>>(
  (counts, value) => ({ ...counts, [value]: (counts[value] ?? 0) + 1 }),
  {}
);

export const previewPrivateLibraryImport = (
  filename: string,
  text: string,
  expectedGameSystemId: GameSystemId,
  targetOwnerId: string,
  current: CardPlatformExportEnvelope
): PrivateLibraryImportPreview => {
  const parsed = parseCardPlatformArchive(text, expectedGameSystemId);
  const archive = prepareCardPlatformImport(parsed, targetOwnerId);
  return {
    filename,
    archive,
    conflicts: countPrivateLibraryConflicts(current, archive),
    privateDefinitionCount: archive.definitions.filter((item) => item.visibility === "private").length,
    privateInstanceCount: archive.instances.filter((item) => item.ownerId === targetOwnerId).length,
    reviewCounts: countBy(archive.definitions.map((item) => item.review.status)),
    visibilityCounts: countBy(archive.definitions.map((item) => item.visibility))
  };
};

export const readPrivateLibraryArchiveFile = async (file: File): Promise<string> => {
  if (file.size > MAX_CARD_PLATFORM_ARCHIVE_BYTES) {
    throw new Error("Selected archive exceeds the 5 MB import limit.");
  }
  return file.text();
};

export const totalPrivateLibraryConflicts = (
  conflicts: PrivateLibraryConflictCounts
): number => conflicts.definitions + conflicts.instances + conflicts.decks + conflicts.deckStates;
