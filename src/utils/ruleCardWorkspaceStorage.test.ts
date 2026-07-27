import { describe, expect, it } from "vitest";
import type { RuleCardRulesetMap } from "../types/ruleCardWorkspaces";
import {
  addRuleCardInstance,
  changeRuleCardInstanceRuleset,
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

const cardRulesets: RuleCardRulesetMap = {
  fireball: ["srd-5.1-2014", "srd-5.2.1-2024"],
  attack: ["srd-5.1-2014", "srd-5.2.1-2024"],
  check: ["srd-5.2.1-2024"],
  a: ["srd-5.1-2014"],
  b: ["srd-5.2.1-2024"]
};
const create = (role: "player" | "dm" = "player", ids: string[] = []) => (
  createDefaultRuleCardWorkspace(role, ids, cardRulesets, "srd-5.2.1-2024")
);

const loadInput = {
  role: "player" as const,
  cardRulesets,
  defaultCardIds: [] as string[],
  defaultRuleset: "srd-5.2.1-2024" as const
};

describe("rule card instance workspace", () => {
  it("allows independent copies with exact edition identity", () => {
    const once = addRuleCardInstance(create(), "fireball", "srd-5.1-2014");
    const twice = addRuleCardInstance(once, "fireball", "srd-5.2.1-2024");
    expect(twice.instances).toHaveLength(2);
    expect(twice.instances.map((item) => item.gameSystemId)).toEqual(["dnd-2014", "dnd-2024"]);
    expect(twice.instances[0].instanceId).not.toBe(twice.instances[1].instanceId);
  });

  it("persists edition changes with matching Card Platform identity", () => {
    let workspace = addRuleCardInstance(create(), "fireball", "srd-5.1-2014");
    workspace = changeRuleCardInstanceRuleset(
      workspace,
      workspace.instances[0].instanceId,
      "srd-5.2.1-2024"
    );
    expect(workspace.instances[0]).toMatchObject({
      ruleset: "srd-5.2.1-2024",
      gameSystemId: "dnd-2024"
    });
  });

  it("renames, pins, moves, and removes one copy without changing another", () => {
    let workspace = addRuleCardInstance(create(), "fireball", "srd-5.1-2014");
    workspace = addRuleCardInstance(workspace, "fireball", "srd-5.2.1-2024");
    const [first, second] = workspace.instances;
    workspace = renameRuleCardInstance(workspace, first.instanceId, "Wizard Fireball");
    workspace = toggleRuleCardInstancePin(workspace, second.instanceId);
    workspace = moveRuleCardInstance(workspace, second.instanceId, "earlier");
    workspace = removeRuleCardInstance(workspace, first.instanceId);
    expect(workspace.instances).toHaveLength(1);
    expect(workspace.instances[0]).toMatchObject({ instanceId: second.instanceId, pinned: true });
  });

  it("normalizes unsupported editions and duplicate instance IDs", () => {
    const workspace = create("player", ["a", "b"]);
    const duplicate = { ...workspace.instances[0], cardId: "b", ruleset: "srd-5.2.1-2024" as const, gameSystemId: "dnd-2024" as const };
    const unsupported = { ...workspace.instances[1], instanceId: "unsupported", cardId: "a" };
    const normalized = normalizeRuleCardWorkspace(
      { ...workspace, instances: [...workspace.instances, duplicate, unsupported] },
      cardRulesets
    );
    expect(normalized.instances.map((item) => item.cardId)).toEqual(["a", "b"]);
    expect(orderRuleCardInstances(normalized.instances)).toHaveLength(2);
  });

  it("migrates v1 and v2 workspaces to schema v3 with deterministic editions", () => {
    const storage = new MemoryStorage();
    storage.setItem("dungeon-rule-card-workspace-v2-player", JSON.stringify({
      schemaVersion: 2,
      role: "player",
      name: "Player Table",
      instances: [{ instanceId: "old-copy", cardId: "fireball", pinned: true }],
      updatedAt: "2026-07-26T12:00:00.000Z"
    }));
    const repository = createRuleCardWorkspaceRepository(storage);
    const migratedV2 = repository.load(loadInput);
    expect(migratedV2).toMatchObject({ schemaVersion: 3 });
    expect(migratedV2.instances[0]).toMatchObject({
      instanceId: "old-copy",
      ruleset: "srd-5.2.1-2024",
      gameSystemId: "dnd-2024"
    });

    storage.removeItem("dungeon-rule-card-workspace-v2-player");
    storage.setItem("dungeon-cards-workspace-v1-player", JSON.stringify({ activeCardIds: ["attack"] }));
    const migratedV1 = repository.load(loadInput);
    expect(migratedV1.instances[0]).toMatchObject({
      cardId: "attack",
      ruleset: "srd-5.2.1-2024",
      gameSystemId: "dnd-2024"
    });
  });

  it("saves only under the schema-v3 key", () => {
    const storage = new MemoryStorage();
    const repository = createRuleCardWorkspaceRepository(storage);
    repository.save(create("player", ["fireball"]));
    expect(storage.getItem("dungeon-rule-card-workspace-v3-player")).not.toBeNull();
    expect(storage.getItem("dungeon-rule-card-workspace-v2-player")).toBeNull();
  });
});
