import { describe, expect, it } from "vitest";
import type { EncounterMonsterEntry } from "../types/encounterMonsters";
import type { SrdMonsterRecord } from "../types/srdCompendium";
import {
  addMonsterEncounterCondition,
  addMonsterEncounterInstance,
  removeMonsterEncounterInstance,
  setMonsterEncounterHitPoints,
  setMonsterEncounterInitiative,
  setMonsterEncounterLegendaryRemaining,
  setMonsterEncounterMaximumHitPoints,
  setMonsterEncounterReaction,
  setMonsterEncounterRecharge,
  sortMonsterEncounterByInitiative,
  startMonsterEncounterTurn
} from "./monsterEncounterWorkspaceMutations";
import {
  createEmptyMonsterEncounterWorkspace,
  normalizeMonsterEncounterWorkspace
} from "./monsterEncounterWorkspaceModel";
import { createMonsterEncounterWorkspaceRepository } from "./monsterEncounterWorkspaceRepository";

const record = (id: string, name: string, patch: Partial<SrdMonsterRecord> = {}): SrdMonsterRecord => ({
  id,
  edition: "srd-5.1-2014",
  sourceVersion: "5.1",
  name,
  size: "Small",
  type: "Humanoid",
  alignment: "Neutral Evil",
  armorClass: "15",
  hitPoints: "7 (2d6)",
  speed: "30 ft.",
  challenge: "1/4",
  traits: "",
  actions: "Scimitar. Melee Weapon Attack.",
  bonusActions: "",
  reactions: "",
  legendaryActions: "",
  rawText: `${name} complete reference`,
  sourcePage: 1,
  sourceReference: "SRD 5.1",
  ...patch
});

const entry = (id: string, name: string, patch: Partial<SrdMonsterRecord> = {}): EncounterMonsterEntry => ({
  id,
  kind: "reference",
  name,
  ruleset: "srd-5.1-2014",
  cr: patch.challenge ?? "1/4",
  type: patch.type ?? "Humanoid",
  size: patch.size ?? "Small",
  source: "SRD 5.1",
  monster: record(id, name, patch)
});

const goblin = entry("goblin", "Goblin");
const dragon = entry("dragon", "Ancient Test Dragon", {
  size: "Gargantuan",
  type: "Dragon",
  hitPoints: "350 (20d20 + 140)",
  challenge: "24",
  actions: "Fire Breath (Recharge 5–6). Each creature makes a saving throw.",
  reactions: "Tail Parry. The dragon adds to its Armor Class.",
  legendaryActions: "The dragon can take 3 legendary actions. Detect. Tail Attack. Wing Attack."
});

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>();
  get length() { return this.values.size; }
  clear() { this.values.clear(); }
  getItem(key: string) { return this.values.get(key) ?? null; }
  key(index: number) { return [...this.values.keys()][index] ?? null; }
  removeItem(key: string) { this.values.delete(key); }
  setItem(key: string, value: string) { this.values.set(key, value); }
}

