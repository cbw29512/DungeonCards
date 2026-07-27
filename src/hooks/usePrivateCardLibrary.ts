import { useEffect, useState } from "react";
import type { GameSystemId } from "../types/cardPlatform";
import type { CardPlatformExportEnvelope } from "../types/cardPlatformRuntime";
import type { PrivateLibraryImportPreview } from "../types/privateCardLibrary";
import { serializeCardPlatformArchive } from "../utils/cardPlatformArchive";
import { downloadTextFile } from "../utils/downloadTextFile";
import { getOrCreateLocalPrivateLibraryOwner } from "../utils/localPrivateLibraryOwner";
import {
  previewPrivateLibraryImport,
  readPrivateLibraryArchiveFile
} from "../utils/privateCardLibraryImport";
import {
  clearPrivateCardLibrary,
  createEmptyPrivateCardLibrary,
  loadPrivateCardLibrary,
  privateCardLibraryIsEmpty,
  savePrivateCardLibrary
} from "../utils/privateCardLibraryStorage";

const safeSystemFilename = (gameSystemId: GameSystemId): string => (
  `dm-forge-${gameSystemId}-private-library.json`
);

export const usePrivateCardLibrary = (gameSystemId: GameSystemId) => {
  const [library, setLibrary] = useState<CardPlatformExportEnvelope>(() => (
    createEmptyPrivateCardLibrary(gameSystemId)
  ));
  const [preview, setPreview] = useState<PrivateLibraryImportPreview | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPreview(null);
    setStatus(null);
    try {
      setLibrary(loadPrivateCardLibrary(window.localStorage, gameSystemId));
      setError(null);
    } catch (caught) {
      console.error("Loading private card library failed", { gameSystemId, caught });
      setLibrary(createEmptyPrivateCardLibrary(gameSystemId));
      setError("The selected private library could not be loaded.");
    }
  }, [gameSystemId]);

  const previewFile = async (file: File): Promise<boolean> => {
    try {
      const text = await readPrivateLibraryArchiveFile(file);
      const ownerId = getOrCreateLocalPrivateLibraryOwner(window.localStorage);
      const nextPreview = previewPrivateLibraryImport(file.name, text, gameSystemId, ownerId, library);
      setPreview(nextPreview);
      setError(null);
      setStatus(`Validated ${nextPreview.archive.definitions.length} cards from ${file.name}.`);
      return true;
    } catch (caught) {
      console.error("Previewing private card archive failed", { gameSystemId, filename: file.name, caught });
      setPreview(null);
      setStatus(null);
      setError(caught instanceof Error ? caught.message : "The selected archive could not be validated.");
      return false;
    }
  };

  const commitPreview = (): boolean => {
    if (!preview) return false;
    try {
      const saved = savePrivateCardLibrary(window.localStorage, preview.archive);
      setLibrary(saved);
      setPreview(null);
      setError(null);
      setStatus(`Imported ${saved.definitions.length} cards into the ${gameSystemId} private library.`);
      return true;
    } catch (caught) {
      console.error("Saving private card library failed", { gameSystemId, caught });
      setError("The validated archive could not be saved. The previous library was not changed.");
      return false;
    }
  };

  const clear = (): boolean => {
    try {
      clearPrivateCardLibrary(window.localStorage, gameSystemId);
      setLibrary(createEmptyPrivateCardLibrary(gameSystemId));
      setPreview(null);
      setError(null);
      setStatus(`Cleared the ${gameSystemId} private library.`);
      return true;
    } catch (caught) {
      console.error("Clearing private card library failed", { gameSystemId, caught });
      setError("The private library could not be cleared.");
      return false;
    }
  };

  const exportLibrary = (): boolean => {
    if (privateCardLibraryIsEmpty(library)) return false;
    try {
      downloadTextFile(safeSystemFilename(gameSystemId), serializeCardPlatformArchive(library));
      setStatus(`Downloaded the ${gameSystemId} private library.`);
      setError(null);
      return true;
    } catch (caught) {
      console.error("Exporting private card library failed", { gameSystemId, caught });
      setError("The private library could not be exported.");
      return false;
    }
  };

  return {
    library,
    preview,
    status,
    error,
    isEmpty: privateCardLibraryIsEmpty(library),
    previewFile,
    commitPreview,
    cancelPreview: () => setPreview(null),
    clear,
    exportLibrary
  };
};
