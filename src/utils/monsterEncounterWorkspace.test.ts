import { describe, expect, it } from "vitest";
import type { EncounterMonsterEntry } from "../types/encounterMonsters";
import type { SrdMonsterRecord } from "../types/srdCompendium";
import {
  addMonsterEncounterCondition,
  addMonsterEncounterInstance,
  removeMonsterEncounterCondition,
  setMonsterEncounterHitPoints,
  setMonsterEncounterInitiative,
  setMonsterEncounterLegendaryRemaining,
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

const monsterRecord = (
  id: string,
  name: string,
  overrides: Partial<SrdMonsterRecord> = {}
): SrdMonsterRecord => ({
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
  ...overrides
});

const entry = (
  id: string,
  name: string,
  overrides: Partial<SrdMonsterRecord> = {}
): EncounterMonsterEntry => ({
  id,
  kind: "reference",
  name,
  ruleset: "srd-5.1-2014",
  cr: overrides.challenge ?? "1/4",
  type: overrides.type ?? "Humanoid",
  size: overrides.size ?? "Small",
  source: "SRD 5.1",
  monster: monsterRecord(id, name, overrides)
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
  it("adds repeated monster definitions as independent named combatants", () => {
    let workspace = createEmptyMonsterEncounterWorkspace("dnd-2014");
    workspace = addMonsterEncounterInstance(workspace, goblin, "goblin-1");
    workspace = addMonsterEncounterInstance(workspace, goblin, "goblin-2");
    workspace = addMonsterEncounterInstance(workspace, goblin, "goblin-3");

    expect(workspace.instances.map((instance) => instance.instanceId)).toEqual(["goblin-1", "goblin-2", "goblin-3"]);
    expect(workspace.instances.map((instance) => instance.label)).toEqual(["Goblin 1", "Goblin 2", "Goblin 3"]);
    expect(workspace.instances.every((instance) => instance.maximumHitPoints === 7)).toBe(true);
  });

  it("keeps HP, initiative, and conditions independent for each copy", () => {
    let workspace = createEmptyMonsterEncounterWorkspace("dnd-2014");
    workspace = addMonsterEncounterInstance(workspace, goblin, "goblin-1");
    workspace = addMonsterEncounterInstance(workspace, goblin, "goblin-2");
    workspace = setMonsterEncounterHitPoints(workspace, "goblin-1", 2);
    workspace = setMonsterEncounterInitiative(workspace, "goblin-1", 18);
    workspace = setMonsterEncounterInitiative(workspace, "goblin-2", 9);
    workspace = addMonsterEncounterCondition(workspace, "goblin-1", "Frightened");
    workspace = addMonsterEncounterCondition(workspace, "goblin-1", " frightened ");

    expect(workspace.instances[0]).toMatchObject({ currentHitPoints: 2, initiative: 18, conditions: ["Frightened"] });
    expect(workspace.instances[1]).toMatchObject({ currentHitPoints: 7, initiative: 9, conditions: [] });

    workspace = removeMonsterEncounterCondition(workspace, "goblin-1", "Frightened");
    expect(workspace.instances[0]?.conditions).toEqual([]);
  });

  it("refreshes reaction and legendary actions at turn start without inventing a recharge success", () => {
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

  it("sorts known initiative high-to-low and leaves unrolled combatants last", () => {
    let workspace = createEmptyMonsterEncounterWorkspace("dnd-2014");
    workspace = addMonsterEncounterInstance(workspace, goblin, "goblin-1");
    workspace = addMonsterEncounterInstance(workspace, goblin, "goblin-2");
    workspace = addMonsterEncounterInstance(workspace, dragon, "dragon-1");
    workspace = setMonsterEncounterInitiative(workspace, "goblin-1", 8);
    workspace = setMonsterEncounterInitiative(workspace, "dragon-1", 19);
    workspace = sortMonsterEncounterByInitiative(workspace);

    expect(workspace.instances.map((instance) => instance.instanceId)).toEqual(["dragon-1", "goblin-1", "goblin-2"]);
  });

  it("normalizes bounds, duplicate conditions, missing capabilities, and stale definitions", () => {
    const normalized = normalizeMonsterEncounterWorkspace({
      schemaVersion: 3,
      gameSystemId: "dnd-2014",
      name: " Test Encounter ",
      updatedAt: "2026-07-28T00:00:00.000Z",
      instances: [
        {
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
        },
        {
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
        }
      ]
    }, "dnd-2014", [goblin]);

    expect(normalized.name).toBe("Test Encounter");
    expect(normalized.instances).toHaveLength(1);
    expect(normalized.instances[0]).toMatchObject({
      label: "Goblin Scout",
      currentHitPoints: 7,
      initiative: 100,
      conditions: ["Prone"],
      reactionAvailable: false,
      rechargeReady: false,
      legendaryActionsRemaining: 0
    });
  });
});

describe("monster encounter persistence", () => {
  it("saves and reloads independent state inside the selected edition", () => {
    const storage = new MemoryStorage();
    const repository = createMonsterEncounterWorkspaceRepository(storage);
    let workspace = createEmptyMonsterEncounterWorkspace("dnd-2014");
    workspace = addMonsterEncounterInstance(workspace, goblin, "goblin-1");
    workspace = setMonsterEncounterHitPoints(workspace, "goblin-1", 3);
    repository.save(workspace);

    const loaded = repository.load({
      gameSystemId: "dnd-2014",
      entries: [goblin, dragon],
      createInstanceId: () => "unused"
    });
    expect(loaded.instances[0]).toMatchObject({ instanceId: "goblin-1", currentHitPoints: 3 });

    const otherEdition = repository.load({
      gameSystemId: "dnd-2024",
      entries: [],
      createInstanceId: () => "unused"
    });
    expect(otherEdition.instances).toEqual([]);
  });

  it("migrates the existing v2 unique-card encounter without losing order or pins", () => {
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
    const repository = createMonsterEncounterWorkspaceRepository(storage);
    const migrated = repository.load({
      gameSystemId: "dnd-2014",
      entries: [goblin, dragon],
      createInstanceId: () => ids.shift() ?? "fallback"
    });

    expect(migrated.schemaVersion).toBe(3);
    expect(migrated.instances.map((instance) => instance.monsterId)).toEqual(["dragon", "goblin"]);
    expect(migrated.instances[0]?.pinned).toBe(true);
    expect(migrated.instances.map((instance) => instance.label)).toEqual(["Ancient Test Dragon 1", "Goblin 1"]);
  });

  it("falls back to an empty exact-edition encounter when saved JSON is malformed", () => {
    const storage = new MemoryStorage();
    storage.setItem("dungeon-monster-encounter-v3-dnd-2014", "not-json");
    const repository = createMonsterEncounterWorkspaceRepository(storage);
    const loaded = repository.load({
      gameSystemId: "dnd-2014",
      entries: [goblin],
      createInstanceId: () => "unused"
    });
    expect(loaded.instances).toEqual([]);
    expect(loaded.gameSystemId).toBe("dnd-2014");
  });
});