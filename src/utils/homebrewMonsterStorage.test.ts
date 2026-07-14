import { describe, expect, it } from "vitest";
import type { MonsterCardData } from "../types/monsters";
import {
  HOMEBREW_MONSTER_STORAGE_KEY,
  loadHomebrewMonsters,
  saveHomebrewMonsters,
  type HomebrewMonsterStorageAdapter
} from "./homebrewMonsterStorage";
import { cloneMonsterHomebrewExample } from "./monsterHomebrewStorage";

class MemoryStorage implements HomebrewMonsterStorageAdapter {
  private readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

const createSavedMonster = (id: string, name: string): MonsterCardData => ({
  ...cloneMonsterHomebrewExample(),
  id,
  name,
  ruleset: "homebrew",
  source: "Local homebrew monster"
});

describe("homebrew monster library storage", () => {
  it("saves and reloads valid homebrew monsters", () => {
    const storage = new MemoryStorage();
    const monsters = [
      createSavedMonster("homebrew-one", "Glacier Troll"),
      createSavedMonster("homebrew-two", "Ash Troll")
    ];

    saveHomebrewMonsters(storage, monsters);

    expect(loadHomebrewMonsters(storage)).toEqual(monsters);
  });

  it("returns an empty list when no monsters have been saved", () => {
    expect(loadHomebrewMonsters(new MemoryStorage())).toEqual([]);
  });

  it("rejects malformed JSON, duplicate IDs, and incomplete monsters", () => {
    const malformedJsonStorage = new MemoryStorage();
    malformedJsonStorage.setItem(HOMEBREW_MONSTER_STORAGE_KEY, "not-json");

    expect(() => loadHomebrewMonsters(malformedJsonStorage)).toThrow(
      "Saved homebrew monsters could not be loaded"
    );

    const duplicateStorage = new MemoryStorage();
    const duplicateMonsters = [
      createSavedMonster("duplicate-id", "First Troll"),
      createSavedMonster("duplicate-id", "Second Troll")
    ];
    duplicateStorage.setItem(
      HOMEBREW_MONSTER_STORAGE_KEY,
      JSON.stringify(duplicateMonsters)
    );

    expect(() => loadHomebrewMonsters(duplicateStorage)).toThrow(
      "Saved homebrew monsters could not be loaded"
    );

    const incompleteStorage = new MemoryStorage();
    incompleteStorage.setItem(
      HOMEBREW_MONSTER_STORAGE_KEY,
      JSON.stringify([{ ...createSavedMonster("incomplete", ""), name: "" }])
    );

    expect(() => loadHomebrewMonsters(incompleteStorage)).toThrow(
      "Saved homebrew monsters could not be loaded"
    );
  });

  it("refuses to save incomplete monsters", () => {
    const storage = new MemoryStorage();
    const incomplete = createSavedMonster("no-speed", "Slow Troll");
    incomplete.speed = "";

    expect(() => saveHomebrewMonsters(storage, [incomplete])).toThrow(
      "Homebrew monsters could not be saved"
    );
  });
});
