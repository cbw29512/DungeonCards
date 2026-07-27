import { describe, expect, it } from "vitest";
import { createPlayableDeck } from "./cardDeckLibraryDecks";
import {
  cardDeckLibraryKey,
  createEmptyCardDeckLibrary,
  loadCardDeckLibrary,
  saveCardDeckLibrary
} from "./cardDeckLibraryStorage";

class MemoryStorage {
  values = new Map<string, string>();
  failWrites = false;
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) {
    if (this.failWrites) throw new Error("quota exceeded");
    this.values.set(key, value);
  }
  removeItem(key: string) { this.values.delete(key); }
}

describe("exact-system playable deck storage", () => {
  it("uses separate namespaces and round-trips validated deck state", () => {
    const storage = new MemoryStorage();
    const library = createPlayableDeck(createEmptyCardDeckLibrary("dnd-2024"), {
      deckId: "deck:test",
      stateId: "deck-state:test",
      name: "Test Deck",
      kind: "personal",
      now: "2026-07-27T18:30:00.000Z"
    });
    const saved = saveCardDeckLibrary(storage, library);
    expect(cardDeckLibraryKey("dnd-2014")).not.toBe(cardDeckLibraryKey("dnd-2024"));
    expect(loadCardDeckLibrary(storage, "dnd-2024")).toEqual({ library: saved, issues: [] });
    expect(loadCardDeckLibrary(storage, "coc-7e").library.gameSystemId).toBe("coc-7e");
  });

  it("returns visible issues and an empty library for corrupt saved data", () => {
    const storage = new MemoryStorage();
    storage.values.set(cardDeckLibraryKey("dnd-2014"), "not-json");
    const loaded = loadCardDeckLibrary(storage, "dnd-2014");
    expect(loaded.library.decks).toEqual([]);
    expect(loaded.issues[0]?.message).toMatch(/not valid JSON/i);
  });

  it("preserves the previous value when a transactional write fails", () => {
    const storage = new MemoryStorage();
    const key = cardDeckLibraryKey("coc-7e");
    storage.values.set(key, "previous-library");
    storage.failWrites = true;
    expect(() => saveCardDeckLibrary(storage, createEmptyCardDeckLibrary("coc-7e")))
      .toThrow(/quota exceeded/i);
    expect(storage.values.get(key)).toBe("previous-library");
  });
});
