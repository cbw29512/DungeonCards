import type { CardPlatformExportEnvelope } from "./cardPlatformRuntime";

export type PrivateLibraryConflictCounts = {
  definitions: number;
  instances: number;
  decks: number;
  deckStates: number;
};

export type PrivateLibraryImportPreview = {
  filename: string;
  archive: CardPlatformExportEnvelope;
  conflicts: PrivateLibraryConflictCounts;
  privateDefinitionCount: number;
  privateInstanceCount: number;
  reviewCounts: Record<string, number>;
  visibilityCounts: Record<string, number>;
};
