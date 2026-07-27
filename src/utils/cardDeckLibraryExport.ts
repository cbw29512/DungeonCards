import type { CardDeckLibraryEnvelope } from "../types/cardDeckLibrary";
import { buildCardPlatformArchive, serializeCardPlatformArchive } from "./cardPlatformArchive";
import { getCardDeckLibraryDeckView } from "./cardDeckLibraryView";

export type PlayableDeckArchiveDownload = {
  filename: string;
  text: string;
  cardCount: number;
  instanceCount: number;
};

const safeFilename = (value: string): string => (
  value.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-|-$/g, "") || "deck"
);

export const buildPlayableDeckArchive = (
  library: CardDeckLibraryEnvelope,
  deckId: string,
  exportedAt = new Date().toISOString()
): PlayableDeckArchiveDownload => {
  const view = getCardDeckLibraryDeckView(library, deckId);
  if (!view) throw new Error(`Playable deck not found: ${deckId}`);
  if (view.missingDefinitionIds.length || view.missingInstanceIds.length) {
    throw new Error("Playable deck cannot be exported while references are missing.");
  }
  const definitionIds = new Set([
    ...view.deck.cardDefinitionIds,
    ...view.instances.map((instance) => instance.definitionId)
  ]);
  const definitions = library.definitions.filter((definition) => definitionIds.has(definition.id));
  const archive = buildCardPlatformArchive({
    gameSystemId: library.gameSystemId,
    exportedAt,
    definitions,
    instances: view.instances,
    decks: [view.deck],
    deckStates: [view.state]
  });
  return {
    filename: `dm-forge-${library.gameSystemId}-${safeFilename(view.deck.name)}.json`,
    text: serializeCardPlatformArchive(archive),
    cardCount: definitions.length,
    instanceCount: view.instances.length
  };
};
