import { describe, expect, it } from "vitest";
import type {
  DiceCard,
  HomebrewDiceCard
} from "../types/cards";
import {
  HOMEBREW_STORAGE_KEY,
  LEGACY_HOMEBREW_STORAGE_KEY,
  loadHomebrewCards,
  saveHomebrewCards,
  type StorageAdapter
} from "./homebrewStorage";

class MemoryStorage implements StorageAdapter {
  private readonly values = new Map<string, string>();
  getItem(key: string): string | null { return this.values.get(key) ?? null; }
  setItem(key: string, value: string): void { this.values.set(key, value); }
}

const homebrewCard: HomebrewDiceCard = {
  id: "test-card",
  name: "Test Strike",
  category: "homebrew",
  formula: "1d20+5",
  description: "A saved test action.",
  imageEmoji: "⚔️",
  critOn: 20,
  failOn: 1,
  isFavorite: false,
  schemaVersion: 2,
  gameSystemId: "dnd-2014"
};

const legacyCard: DiceCard = {
  ...homebrewCard,
  id: "legacy-card"
};
delete (legacyCard as Partial<HomebrewDiceCard>).schemaVersion;
delete (legacyCard as Partial<HomebrewDiceCard>).gameSystemId;

describe("exact-system homebrew card storage", () => {
  it("saves and reloads valid v2 homebrew cards", () => {
    const storage = new MemoryStorage();
    saveHomebrewCards(storage, [homebrewCard]);
    expect(loadHomebrewCards(storage)).toEqual({
      cards: [homebrewCard],
      migratedLegacyCount: 0
    });
  });

  it("returns an empty result when no cards have been saved", () => {
    expect(loadHomebrewCards(new MemoryStorage())).toEqual({
      cards: [],
      migratedLegacyCount: 0
    });
  });

  it("migrates legacy generic cards into D&D 2024 explicitly", () => {
    const storage = new MemoryStorage();
    storage.setItem(LEGACY_HOMEBREW_STORAGE_KEY, JSON.stringify([legacyCard]));
    expect(loadHomebrewCards(storage)).toEqual({
      cards: [{
        ...legacyCard,
        schemaVersion: 2,
        gameSystemId: "dnd-2024"
      }],
      migratedLegacyCount: 1
    });
  });

  it("rejects malformed envelopes, fields, and duplicate IDs", () => {
    const malformedJsonStorage = new MemoryStorage();
    malformedJsonStorage.setItem(HOMEBREW_STORAGE_KEY, "not-json");
    expect(() => loadHomebrewCards(malformedJsonStorage)).toThrow(
      "Saved homebrew cards could not be loaded"
    );

    const malformedCardStorage = new MemoryStorage();
    malformedCardStorage.setItem(HOMEBREW_STORAGE_KEY, JSON.stringify({
      schemaVersion: 2,
      cards: [{ ...homebrewCard, gameSystemId: "coc-7e" }]
    }));
    expect(() => loadHomebrewCards(malformedCardStorage)).toThrow(
      "Saved homebrew cards could not be loaded"
    );

    expect(() => saveHomebrewCards(new MemoryStorage(), [homebrewCard, homebrewCard])).toThrow(
      "Homebrew cards could not be saved"
    );
  });

  it("refuses to persist invalid formulas", () => {
    const invalidCard = { ...homebrewCard, formula: "roll a d20" };
    expect(() => saveHomebrewCards(new MemoryStorage(), [invalidCard])).toThrow(
      "Homebrew cards could not be saved"
    );
  });
});
