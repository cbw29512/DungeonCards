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

describe("workspace storage", () => {
  it("keeps Player, DM, and Monster workspaces isolated", () => {
    const storage = new MemoryStorage();
    const repository = createLocalWorkspaceRepository(storage);
    const player = addWorkspaceCard(createDefaultWorkspace("player", ["sword"]), "fireball");
    const dm = addWorkspaceCard(createDefaultWorkspace("dm", ["pit"]), "wand");
    const monster = addWorkspaceCard(createDefaultWorkspace("monster", ["goblin"]), "lich");

    repository.save(player);
    repository.save(dm);
    repository.save(monster);

    expect(repository.load({ role: "player", allowedCardIds: ["sword", "fireball"], defaultCardIds: [] }).activeCardIds)
      .toEqual(["sword", "fireball"]);
    expect(repository.load({ role: "dm", allowedCardIds: ["pit", "wand"], defaultCardIds: [] }).activeCardIds)
      .toEqual(["pit", "wand"]);
    expect(repository.load({ role: "monster", allowedCardIds: ["goblin", "lich"], defaultCardIds: [] }).activeCardIds)
      .toEqual(["goblin", "lich"]);
  });

  it("adds and removes cards without changing the catalog", () => {
    const catalog = [{ id: "a" }, { id: "b" }, { id: "c" }];
    const initial = createDefaultWorkspace("player", ["a"]);
    const added = addWorkspaceCard(initial, "b");
    const removed = removeWorkspaceCard(added, "a");

    expect(added.activeCardIds).toEqual(["a", "b"]);
    expect(removed.activeCardIds).toEqual(["b"]);
    expect(catalog.map((card) => card.id)).toEqual(["a", "b", "c"]);
  });

  it("pins cards and orders pinned cards first", () => {
    const cards = [{ id: "a" }, { id: "b" }, { id: "c" }];
    const workspace = toggleWorkspacePin(createDefaultWorkspace("dm", ["a", "b", "c"]), "c");

    expect(orderWorkspaceCards(cards, workspace).map((card) => card.id)).toEqual(["c", "a", "b"]);
  });

  it("moves a card only within its pinned or unpinned group", () => {
    let workspace = createDefaultWorkspace("player", ["a", "b", "c", "d"]);
    workspace = toggleWorkspacePin(workspace, "a");
    workspace = toggleWorkspacePin(workspace, "c");
    workspace = moveWorkspaceCard(workspace, "c", "earlier");

    expect(workspace.cardOrder).toEqual(["c", "b", "a", "d"]);
    expect(orderWorkspaceCards(
      [{ id: "a" }, { id: "b" }, { id: "c" }, { id: "d" }],
      workspace
    ).map((card) => card.id)).toEqual(["c", "a", "b", "d"]);
  });

  it("normalizes unknown, duplicate, and removed card IDs", () => {
    const workspace = {
      ...createDefaultWorkspace("player", []),
      activeCardIds: ["a", "a", "missing", "b"],
      pinnedCardIds: ["missing", "b", "b"],
      cardOrder: ["missing", "b"]
    };

    expect(normalizeWorkspace(workspace, ["a", "b"])).toMatchObject({
      activeCardIds: ["a", "b"],
      pinnedCardIds: ["b"],
      cardOrder: ["b", "a"]
    });
  });

  it("falls back safely when saved workspace data is malformed", () => {
    const storage = new MemoryStorage();
    storage.setItem("dungeon-cards-workspace-v1-player", "not-json");
    const repository = createLocalWorkspaceRepository(storage);

    expect(repository.load({
      role: "player",
      allowedCardIds: ["starter"],
      defaultCardIds: ["starter"]
    }).activeCardIds).toEqual(["starter"]);
  });
});