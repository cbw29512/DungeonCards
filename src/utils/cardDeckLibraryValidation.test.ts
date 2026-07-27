import { describe, expect, it } from "vitest";
import { createPlayableDeck } from "./cardDeckLibraryDecks";
import { parseCardDeckLibrary, createEmptyCardDeckLibrary } from "./cardDeckLibraryStorage";
import { getCardDeckLibraryDeckView } from "./cardDeckLibraryView";

describe("playable deck-library diagnostics", () => {
  it("loads structurally valid partial state with visible missing-reference issues", () => {
    const created = createPlayableDeck(createEmptyCardDeckLibrary("coc-7e"), {
      deckId: "deck:partial",
      stateId: "deck-state:partial",
      name: "Partial Deck",
      kind: "investigator",
      now: "2026-07-27T18:30:00.000Z"
    });
    const partial = {
      ...created,
      decks: created.decks.map((deck) => ({ ...deck, cardDefinitionIds: ["missing:definition"] })),
      deckStates: created.deckStates.map((state) => ({ ...state, cardInstanceIds: ["missing:instance"] }))
    };
    const loaded = parseCardDeckLibrary(JSON.stringify(partial), "coc-7e");
    expect(loaded.issues.some((issue) => issue.message.includes("Missing definition"))).toBe(true);
    expect(loaded.issues.some((issue) => issue.message.includes("Missing card instance"))).toBe(true);
    const view = getCardDeckLibraryDeckView(loaded.library, "deck:partial")!;
    expect(view.missingDefinitionIds).toEqual(["missing:definition"]);
    expect(view.missingInstanceIds).toEqual(["missing:instance"]);
  });
});
