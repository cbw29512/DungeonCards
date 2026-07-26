import { describe, expect, it } from "vitest";
import type { EncounterMonsterEntry } from "../types/encounterMonsters";
import {
  buildDndMonsterLiveReference,
  parseDndRechargeMinimum,
  resolveDndMonsterRecharge,
  spendDndMonsterLiveAction
} from "./dndMonsterLiveReference";

const referenceEntry: EncounterMonsterEntry = {
  id: "srd-test-drake",
  name: "Ash Drake",
  ruleset: "srd-5.1-2014",
  cr: "10",
  type: "dragon",
  size: "Large",
  source: "Test SRD p. 99",
  kind: "reference",
  monster: {
    id: "test-drake",
    edition: "srd-5.1-2014",
    sourceVersion: "test",
    name: "Ash Drake",
    size: "Large",
    type: "dragon",
    alignment: "chaotic evil",
    armorClass: "17 (natural armor)",
    hitPoints: "152 (16d10 + 64)",
    speed: "40 ft., fly 80 ft.",
    challenge: "10",
    traits: "",
    actions: "Multiattack. The drake makes two Claw attacks and one Bite attack.\nBite. Melee Weapon Attack: +9 to hit, reach 10 ft., one target. Hit: 15 piercing damage.\nFire Breath (Recharge 5–6). Each creature in a 30-foot cone must make a DC 17 DEX saving throw.",
    bonusActions: "Wing Shift. The drake moves up to half its flying speed.",
    reactions: "Tail Guard. The drake adds 2 to its AC against one attack.",
    legendaryActions: "Detect. The drake makes a Wisdom (Perception) check.",
    rawText: "STR 23 (+6) DEX 14 (+2) CON 19 (+4) INT 10 (+0) WIS 13 (+1) CHA 15 (+2)\nSaving Throws Dex +6, Con +8, Wis +5\nSenses blindsight 30 ft., passive Perception 19",
    sourcePage: 99,
    sourceReference: "Test SRD p. 99"
  }
};

const formattedEntry: EncounterMonsterEntry = {
  id: "formatted-scout",
  name: "Cave Scout",
  ruleset: "srd-5.2.1-2024",
  cr: "1",
  type: "humanoid",
  size: "Medium",
  source: "Test Free Rules",
  kind: "formatted",
  monster: {
    id: "formatted-scout",
    ruleset: "srd-5.2.1-2024",
    source: "Test Free Rules",
    name: "Cave Scout",
    cr: "1",
    type: "humanoid",
    size: "Medium",
    layoutHint: "standard",
    ac: "15",
    hp: "22",
    speed: "30 ft.",
    abilities: { str: 10, dex: 16, con: 12, int: 10, wis: 14, cha: 8 },
    saves: ["Dex +5", "Wis +4"],
    skills: [],
    senses: "darkvision 60 ft.",
    languages: "Common",
    resistances: [],
    immunities: [],
    conditionImmunities: [],
    traits: [],
    actions: [{ name: "Shortbow", hit: "+5 to hit", reach: "range 80/320 ft.", damage: "6 piercing" }],
    bonusActions: [],
    reactions: [],
    legendaryActions: [],
    spellcasting: null,
    lairActions: [],
    regionalEffects: []
  }
};

describe("D&D live monster references", () => {
  it("imports AC, saves, senses, all action sections, and reach", () => {
    const reference = buildDndMonsterLiveReference(referenceEntry);
    expect(reference).toMatchObject({
      armorClass: "17 (natural armor)",
      savingThrows: "Dex +6, Con +8, Wis +5",
      senses: "blindsight 30 ft., passive Perception 19"
    });
    expect(reference.actions.map((action) => action.kind)).toEqual([
      "action", "action", "action", "bonusAction", "reaction", "legendaryAction"
    ]);
    expect(reference.actions.find((action) => action.name === "Bite")?.reachOrRange).toContain("reach 10 ft.");
  });

  it("imports structured formatted monster actions", () => {
    const reference = buildDndMonsterLiveReference(formattedEntry);
    expect(reference.armorClass).toBe("15");
    expect(reference.savingThrows).toBe("Dex +5, Wis +4");
    expect(reference.actions[0]).toMatchObject({
      name: "Shortbow",
      kind: "action",
      reachOrRange: "range 80/320 ft."
    });
  });

  it("parses common recharge labels", () => {
    expect(parseDndRechargeMinimum("Recharge 5–6")).toBe(5);
    expect(parseDndRechargeMinimum("Recharge 6")).toBe(6);
    expect(parseDndRechargeMinimum("Recharge 4-6")).toBe(4);
    expect(parseDndRechargeMinimum(undefined)).toBeUndefined();
  });

  it("spends and resolves recharge without changing other actions", () => {
    const reference = buildDndMonsterLiveReference(referenceEntry);
    const breath = reference.actions.find((action) => action.name.startsWith("Fire Breath"));
    expect(breath).toBeTruthy();

    const spent = spendDndMonsterLiveAction(reference, breath!.id);
    expect(spent.actions.find((action) => action.id === breath!.id)?.rechargeReady).toBe(false);
    expect(spent.actions.find((action) => action.name === "Bite")?.rechargeReady).toBe(true);

    const failed = resolveDndMonsterRecharge(spent, breath!.id, 4);
    expect(failed.succeeded).toBe(false);
    expect(failed.reference.actions.find((action) => action.id === breath!.id)?.rechargeReady).toBe(false);

    const succeeded = resolveDndMonsterRecharge(failed.reference, breath!.id, 5);
    expect(succeeded.succeeded).toBe(true);
    expect(succeeded.reference.actions.find((action) => action.id === breath!.id)?.rechargeReady).toBe(true);
  });
});