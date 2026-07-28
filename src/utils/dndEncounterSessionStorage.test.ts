import { describe, expect, it } from "vitest";
import { createDndCombatant } from "./dndEncounter";
import {
  createDndEncounterSessionRepository,
  createEmptyDndEncounterSession,
  normalizeDndEncounterSession
} from "./dndEncounterSessionStorage";

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>();
  get length() { return this.values.size; }
  clear() { this.values.clear(); }
  getItem(key: string) { return this.values.get(key) ?? null; }
  key(index: number) { return [...this.values.keys()][index] ?? null; }
  removeItem(key: string) { this.values.delete(key); }
  setItem(key: string, value: string) { this.values.set(key, value); }
}

const combatant = createDndCombatant({
  id: "dragon-1",
  name: "Ancient Test Dragon",
  side: "enemy",
  initiative: 22,
  dexterityModifier: 2,
  speedFeet: 40,
  surprised: false,
  ruleset: "srd-5.1-2014",
  maximumHitPoints: 350,
  currentHitPoints: 211
});

const completeSnapshot = {
  schemaVersion: 1 as const,
  ruleset: "srd-5.1-2014" as const,
  encounter: {
    ruleset: "srd-5.1-2014" as const,
    round: 4,
    currentIndex: 0,
    started: true,
    combatants: [{
      ...combatant,
      movementRemainingFeet: 15,
      actionAvailable: false,
      bonusActionAvailable: true,
      reactionAvailable: false,
      concentration: { effectName: "Wall of Fire" },
      effects: [{
        id: "effect-burning",
        name: "Burning Ground",
        remainingRounds: 3,
        tickTiming: "end" as const,
        saveAbility: "DEX",
        saveDc: 18,
        notes: "Repeat save at end of turn.",
        breaksConcentration: false
      }],
      health: {
        ...combatant.health,
        currentHitPoints: 211,
        temporaryHitPoints: 12
      }
    }]
  },
  monsterReferences: {
    "dragon-1": {
      monsterId: "ancient-test-dragon",
      sourceReference: "SRD test source",
      size: "Gargantuan" as const,
      armorClass: "22",
      savingThrows: "Dex +9, Con +16",
      senses: "blindsight 60 ft.",
      actions: [{
        id: "action-0-fire-breath",
        kind: "action" as const,
        name: "Fire Breath (Recharge 5–6)",
        summary: "Creatures in the area make a Dexterity saving throw.",
        rechargeLabel: "Recharge 5–6",
        rechargeMinimum: 5,
        rechargeReady: false
      }]
    }
  },
  positions: {
    "dragon-1": { x: 8, y: -3, size: "Gargantuan" as const }
  },
  updatedAt: "2026-07-28T18:00:00.000Z"
};

describe("D&D encounter session storage", () => {
  it("round-trips complete live encounter state", () => {
    const storage = new MemoryStorage();
    const repository = createDndEncounterSessionRepository(storage);
    repository.save(completeSnapshot);

    const loaded = repository.load("srd-5.1-2014");
    expect(loaded.encounter).toMatchObject({ round: 4, currentIndex: 0, started: true });
    expect(loaded.encounter.combatants[0]).toMatchObject({
      id: "dragon-1",
      movementRemainingFeet: 15,
      actionAvailable: false,
      bonusActionAvailable: true,
      reactionAvailable: false,
      concentration: { effectName: "Wall of Fire" },
      health: { currentHitPoints: 211, maximumHitPoints: 350, temporaryHitPoints: 12 }
    });
    expect(loaded.encounter.combatants[0]?.effects[0]).toMatchObject({
      name: "Burning Ground",
      remainingRounds: 3,
      saveDc: 18
    });
    expect(loaded.monsterReferences["dragon-1"]?.actions[0]).toMatchObject({
      rechargeMinimum: 5,
      rechargeReady: false
    });
    expect(loaded.positions["dragon-1"]).toEqual({ x: 8, y: -3, size: "Gargantuan" });
  });

  it("keeps 2014 and 2024 session saves isolated", () => {
    const storage = new MemoryStorage();
    const repository = createDndEncounterSessionRepository(storage);
    repository.save(completeSnapshot);

    expect(repository.load("srd-5.2.1-2024")).toEqual(expect.objectContaining({
      ruleset: "srd-5.2.1-2024",
      encounter: expect.objectContaining({ combatants: [], started: false })
    }));
    expect(repository.load("srd-5.1-2014").encounter.combatants).toHaveLength(1);
  });

  it("drops crossed references and positions that do not belong to a surviving combatant", () => {
    const normalized = normalizeDndEncounterSession({
      ...completeSnapshot,
      monsterReferences: {
        ...completeSnapshot.monsterReferences,
        stale: completeSnapshot.monsterReferences["dragon-1"]
      },
      positions: {
        ...completeSnapshot.positions,
        stale: { x: 999999, y: -999999, size: "Colossal" }
      }
    }, "srd-5.1-2014");

    expect(Object.keys(normalized.monsterReferences)).toEqual(["dragon-1"]);
    expect(Object.keys(normalized.positions)).toEqual(["dragon-1"]);
  });

  it("falls back safely for malformed JSON, wrong schema, and crossed editions", () => {
    const storage = new MemoryStorage();
    storage.setItem("dm-forge-dnd-encounter-session-v1-srd-5.1-2014", "not-json");
    const repository = createDndEncounterSessionRepository(storage);
    expect(repository.load("srd-5.1-2014").encounter.combatants).toEqual([]);

    expect(normalizeDndEncounterSession({ schemaVersion: 99 }, "srd-5.1-2014")).toEqual(
      expect.objectContaining({ ruleset: "srd-5.1-2014", encounter: expect.objectContaining({ combatants: [] }) })
    );
    expect(normalizeDndEncounterSession(completeSnapshot, "srd-5.2.1-2024")).toEqual(
      expect.objectContaining({ ruleset: "srd-5.2.1-2024", encounter: expect.objectContaining({ combatants: [] }) })
    );
  });

  it("clears a saved edition without changing the other edition", () => {
    const storage = new MemoryStorage();
    const repository = createDndEncounterSessionRepository(storage);
    repository.save(completeSnapshot);
    repository.save(createEmptyDndEncounterSession("srd-5.2.1-2024"));
    repository.clear("srd-5.1-2014");

    expect(repository.load("srd-5.1-2014").encounter.combatants).toEqual([]);
    expect(repository.load("srd-5.2.1-2024").ruleset).toBe("srd-5.2.1-2024");
  });
});