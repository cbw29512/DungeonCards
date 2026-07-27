import { describe, expect, it } from "vitest";
import {
  addWorkspaceCard,
  createDefaultWorkspace,
  createLocalWorkspaceRepository,
  moveWorkspaceCard,
  normalizeWorkspace,
  orderWorkspaceCards,
  removeWorkspaceCard,
  toggleWorkspacePin
} from "./workspaceStorage";

class MemoryStorage implements Storage {
  private values = new Map<string, string>();
  get length() { return this.values.size; }
  clear() { this.values.clear(); }
  getItem(key: string) { return this.values.get(key) ?? null; }
  key(index: number) { return [...this.values.keys()][index] ?? null; }
  removeItem(key: string) { this.values.delete(key); }
  setItem(key: string, value: string) { this.values.set(key, value); }
}

const load = (
  role: "player" | "dm" | "monster",
  gameSystemId: "dnd-2014" | "dnd-2024" | "coc-7e",
  allowedCardIds: string[],
  defaultCardIds: string[] = []
) => ({ role, gameSystemId, allowedCardIds, defaultCardIds });

const create = (
  role: "player" | "dm" | "monster",
  system: "dnd-2014" | "dnd-2024" | "coc-7e",
  ids: string[]
) => createDefaultWorkspace(role, system, ids);

describe("exact-system workspace storage", () => {
  it("keeps roles and game systems isolated", () => {
    const storage = new MemoryStorage();
    const repository = createLocalWorkspaceRepository(storage);
    repository.save(addWorkspaceCard(create("monster", "dnd-2014", ["goblin-2014"]), "lich-2014"));
    repository.save(addWorkspaceCard(create("monster", "dnd-2024", ["goblin-2024"]), "lich-2024"));
    repository.save(addWorkspaceCard(create("dm", "coc-7e", ["sanity"]), "chase"));

    expect(repository.load(load("monster", "dnd-2014", ["goblin-2014", "lich-2014"])).activeCardIds)
      .toEqual(["goblin-2014", "lich-2014"]);
    expect(repository.load(load("monster", "dnd-2024", ["goblin-2024", "lich-2024"])).activeCardIds)
      .toEqual(["goblin-2024", "lich-2024"]);
    expect(repository.load(load("dm", "coc-7e", ["sanity", "chase"])).activeCardIds)
      .toEqual(["sanity", "chase"]);
  });

  it("adds, removes, pins, and orders without changing the catalog", () => {
    const catalog = [{ id: "a" }, { id: "b" }, { id: "c" }];
    const initial = create("player", "dnd-2024", ["a"]);
    const added = addWorkspaceCard(initial, "b");
    const pinned = toggleWorkspacePin(added, "b");
    const removed = removeWorkspaceCard(pinned, "a");
    expect(added.activeCardIds).toEqual(["a", "b"]);
    expect(orderWorkspaceCards(catalog, pinned).map((card) => card.id)).toEqual(["b", "a"]);
    expect(removed.activeCardIds).toEqual(["b"]);
    expect(catalog.map((card) => card.id)).toEqual(["a", "b", "c"]);
  });

  it("moves cards only within pinned or unpinned groups", () => {
    let workspace = create("monster", "dnd-2014", ["a", "b", "c", "d"]);
    workspace = toggleWorkspacePin(workspace, "a");
    workspace = toggleWorkspacePin(workspace, "c");
    workspace = moveWorkspaceCard(workspace, "c", "earlier");
    expect(workspace.cardOrder).toEqual(["c", "b", "a", "d"]);
  });

  it("normalizes unknown IDs and rejects another game system", () => {
    const workspace = {
      ...create("monster", "dnd-2014", []),
      activeCardIds: ["a", "a", "missing", "b"],
      pinnedCardIds: ["missing", "b", "b"],
      cardOrder: ["missing", "b"]
    };
    expect(normalizeWorkspace(workspace, "dnd-2014", ["a", "b"])).toMatchObject({
      activeCardIds: ["a", "b"], pinnedCardIds: ["b"], cardOrder: ["b", "a"]
    });
    expect(normalizeWorkspace(workspace, "dnd-2024", ["a", "b"])).toMatchObject({
      gameSystemId: "dnd-2024", activeCardIds: []
    });
  });

  it("migrates a mixed v1 workspace through the selected system catalog", () => {
    const storage = new MemoryStorage();
    storage.setItem("dungeon-cards-workspace-v1-monster", JSON.stringify({
      activeCardIds: ["goblin-2014", "goblin-2024", "homebrew-wolf"],
      pinnedCardIds: ["goblin-2014", "goblin-2024"],
      cardOrder: ["goblin-2024", "homebrew-wolf", "goblin-2014"]
    }));
    const repository = createLocalWorkspaceRepository(storage);
    const migrated = repository.load(load(
      "monster",
      "dnd-2014",
      ["goblin-2014", "homebrew-wolf"]
    ));
    expect(migrated).toMatchObject({
      schemaVersion: 2,
      gameSystemId: "dnd-2014",
      activeCardIds: ["goblin-2014", "homebrew-wolf"],
      pinnedCardIds: ["goblin-2014"],
      cardOrder: ["homebrew-wolf", "goblin-2014"]
    });
  });

  it("falls back safely and clears only one exact workspace key", () => {
    const storage = new MemoryStorage();
    storage.setItem("dungeon-cards-workspace-v2-monster-dnd-2014", "not-json");
    const repository = createLocalWorkspaceRepository(storage);
    expect(repository.load(load("monster", "dnd-2014", ["starter"], ["starter"])).activeCardIds)
      .toEqual(["starter"]);
    repository.save(create("monster", "dnd-2014", ["a"]));
    repository.save(create("monster", "dnd-2024", ["b"]));
    repository.clear("monster", "dnd-2014");
    expect(storage.getItem("dungeon-cards-workspace-v2-monster-dnd-2014")).toBeNull();
    expect(storage.getItem("dungeon-cards-workspace-v2-monster-dnd-2024")).not.toBeNull();
  });
});
