import { describe, expect, it } from "vitest";
import { publicArchiveCard } from "./cardPlatformArchiveFixtures";
import { addCardToPlayableDeck, reorderPlayableDeckCard } from "./cardDeckLibraryCards";
import {
  createPlayableDeck,
  deletePlayableDeck,
  renamePlayableDeck,
  setActivePlayableDeck,
  setPlayableDeckArchived
} from "./cardDeckLibraryDecks";
import { createEmptyCardDeckLibrary } from "./cardDeckLibraryStorage";
import { getCardDeckLibraryDeckView } from "./cardDeckLibraryView";

describe("playable deck lifecycle", () => {
  it("creates, renames, selects, archives, restores, and deletes decks", () => {
    const first = createPlayableDeck(createEmptyCardDeckLibrary("dnd-2014"), {
      deckId: "deck:first", stateId: "state:first", name: "First", kind: "game-master", now: "2026-07-27T18:30:00.000Z"
    });
    const second = createPlayableDeck(first, {
      deckId: "deck:second", stateId: "state:second", name: "Second", kind: "encounter", now: "2026-07-27T18:31:00.000Z"
    });
    const renamed = renamePlayableDeck(second, "deck:first", "First Renamed");
    expect(renamed.decks.find((deck) => deck.id === "deck:first")?.name).toBe("First Renamed");
    const selected = setActivePlayableDeck(renamed, "deck:first");
    expect(selected.activeDeckId).toBe("deck:first");
    const archived = setPlayableDeckArchived(selected, "deck:first", true);
    expect(archived.archivedDeckIds).toContain("deck:first");
    expect(archived.activeDeckId).toBeUndefined();
    const restored = setPlayableDeckArchived(archived, "deck:first", false);
    expect(restored.archivedDeckIds).not.toContain("deck:first");
    const removed = deletePlayableDeck(restored, "deck:first");
    expect(removed.decks.map((deck) => deck.id)).toEqual(["deck:second"]);
  });

  it("rejects cross-system cards and preserves explicit runtime ordering", () => {
    const library = createPlayableDeck(createEmptyCardDeckLibrary("coc-7e"), {
      deckId: "deck:coc", stateId: "state:coc", name: "Investigation", kind: "investigator"
    });
    expect(() => addCardToPlayableDeck(library, "deck:coc", publicArchiveCard, "instance:wrong"))
      .toThrow(/Cannot add dnd-2024 card to coc-7e/i);
    const first = addCardToPlayableDeck(createPlayableDeck(createEmptyCardDeckLibrary("dnd-2024"), {
      deckId: "deck:order", stateId: "state:order", name: "Order", kind: "personal"
    }), "deck:order", publicArchiveCard, "instance:first");
    const second = addCardToPlayableDeck(first, "deck:order", publicArchiveCard, "instance:second");
    const moved = reorderPlayableDeckCard(second, "deck:order", "instance:second", -1);
    expect(getCardDeckLibraryDeckView(moved, "deck:order")?.state.cardInstanceIds).toEqual(["instance:second", "instance:first"]);
  });
});
