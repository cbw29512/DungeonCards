import { describe, expect, it } from "vitest";
import { privateArchiveCard, publicArchiveCard } from "./cardPlatformArchiveFixtures";
import { parseCardPlatformArchive } from "./cardPlatformArchive";
import { addCardToPlayableDeck, removeCardFromPlayableDeck, updatePlayableCardText } from "./cardDeckLibraryCards";
import { createPlayableDeck } from "./cardDeckLibraryDecks";
import { duplicatePlayableDeck } from "./cardDeckLibraryDuplicate";
import { buildPlayableDeckArchive } from "./cardDeckLibraryExport";
import {
  adjustPlayableCardResource,
  refreshPlayableDeckResources,
  setPlayableCardResource
} from "./cardDeckLibraryResources";
import { createEmptyCardDeckLibrary } from "./cardDeckLibraryStorage";
import { getCardDeckLibraryDeckView } from "./cardDeckLibraryView";

const baseLibrary = () => createPlayableDeck(createEmptyCardDeckLibrary("dnd-2024"), {
  deckId: "deck:adventure",
  stateId: "deck-state:adventure",
  name: "Adventure Deck",
  kind: "personal",
  now: "2026-07-27T18:30:00.000Z"
});

describe("playable Card Platform decks", () => {
  it("creates independent copies without mutating the source definition", () => {
    const first = addCardToPlayableDeck(baseLibrary(), "deck:adventure", publicArchiveCard, "instance:first", undefined, "2026-07-27T18:31:00.000Z");
    const second = addCardToPlayableDeck(first, "deck:adventure", publicArchiveCard, "instance:second", undefined, "2026-07-27T18:32:00.000Z");
    const renamed = updatePlayableCardText(second, "instance:first", { customName: "My Procedure", notes: "Use before initiative." }, "2026-07-27T18:33:00.000Z");
    const view = getCardDeckLibraryDeckView(renamed, "deck:adventure")!;
    expect(view.instances).toHaveLength(2);
    expect(view.instances[0]?.id).not.toBe(view.instances[1]?.id);
    expect(view.instances.find((instance) => instance.id === "instance:first")?.customName).toBe("My Procedure");
    expect(publicArchiveCard.content.title).toBe("Public Test Card");
    expect(view.deck.cardDefinitionIds).toEqual([publicArchiveCard.id]);
    const oneLeft = removeCardFromPlayableDeck(renamed, "deck:adventure", "instance:first");
    expect(getCardDeckLibraryDeckView(oneLeft, "deck:adventure")?.deck.cardDefinitionIds).toEqual([publicArchiveCard.id]);
    const empty = removeCardFromPlayableDeck(oneLeft, "deck:adventure", "instance:second");
    expect(getCardDeckLibraryDeckView(empty, "deck:adventure")?.deck.cardDefinitionIds).toEqual([]);
  });

  it("requires ownership for private cards and tracks bounded resources", () => {
    expect(() => addCardToPlayableDeck(baseLibrary(), "deck:adventure", privateArchiveCard, "instance:private"))
      .toThrow(/require an owner/i);
    const added = addCardToPlayableDeck(baseLibrary(), "deck:adventure", privateArchiveCard, "instance:private", "local-owner-test");
    const spent = adjustPlayableCardResource(added, "instance:private", "uses", -2, "2026-07-27T18:34:00.000Z");
    expect(spent.instances[0]?.resourceState.uses).toBe(1);
    const bounded = setPlayableCardResource(spent, "instance:private", "uses", 99);
    expect(bounded.instances[0]?.resourceState.uses).toBe(3);
    const refreshed = refreshPlayableDeckResources(spent, "deck:adventure", "long-rest");
    expect(refreshed.instances[0]?.resourceState.uses).toBe(3);
  });

  it("duplicates decks with independent instances and exports a complete exact-system graph", () => {
    const added = addCardToPlayableDeck(baseLibrary(), "deck:adventure", privateArchiveCard, "instance:private", "local-owner-test");
    const duplicate = duplicatePlayableDeck(added, {
      sourceDeckId: "deck:adventure",
      deckId: "deck:copy",
      stateId: "deck-state:copy",
      createInstanceId: (_sourceId, index) => `instance:copy-${index}`,
      now: "2026-07-27T18:35:00.000Z"
    });
    const original = getCardDeckLibraryDeckView(duplicate, "deck:adventure")!;
    const copy = getCardDeckLibraryDeckView(duplicate, "deck:copy")!;
    expect(copy.instances[0]?.id).not.toBe(original.instances[0]?.id);
    const download = buildPlayableDeckArchive(duplicate, "deck:copy", "2026-07-27T18:36:00.000Z");
    const archive = parseCardPlatformArchive(download.text, "dnd-2024");
    expect(archive.definitions).toHaveLength(1);
    expect(archive.instances).toHaveLength(1);
    expect(archive.decks[0]?.id).toBe("deck:copy");
    expect(archive.deckStates[0]?.cardInstanceIds).toEqual(["instance:copy-0"]);
  });
});
