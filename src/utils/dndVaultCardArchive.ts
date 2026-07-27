import { getDndVaultCardBundleByBuildId } from "../data/dndVaultCardLibrary";
import { buildCardPlatformArchive, serializeCardPlatformArchive } from "./cardPlatformArchive";

export type DndVaultCardArchiveDownload = {
  filename: string;
  text: string;
  cardCount: number;
};

const safeFilenamePart = (value: string): string => (
  value.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-|-$/g, "") || "character"
);

export const buildDndVaultCardArchiveDownload = (
  buildId: string,
  exportedAt = new Date().toISOString()
): DndVaultCardArchiveDownload => {
  const bundle = getDndVaultCardBundleByBuildId(buildId);
  if (!bundle) throw new Error(`Character Vault build not found: ${buildId}.`);
  const archive = buildCardPlatformArchive({
    gameSystemId: bundle.gameSystemId,
    exportedAt,
    definitions: bundle.definitions,
    decks: [bundle.deck]
  });
  return {
    filename: `dm-forge-${bundle.gameSystemId}-${safeFilenamePart(buildId)}-cards.json`,
    text: serializeCardPlatformArchive(archive),
    cardCount: bundle.definitions.length
  };
};
