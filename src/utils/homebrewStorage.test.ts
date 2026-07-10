import { describe, expect, it } from "vitest";
import type { DiceCard } from "../types/cards";
import {
  loadHomebrewCards,
  saveHomebrewCards,
  type StorageAdapter
} from "./homebrewStorage";

class MemoryStorage implements StorageAdapter {
  private readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

const homebrewCard: DiceCard = {
  id: "test-card",
  name: "Test Strike",
  category: "homebrew",
  formula: "1d20+5",
  description: "A saved test action.",
  imageEmoji: "⚔️",
  critOn: 20,
  failOn: 1,
  isFavorite: false
};

describe("homebrew card storage", () => {
  it("saves and reloads valid homebrew cards", () => {
    const storage = new MemoryStorage();

    saveHomebrewCards(storage, [homebrewCard]);

    expect(loadHomebrewCards(storage)).toEqual([homebrewCard]);
  });

  it("returns an empty list when no cards have been saved", () => {
    const storage = new MemoryStorage();

    expect(loadHomebrewCards(storage)).toEqual([]);
  });

  it("rejects malformed saved card data", () => {
    const storage = new MemoryStorage();
    storage.setItem("dungeon-cards.homebrew.v1", "not-json");

    expect(() => loadHomebrewCards(storage)).toThrow(
      "Saved homebrew cards could not be loaded"
    );
  });
});
