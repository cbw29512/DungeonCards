import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { CardDeckLibraryController } from "../../hooks/useCardDeckLibrary";
import { privateArchiveCard } from "../../utils/cardPlatformArchiveFixtures";
import { addCardToPlayableDeck } from "../../utils/cardDeckLibraryCards";
import { createPlayableDeck } from "../../utils/cardDeckLibraryDecks";
import { createEmptyCardDeckLibrary } from "../../utils/cardDeckLibraryStorage";
import { createEmptyCardActionHistory } from "../../utils/cardActionHistoryStorage";
import { PlayableDeckWorkspace } from "./PlayableDeckWorkspace";

const controller = (): CardDeckLibraryController => {
  const created = createPlayableDeck(createEmptyCardDeckLibrary("dnd-2024"), {
    deckId: "deck:test",
    stateId: "deck-state:test",
    name: "Test Adventure",
    kind: "personal",
    now: "2026-07-27T18:30:00.000Z"
  });
  const library = addCardToPlayableDeck(created, "deck:test", privateArchiveCard, "instance:test", "local-owner-test", "2026-07-27T18:31:00.000Z");
  const action = vi.fn(() => true);
  return {
    library,
    issues: [],
    error: null,
    history: createEmptyCardActionHistory("dnd-2024"),
    historyError: null,
    actionError: null,
    actionResults: {},
    executeAction: action,
    clearHistory: action,
    getActionResult: () => undefined,
    createDeck: action,
    addCard: action,
    setActiveDeck: action,
    renameDeck: action,
    duplicateDeck: action,
    archiveDeck: action,
    deleteDeck: action,
    removeCard: action,
    moveCard: action,
    updateCardText: action,
    adjustResource: action,
    resetResource: action,
    resetCard: action,
    refreshDeck: action,
    exportDeck: vi.fn()
  };
};

describe("playable Card Platform deck workspace", () => {
  it("renders actions, history, resources, and copy controls outside the card shell", () => {
    const html = renderToStaticMarkup(<PlayableDeckWorkspace controller={controller()} />);
    expect(html).toContain("Playable Decks");
    expect(html).toContain("Test Adventure");
    expect(html).toContain("Print active deck");
    expect(html).toContain("Custom name");
    expect(html).toContain("Runtime notes");
    expect(html).toContain("Uses");
    expect(html).toContain("3 / 3");
    expect(html).toContain("Move earlier");
    expect(html).toContain("Remove copy");
    expect(html).toContain("Executable actions");
    expect(html).toContain("Action History");
    expect((html.match(/class="card-platform-card/g) ?? []).length).toBe(1);
    expect(html.indexOf("playable-card-runtime__controls")).toBeGreaterThan(html.indexOf("card-platform-card"));
    expect(html.indexOf("playable-card-actions")).toBeGreaterThan(html.indexOf("card-platform-card"));
    expect(html.indexOf("card-action-history")).toBeGreaterThan(html.indexOf("card-platform-card"));
  });
});
