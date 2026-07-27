import type { GameSystemId } from "../types/cardPlatform";
import type { CardPlatformExportEnvelope } from "../types/cardPlatformRuntime";
import { createEmptyPrivateCardLibrary, loadPrivateCardLibrary } from "./privateCardLibraryStorage";

export type CatalogPrivateLibraryLoad = {
  archive: CardPlatformExportEnvelope;
  issue?: string;
};

export const loadCatalogPrivateLibrary = (gameSystemId: GameSystemId): CatalogPrivateLibraryLoad => {
  if (typeof window === "undefined") return { archive: createEmptyPrivateCardLibrary(gameSystemId) };
  try {
    return { archive: loadPrivateCardLibrary(window.localStorage, gameSystemId) };
  } catch (error) {
    console.error("Loading the Card Catalog private library failed", { gameSystemId, error });
    return {
      archive: createEmptyPrivateCardLibrary(gameSystemId),
      issue: "The selected private library could not be loaded and was excluded from this catalog."
    };
  }
};
