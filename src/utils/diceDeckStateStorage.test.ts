import { describe, expect, it } from "vitest";
import type { DiceDeckPersistedState } from "../types/diceDeckState";
import {
  clearDiceDeckState,
  createEmptyDiceDeckState,
  diceDeckStateKey,
  loadDiceDeckState,
  MAX_DICE_ROLL_HISTORY,
  saveDiceDeckState
} from "./diceDeckStateStorage";

class MemoryStorage implements Storage {
  private values = new Map<string, string>();
  get length() { return this.values.size; }
  clear() { this.values.clear(); }
  getItem(key: string) { return this.values.get(key) ?? null; }
  key(index: number) { return [...this.values.keys()][index] ?? null; }
  removeItem(key: string) { this.values.delete(key); }
  setItem(key: string, value: string) { this.values.set(key, value); }
}

const historyEntry = (system: "dnd-2014" | "dnd-2024", id = "roll-1") => ({
  id,
  cardId: "homebrew-strike",
  cardName: "Homebrew Strike",
  category: "homebrew" as const,
  formula: "1d20+5",
  gameSystemId: system,
  rolledAt: "2026-07-27T16:00:00.000Z",
  result: {
    formula: "1d20+5",
    dice: [{ sides: 20, results: [12] }],
    modifier: 5,
    total: 17,
    isCritical: false,
    isFailure: false
  }
});

const populatedState = (system: "dnd-2014" | "dnd-2024"): DiceDeckPersistedState => ({
  ...createEmptyDiceDeckState(system, "homebrew"),
  favoriteCardIds: ["homebrew-strike"],
  rollHistory: [historyEntry(system)]
});

describe("Dice deck state storage", () => {
  it("keeps exact systems in separate keys", () => {
    const storage = new MemoryStorage();
    saveDiceDeckState(storage, populatedState("dnd-2014"));
    saveDiceDeckState(storage, populatedState("dnd-2024"));

    expect(diceDeckStateKey("dnd-2014", "homebrew")).not.toBe(
      diceDeckStateKey("dnd-2024", "homebrew")
    );
    expect(loadDiceDeckState(storage, "dnd-2014", "homebrew").rollHistory[0]?.gameSystemId)
      .toBe("dnd-2014");
    expect(loadDiceDeckState(storage, "dnd-2024", "homebrew").rollHistory[0]?.gameSystemId)
      .toBe("dnd-2024");
  });

  it("rejects cross-system envelopes and history rows", () => {
    const storage = new MemoryStorage();
    storage.setItem(
      diceDeckStateKey("dnd-2014", "homebrew"),
      JSON.stringify(populatedState("dnd-2024"))
    );
    expect(() => loadDiceDeckState(storage, "dnd-2014", "homebrew")).toThrow(
      "invalid shape"
    );

    const mixed = populatedState("dnd-2014");
    mixed.rollHistory = [historyEntry("dnd-2024")];
    expect(() => saveDiceDeckState(storage, mixed)).toThrow("invalid shape");
  });

  it("rejects duplicate favorites and oversized history", () => {
    const storage = new MemoryStorage();
    const duplicates = populatedState("dnd-2024");
    duplicates.favoriteCardIds = ["homebrew-strike", "homebrew-strike"];
    expect(() => saveDiceDeckState(storage, duplicates)).toThrow("invalid shape");

    const oversized = populatedState("dnd-2024");
    oversized.rollHistory = Array.from(
      { length: MAX_DICE_ROLL_HISTORY + 1 },
      (_, index) => historyEntry("dnd-2024", `roll-${index}`)
    );
    expect(() => saveDiceDeckState(storage, oversized)).toThrow("invalid shape");
  });

  it("returns a clean state when no key exists and clears only the exact key", () => {
    const storage = new MemoryStorage();
    saveDiceDeckState(storage, populatedState("dnd-2014"));
    saveDiceDeckState(storage, populatedState("dnd-2024"));

    clearDiceDeckState(storage, "dnd-2014", "homebrew");

    expect(loadDiceDeckState(storage, "dnd-2014", "homebrew").rollHistory).toEqual([]);
    expect(loadDiceDeckState(storage, "dnd-2024", "homebrew").rollHistory).toHaveLength(1);
  });
});
