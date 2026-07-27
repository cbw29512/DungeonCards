import { describe, expect, it } from "vitest";
import { publicArchiveCard } from "./cardPlatformArchiveFixtures";
import { addCardToPlayableDeck } from "./cardDeckLibraryCards";
import { createPlayableDeck } from "./cardDeckLibraryDecks";
import { setPlayableCardResource } from "./cardDeckLibraryResources";
import { createEmptyCardDeckLibrary } from "./cardDeckLibraryStorage";

describe("playable unlimited resources", () => {
  it("retains zero as the Card Platform unlimited tracked value", () => {
    const definition = {
      ...publicArchiveCard,
      id: "archive:test:unlimited",
      resources: [{ id: "supply", label: "Supply", maximum: "unlimited" as const, initial: 0, refresh: "none" as const }]
    };
    const deck = createPlayableDeck(createEmptyCardDeckLibrary("dnd-2024"), {
      deckId: "deck:unlimited",
      stateId: "state:unlimited",
      name: "Unlimited",
      kind: "personal"
    });
    const added = addCardToPlayableDeck(deck, "deck:unlimited", definition, "instance:unlimited");
    const changed = setPlayableCardResource(added, "instance:unlimited", "supply", 99);
    expect(changed.instances[0]?.resourceState.supply).toBe(0);
  });
});
