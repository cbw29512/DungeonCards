import { useCallback, useEffect, useState } from "react";
import type { CardDefinition, GameSystemId } from "../types/cardPlatform";
import type { CardDeckLibraryEnvelope, CardDeckLibraryIssue } from "../types/cardDeckLibrary";
import type { CardResourceRefresh } from "../types/cardPlatformActions";
import type { DeckKind } from "../types/cardPlatformRuntime";
import { createClientId } from "../utils/clientId";
import { getOrCreateLocalPrivateLibraryOwner } from "../utils/localPrivateLibraryOwner";
import { downloadTextFile } from "../utils/downloadTextFile";
import { addCardToPlayableDeck, removeCardFromPlayableDeck, reorderPlayableDeckCard, updatePlayableCardText } from "../utils/cardDeckLibraryCards";
import { createPlayableDeck, deletePlayableDeck, renamePlayableDeck, setActivePlayableDeck, setPlayableDeckArchived } from "../utils/cardDeckLibraryDecks";
import { duplicatePlayableDeck } from "../utils/cardDeckLibraryDuplicate";
import { buildPlayableDeckArchive } from "../utils/cardDeckLibraryExport";
import { adjustPlayableCardResource, refreshPlayableDeckResources, resetPlayableCard, resetPlayableCardResource } from "../utils/cardDeckLibraryResources";
import { createEmptyCardDeckLibrary, loadCardDeckLibrary, saveCardDeckLibrary } from "../utils/cardDeckLibraryStorage";

type State = { library: CardDeckLibraryEnvelope; issues: CardDeckLibraryIssue[]; error: string | null };

export const useCardDeckLibrary = (gameSystemId: GameSystemId) => {
  const [state, setState] = useState<State>({ library: createEmptyCardDeckLibrary(gameSystemId), issues: [], error: null });
  useEffect(() => {
    if (typeof window === "undefined") return;
    const loaded = loadCardDeckLibrary(window.localStorage, gameSystemId);
    setState({ ...loaded, error: null });
  }, [gameSystemId]);

  const commit = useCallback((mutate: (library: CardDeckLibraryEnvelope) => CardDeckLibraryEnvelope) => {
    if (typeof window === "undefined") return false;
    let success = false;
    setState((current) => {
      try {
        const saved = saveCardDeckLibrary(window.localStorage, mutate(current.library));
        success = true;
        return { library: saved, issues: [], error: null };
      } catch (error) {
        console.error("Updating the playable Card Platform deck library failed", { gameSystemId, error });
        return { ...current, error: error instanceof Error ? error.message : "Deck changes could not be saved." };
      }
    });
    return success;
  }, [gameSystemId]);

  const createDeck = (name: string, kind: DeckKind) => commit((library) => createPlayableDeck(library, {
    deckId: createClientId("deck"),
    stateId: createClientId("deck-state"),
    name,
    kind
  }));
  const addCard = (definition: CardDefinition) => commit((library) => {
    if (!library.activeDeckId) throw new Error("Create or select a deck before adding cards.");
    const ownerId = definition.visibility === "private"
      ? getOrCreateLocalPrivateLibraryOwner(window.localStorage)
      : undefined;
    return addCardToPlayableDeck(library, library.activeDeckId, definition, createClientId("card-instance"), ownerId);
  });
  const duplicateDeck = (deckId: string) => commit((library) => duplicatePlayableDeck(library, {
    sourceDeckId: deckId,
    deckId: createClientId("deck"),
    stateId: createClientId("deck-state"),
    createInstanceId: () => createClientId("card-instance")
  }));
  const exportDeck = (deckId: string) => {
    try {
      const download = buildPlayableDeckArchive(state.library, deckId);
      downloadTextFile(download.filename, download.text);
      setState((current) => ({ ...current, error: null }));
    } catch (error) {
      setState((current) => ({ ...current, error: error instanceof Error ? error.message : "Deck export failed." }));
    }
  };

  return {
    ...state,
    createDeck,
    addCard,
    setActiveDeck: (deckId: string) => commit((library) => setActivePlayableDeck(library, deckId)),
    renameDeck: (deckId: string, name: string) => commit((library) => renamePlayableDeck(library, deckId, name)),
    duplicateDeck,
    archiveDeck: (deckId: string, archived: boolean) => commit((library) => setPlayableDeckArchived(library, deckId, archived)),
    deleteDeck: (deckId: string) => commit((library) => deletePlayableDeck(library, deckId)),
    removeCard: (deckId: string, instanceId: string) => commit((library) => removeCardFromPlayableDeck(library, deckId, instanceId)),
    moveCard: (deckId: string, instanceId: string, direction: -1 | 1) => commit((library) => reorderPlayableDeckCard(library, deckId, instanceId, direction)),
    updateCardText: (instanceId: string, updates: { customName?: string; notes?: string }) => commit((library) => updatePlayableCardText(library, instanceId, updates)),
    adjustResource: (instanceId: string, resourceId: string, delta: number) => commit((library) => adjustPlayableCardResource(library, instanceId, resourceId, delta)),
    resetResource: (instanceId: string, resourceId: string) => commit((library) => resetPlayableCardResource(library, instanceId, resourceId)),
    resetCard: (instanceId: string) => commit((library) => resetPlayableCard(library, instanceId)),
    refreshDeck: (deckId: string, refresh: CardResourceRefresh) => commit((library) => refreshPlayableDeckResources(library, deckId, refresh)),
    exportDeck
  };
};
