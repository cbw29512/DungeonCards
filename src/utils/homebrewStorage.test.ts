import { describe, expect, it } from "vitest";
import type { DiceCard } from "../types/cards";
import {
  HOMEBREW_STORAGE_KEY,
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
    expect(loadHomebrewCards(new MemoryStorage())).toEqual([]);
  });

  it("rejects malformed JSON and malformed card fields", () => {
    const malformedJsonStorage = new MemoryStorage();
    malformedJsonStorage.setItem(HOMEBREW_STORAGE_KEY, "not-json");

    expect(() => loadHomebrewCards(malformedJsonStorage)).toThrow(
      "Saved homebrew cards could not be loaded"
    );

    const malformedCardStorage = new MemoryStorage();
    malformedCardStorage.setItem(
      HOMEBREW_STORAGE_KEY,
      JSON.stringify([{ ...homebrewCard, name: "", critOn: Number.NaN }])
    );

    expect(() => loadHomebrewCards(malformedCardStorage)).toThrow(
      "Saved homebrew cards could not be loaded"
    );
  });

  it("refuses to persist invalid formulas", () => {
    const storage = new MemoryStorage();
    const invalidCard = { ...homebrewCard, formula: "roll a d20" };

    expect(() => saveHomebrewCards(storage, [invalidCard])).toThrow(
      "Homebrew cards could not be saved"
    );
  });
});
