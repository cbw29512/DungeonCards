import { describe, expect, it } from "vitest";
import {
  addRuleCardInstance,
  createDefaultRuleCardWorkspace,
  createRuleCardWorkspaceRepository,
  moveRuleCardInstance,
  normalizeRuleCardWorkspace,
  orderRuleCardInstances,
  removeRuleCardInstance,
  renameRuleCardInstance,
  toggleRuleCardInstancePin
} from "./ruleCardWorkspaceStorage";

class MemoryStorage implements Storage {
  private values = new Map<string, string>();
  get length() { return this.values.size; }
  clear() { this.values.clear(); }
  getItem(key: string) { return this.values.get(key) ?? null; }
  key(index: number) { return [...this.values.keys()][index] ?? null; }
  removeItem(key: string) { this.values.delete(key); }
  setItem(key: string, value: string) { this.values.set(key, value); }
}

describe("rule card instance workspace", () => {
  it("allows multiple independent copies of the same catalog card", () => {
    const initial = createDefaultRuleCardWorkspace("player", []);
    const once = addRuleCardInstance(initial, "fireball");
    const twice = addRuleCardInstance(once, "fireball");

    expect(twice.instances).toHaveLength(2);
    expect(twice.instances.map((item) => item.cardId)).toEqual(["fireball", "fireball"]);
    expect(twice.instances[0].instanceId).not.toBe(twice.instances[1].instanceId);
  });

  it("renames, pins, moves, and removes one copy without changing the other", () => {
    let workspace = createDefaultRuleCardWorkspace("player", []);
    workspace = addRuleCardInstance(workspace, "fireball");
    workspace = addRuleCardInstance(workspace, "fireball");
    const [first, second] = workspace.instances;

    workspace = renameRuleCardInstance(workspace, first.instanceId, "Wizard Fireball");
    workspace = toggleRuleCardInstancePin(workspace, second.instanceId);
    workspace = moveRuleCardInstance(workspace, second.instanceId, "earlier");
    workspace = removeRuleCardInstance(workspace, first.instanceId);

    expect(workspace.instances).toHaveLength(1);
    expect(workspace.instances[0]).toMatchObject({
      instanceId: second.instanceId,
      cardId: "fireball",
      pinned: true
    });
  });

  it("orders pinned instances first while preserving duplicate instances", () => {
    let workspace = createDefaultRuleCardWorkspace("dm", []);
    workspace = addRuleCardInstance(workspace, "check");
    workspace = addRuleCardInstance(workspace, "check");
    workspace = toggleRuleCardInstancePin(workspace, workspace.instances[1].instanceId);

    const ordered = orderRuleCardInstances(workspace.instances);
    expect(ordered[0].pinned).toBe(true);
    expect(ordered.map((item) => item.cardId)).toEqual(["check", "check"]);
  });

  it("normalizes unknown cards and duplicate instance IDs", () => {
    const workspace = createDefaultRuleCardWorkspace("player", ["a", "b"]);
    const duplicate = { ...workspace.instances[0], cardId: "b" };
    const missing = { ...workspace.instances[1], instanceId: "missing", cardId: "missing" };
    const normalized = normalizeRuleCardWorkspace(
      { ...workspace, instances: [...workspace.instances, duplicate, missing] },
      ["a", "b"]
    );

    expect(normalized.instances).toHaveLength(2);
    expect(normalized.instances.map((item) => item.cardId)).toEqual(["a", "b"]);
  });

  it("migrates an existing one-copy workspace safely", () => {
    const storage = new MemoryStorage();
    storage.setItem("dungeon-cards-workspace-v1-player", JSON.stringify({
      activeCardIds: ["attack", "fireball"]
    }));
    const repository = createRuleCardWorkspaceRepository(storage);
    const migrated = repository.load({
      role: "player",
      allowedCardIds: ["attack", "fireball"],
      defaultCardIds: []
    });

    expect(migrated.schemaVersion).toBe(2);
    expect(migrated.instances.map((item) => item.cardId)).toEqual(["attack", "fireball"]);
  });
});
