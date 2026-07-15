import { describe, expect, it } from "vitest";
import { monsterHomebrewExample } from "../data/monsterCatalog";
import type { MonsterCardData } from "../types/monsters";
import {
  MONSTER_HOMEBREW_STORAGE_KEY,
  cloneMonsterHomebrewExample,
  loadMonsterHomebrewDraft,
  saveMonsterHomebrewDraft,
  type MonsterDraftStorageAdapter
} from "./monsterHomebrewStorage";

class MemoryStorage implements MonsterDraftStorageAdapter {
  private readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

describe("monster homebrew draft storage", () => {
  it("returns a fresh Frost Troll example when no draft exists", () => {
    const loaded = loadMonsterHomebrewDraft(new MemoryStorage());

    expect(loaded).toEqual(monsterHomebrewExample);
    expect(loaded).not.toBe(monsterHomebrewExample);
    expect(loaded.actions).not.toBe(monsterHomebrewExample.actions);
  });

  it("saves and reloads a valid homebrew monster", () => {
    const storage = new MemoryStorage();
    const monster = cloneMonsterHomebrewExample();
    monster.name = "Glacier Troll";

    saveMonsterHomebrewDraft(storage, monster);

    expect(loadMonsterHomebrewDraft(storage)).toEqual({
      ...monster,
      source: "Local homebrew draft"
    });
  });

  it("rejects malformed JSON and malformed nested fields", () => {
    const malformedJsonStorage = new MemoryStorage();
    malformedJsonStorage.setItem(MONSTER_HOMEBREW_STORAGE_KEY, "not-json");

    expect(() => loadMonsterHomebrewDraft(malformedJsonStorage)).toThrow(
      "Saved monster draft could not be loaded"
    );

    const malformedArrayStorage = new MemoryStorage();
    malformedArrayStorage.setItem(
      MONSTER_HOMEBREW_STORAGE_KEY,
      JSON.stringify({ ...monsterHomebrewExample, traits: "Regeneration" })
    );

    expect(() => loadMonsterHomebrewDraft(malformedArrayStorage)).toThrow(
      "Saved monster draft could not be loaded"
    );

    const malformedAbilityStorage = new MemoryStorage();
    malformedAbilityStorage.setItem(
      MONSTER_HOMEBREW_STORAGE_KEY,
      JSON.stringify({
        ...monsterHomebrewExample,
        abilities: { ...monsterHomebrewExample.abilities, str: 31 }
      })
    );

    expect(() => loadMonsterHomebrewDraft(malformedAbilityStorage)).toThrow(
      "Saved monster draft could not be loaded"
    );
  });

  it("refuses to save an invalid monster shape", () => {
    const storage = new MemoryStorage();
    const invalidMonster = {
      ...cloneMonsterHomebrewExample(),
      actions: [{}]
    } as MonsterCardData;

    expect(() => saveMonsterHomebrewDraft(storage, invalidMonster)).toThrow(
      "Monster draft could not be saved"
    );
  });
});
