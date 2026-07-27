import { describe, expect, it } from "vitest";
import { buildCardPlatformArchive } from "./cardPlatformArchive";
import { validArchiveFixture } from "./cardPlatformArchiveFixtures";
import { getOrCreateLocalPrivateLibraryOwner } from "./localPrivateLibraryOwner";
import {
  clearPrivateCardLibrary,
  createEmptyPrivateCardLibrary,
  loadPrivateCardLibrary,
  privateCardLibraryIsEmpty,
  privateCardLibraryKey,
  savePrivateCardLibrary
} from "./privateCardLibraryStorage";

class MemoryStorage {
  values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
  removeItem(key: string) { this.values.delete(key); }
}

describe("exact-system private card library storage", () => {
  it("uses separate keys and loads only the selected system", () => {
    const storage = new MemoryStorage();
    const dnd = savePrivateCardLibrary(storage, validArchiveFixture());
    const coc = savePrivateCardLibrary(storage, buildCardPlatformArchive({
      gameSystemId: "coc-7e",
      exportedAt: "2026-07-27T17:00:00.000Z"
    }));
    expect(privateCardLibraryKey("dnd-2024")).not.toBe(privateCardLibraryKey("coc-7e"));
    expect(loadPrivateCardLibrary(storage, "dnd-2024")).toEqual(dnd);
    expect(loadPrivateCardLibrary(storage, "coc-7e")).toEqual(coc);
    expect(privateCardLibraryIsEmpty(dnd)).toBe(false);
    expect(privateCardLibraryIsEmpty(coc)).toBe(true);
  });

  it("clears only one exact-system library", () => {
    const storage = new MemoryStorage();
    savePrivateCardLibrary(storage, validArchiveFixture());
    savePrivateCardLibrary(storage, buildCardPlatformArchive({
      gameSystemId: "dnd-2014",
      exportedAt: "2026-07-27T17:00:00.000Z"
    }));
    clearPrivateCardLibrary(storage, "dnd-2024");
    expect(privateCardLibraryIsEmpty(loadPrivateCardLibrary(storage, "dnd-2024"))).toBe(true);
    expect(storage.getItem(privateCardLibraryKey("dnd-2014"))).not.toBeNull();
  });

  it("rejects corrupt stored archives instead of normalizing them silently", () => {
    const storage = new MemoryStorage();
    storage.setItem(privateCardLibraryKey("dnd-2024"), "not-json");
    expect(() => loadPrivateCardLibrary(storage, "dnd-2024")).toThrow(/not valid JSON/i);
  });

  it("leaves the previous saved value intact when a write fails", () => {
    const storage = new MemoryStorage();
    const key = privateCardLibraryKey("dnd-2024");
    storage.setItem(key, "previous-library");
    const failing = {
      setItem: () => { throw new Error("quota exceeded"); }
    };
    expect(() => savePrivateCardLibrary(failing, validArchiveFixture())).toThrow(/quota exceeded/i);
    expect(storage.getItem(key)).toBe("previous-library");
  });

  it("creates one stable safe local owner and replaces invalid stored values", () => {
    const storage = new MemoryStorage();
    const first = getOrCreateLocalPrivateLibraryOwner(storage);
    expect(first).toMatch(/^local-owner-[A-Za-z0-9-]+$/);
    expect(getOrCreateLocalPrivateLibraryOwner(storage)).toBe(first);
    storage.values.set("dungeon-cards.private-library-owner.v1", "bad owner/id");
    expect(getOrCreateLocalPrivateLibraryOwner(storage)).not.toBe("bad owner/id");
  });

  it("creates canonical empty libraries", () => {
    const empty = createEmptyPrivateCardLibrary("dnd-2014");
    expect(empty.gameSystemId).toBe("dnd-2014");
    expect(privateCardLibraryIsEmpty(empty)).toBe(true);
  });
});
