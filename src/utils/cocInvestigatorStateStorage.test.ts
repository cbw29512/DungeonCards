import { describe, expect, it } from "vitest";
import { cocInvestigatorCatalog } from "../data/cocInvestigatorCatalog";
import {
  clearCocInvestigatorState,
  cocInvestigatorStateKey,
  createDefaultCocInvestigatorState,
  loadCocInvestigatorState,
  saveCocInvestigatorState,
  type StorageAdapter
} from "./cocInvestigatorStateStorage";

class MemoryStorage implements StorageAdapter {
  private readonly values = new Map<string, string>();
  getItem(key: string): string | null { return this.values.get(key) ?? null; }
  setItem(key: string, value: string): void { this.values.set(key, value); }
  removeItem(key: string): void { this.values.delete(key); }
}

const investigator = cocInvestigatorCatalog[0]!;

describe("browser-local Investigator live state", () => {
  it("creates the correct starting state and maximum-Sanity inputs", () => {
    expect(createDefaultCocInvestigatorState(investigator, "2026-07-28T00:00:00.000Z")).toMatchObject({
      schemaVersion: 1,
      investigatorId: investigator.id,
      sanity: investigator.characteristics.POW,
      cthulhuMythos: 0,
      updatedAt: "2026-07-28T00:00:00.000Z"
    });
  });

  it("saves and reloads independent resource state per Investigator", () => {
    const storage = new MemoryStorage();
    const saved = saveCocInvestigatorState(storage, investigator, {
      hitPoints: 3,
      sanity: 44,
      magicPoints: 2,
      luck: 18,
      cthulhuMythos: 7
    }, "2026-07-28T01:00:00.000Z");

    expect(loadCocInvestigatorState(storage, investigator)).toEqual({ state: saved });
    expect(storage.getItem(cocInvestigatorStateKey(investigator.id))).not.toBeNull();
  });

  it("clamps Sanity to 99 minus Cthulhu Mythos", () => {
    const storage = new MemoryStorage();
    const saved = saveCocInvestigatorState(storage, investigator, {
      sanity: 99,
      cthulhuMythos: 37
    });
    expect(saved.sanity).toBe(62);
  });

  it("resets malformed or unsupported saved state safely", () => {
    const storage = new MemoryStorage();
    storage.setItem(cocInvestigatorStateKey(investigator.id), "not-json");
    const loaded = loadCocInvestigatorState(storage, investigator);
    expect(loaded.state).toEqual(createDefaultCocInvestigatorState(investigator));
    expect(loaded.error).toContain("could not be read");
  });

  it("clears a saved copy and restores the premade baseline", () => {
    const storage = new MemoryStorage();
    saveCocInvestigatorState(storage, investigator, { hitPoints: 1 });
    const restored = clearCocInvestigatorState(storage, investigator);
    expect(restored).toEqual(createDefaultCocInvestigatorState(investigator));
    expect(storage.getItem(cocInvestigatorStateKey(investigator.id))).toBeNull();
  });
});