describe("monster encounter instances", () => {
  it("creates repeated definitions as independent named combatants", () => {
    let workspace = createEmptyMonsterEncounterWorkspace("dnd-2014");
    workspace = addMonsterEncounterInstance(workspace, goblin, "goblin-1");
    workspace = addMonsterEncounterInstance(workspace, goblin, "goblin-2");
    workspace = addMonsterEncounterInstance(workspace, goblin, "goblin-3");

    expect(workspace.instances.map(({ instanceId }) => instanceId)).toEqual(["goblin-1", "goblin-2", "goblin-3"]);
    expect(workspace.instances.map(({ label }) => label)).toEqual(["Goblin 1", "Goblin 2", "Goblin 3"]);
    expect(workspace.instances.every(({ currentHitPoints, reactionAvailable }) => currentHitPoints === 7 && reactionAvailable)).toBe(true);
  });

  it("chooses the first unused generated label after a copy is removed", () => {
    let workspace = createEmptyMonsterEncounterWorkspace("dnd-2014");
    workspace = addMonsterEncounterInstance(workspace, goblin, "goblin-1");
    workspace = addMonsterEncounterInstance(workspace, goblin, "goblin-2");
    workspace = addMonsterEncounterInstance(workspace, goblin, "goblin-3");
    workspace = removeMonsterEncounterInstance(workspace, "goblin-2");
    workspace = addMonsterEncounterInstance(workspace, goblin, "goblin-4");

    expect(workspace.instances.map(({ label }) => label)).toEqual(["Goblin 1", "Goblin 3", "Goblin 2"]);
    expect(new Set(workspace.instances.map(({ label }) => label.toLocaleLowerCase("en-US"))).size).toBe(3);
  });

  it("supports rolled maximum HP while preserving full or damaged state predictably", () => {
    let workspace = createEmptyMonsterEncounterWorkspace("dnd-2014");
    workspace = addMonsterEncounterInstance(workspace, goblin, "goblin-1");
    workspace = setMonsterEncounterMaximumHitPoints(workspace, "goblin-1", 11);
    expect(workspace.instances[0]).toMatchObject({ maximumHitPoints: 11, currentHitPoints: 11 });

    workspace = setMonsterEncounterHitPoints(workspace, "goblin-1", 4);
    workspace = setMonsterEncounterMaximumHitPoints(workspace, "goblin-1", 9);
    expect(workspace.instances[0]).toMatchObject({ maximumHitPoints: 9, currentHitPoints: 4 });

    workspace = setMonsterEncounterMaximumHitPoints(workspace, "goblin-1", 3);
    expect(workspace.instances[0]).toMatchObject({ maximumHitPoints: 3, currentHitPoints: 3 });
  });

  it("keeps HP, initiative, and conditions independent and sorts initiative", () => {
    let workspace = createEmptyMonsterEncounterWorkspace("dnd-2014");
    workspace = addMonsterEncounterInstance(workspace, goblin, "goblin-1");
    workspace = addMonsterEncounterInstance(workspace, goblin, "goblin-2");
    workspace = addMonsterEncounterInstance(workspace, dragon, "dragon-1");
    workspace = setMonsterEncounterHitPoints(workspace, "goblin-1", 2);
    workspace = setMonsterEncounterInitiative(workspace, "goblin-1", 18);
    workspace = setMonsterEncounterInitiative(workspace, "goblin-2", 9);
    workspace = setMonsterEncounterInitiative(workspace, "dragon-1", 21);
    workspace = addMonsterEncounterCondition(workspace, "goblin-1", "Frightened");
    workspace = addMonsterEncounterCondition(workspace, "goblin-1", " frightened ");
    workspace = sortMonsterEncounterByInitiative(workspace);

    expect(workspace.instances.map(({ instanceId }) => instanceId)).toEqual(["dragon-1", "goblin-1", "goblin-2"]);
    expect(workspace.instances.find(({ instanceId }) => instanceId === "goblin-1")).toMatchObject({
      currentHitPoints: 2,
      initiative: 18,
      conditions: ["Frightened"]
    });
    expect(workspace.instances.find(({ instanceId }) => instanceId === "goblin-2")).toMatchObject({
      currentHitPoints: 7,
      initiative: 9,
      conditions: []
    });
  });

  it("refreshes reaction and legendary actions without inventing a recharge success", () => {
    let workspace = createEmptyMonsterEncounterWorkspace("dnd-2014");
    workspace = addMonsterEncounterInstance(workspace, dragon, "dragon-1");
    workspace = setMonsterEncounterReaction(workspace, "dragon-1", false);
    workspace = setMonsterEncounterRecharge(workspace, "dragon-1", false);
    workspace = setMonsterEncounterLegendaryRemaining(workspace, "dragon-1", 0);
    workspace = startMonsterEncounterTurn(workspace, "dragon-1");

    expect(workspace.instances[0]).toMatchObject({
      reactionAvailable: true,
      rechargeReady: false,
      legendaryActionsMaximum: 3,
      legendaryActionsRemaining: 3
    });
  });

  it("normalizes bounds, conditions, universal reaction defaults, and stale definitions", () => {
    const normalized = normalizeMonsterEncounterWorkspace({
      schemaVersion: 3,
      gameSystemId: "dnd-2014",
      name: " Test Encounter ",
      updatedAt: "2026-07-28T00:00:00.000Z",
      instances: [{
        instanceId: "goblin-1",
        monsterId: "goblin",
        label: " Goblin Scout ",
        pinned: false,
        currentHitPoints: 999,
        maximumHitPoints: 7,
        initiative: 999,
        conditions: ["Prone", " prone ", ""],
        reactionAvailable: undefined as never,
        rechargeReady: undefined as never,
        legendaryActionsMaximum: 0,
        legendaryActionsRemaining: 10
      }, {
        instanceId: "stale",
        monsterId: "missing",
        label: "Missing",
        pinned: false,
        currentHitPoints: 1,
        maximumHitPoints: 1,
        initiative: null,
        conditions: [],
        reactionAvailable: false,
        rechargeReady: false,
        legendaryActionsMaximum: 0,
        legendaryActionsRemaining: 0
      }]
    }, "dnd-2014", [goblin]);

    expect(normalized.name).toBe("Test Encounter");
    expect(normalized.instances).toHaveLength(1);
    expect(normalized.instances[0]).toMatchObject({
      label: "Goblin Scout",
      currentHitPoints: 7,
      initiative: 100,
      conditions: ["Prone"],
      reactionAvailable: true,
      rechargeReady: false,
      legendaryActionsRemaining: 0
    });
  });
});

describe("monster encounter persistence", () => {
  it("saves independent state per edition", () => {
    const storage = new MemoryStorage();
    const repository = createMonsterEncounterWorkspaceRepository(storage);
    let workspace = createEmptyMonsterEncounterWorkspace("dnd-2014");
    workspace = addMonsterEncounterInstance(workspace, goblin, "goblin-1");
    workspace = setMonsterEncounterHitPoints(workspace, "goblin-1", 3);
    repository.save(workspace);

    expect(repository.load({
      gameSystemId: "dnd-2014",
      entries: [goblin, dragon],
      createInstanceId: () => "unused"
    }).instances[0]).toMatchObject({ instanceId: "goblin-1", currentHitPoints: 3 });
    expect(repository.load({
      gameSystemId: "dnd-2024",
      entries: [],
      createInstanceId: () => "unused"
    }).instances).toEqual([]);
  });

  it("migrates v2 order and pins into one instance per formerly active definition", () => {
    const storage = new MemoryStorage();
    storage.setItem("dungeon-cards-workspace-v2-monster-dnd-2014", JSON.stringify({
      schemaVersion: 2,
      id: "local-dnd-2014-monster",
      ownerKey: "anonymous-local",
      name: "Monster Encounter",
      role: "monster",
      gameSystemId: "dnd-2014",
      activeCardIds: ["goblin", "dragon"],
      pinnedCardIds: ["dragon"],
      cardOrder: ["dragon", "goblin"],
      updatedAt: "2026-07-28T00:00:00.000Z"
    }));
    const ids = ["migrated-dragon", "migrated-goblin"];
    const migrated = createMonsterEncounterWorkspaceRepository(storage).load({
      gameSystemId: "dnd-2014",
      entries: [goblin, dragon],
      createInstanceId: () => ids.shift() ?? "fallback"
    });

    expect(migrated.instances.map(({ monsterId }) => monsterId)).toEqual(["dragon", "goblin"]);
    expect(migrated.instances[0]?.pinned).toBe(true);
    expect(migrated.instances.map(({ label }) => label)).toEqual(["Ancient Test Dragon 1", "Goblin 1"]);
  });

  it("falls back safely when saved JSON is malformed", () => {
    const storage = new MemoryStorage();
    storage.setItem("dungeon-monster-encounter-v3-dnd-2014", "not-json");
    const loaded = createMonsterEncounterWorkspaceRepository(storage).load({
      gameSystemId: "dnd-2014",
      entries: [goblin],
      createInstanceId: () => "unused"
    });
    expect(loaded.instances).toEqual([]);
    expect(loaded.gameSystemId).toBe("dnd-2014");
  });
});