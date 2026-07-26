import { describe, expect, it } from "vitest";
import type { SrdMonsterRecord } from "../types/srdCompendium";
import { buildMonsterCombatReference } from "./monsterCombatReference";

const monster: SrdMonsterRecord = {
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
  traits: "Heated Body. A creature that touches the drake takes 3 fire damage.",
  actions: "Multiattack. The drake makes two Claw attacks and one Bite attack.\nBite. Melee Weapon Attack: +9 to hit, reach 10 ft., one target. Hit: 15 (2d10 + 4) piercing damage plus 7 (2d6) fire damage.\nFire Breath (Recharge 5–6). Each creature in a 30-foot cone must make a DC 17 DEX saving throw, taking 45 (10d8) fire damage on a failed save.",
  bonusActions: "Wing Shift. The drake moves up to half its flying speed.",
  reactions: "Tail Guard. The drake adds 2 to its AC against one attack.",
  legendaryActions: "Detect. The drake makes a Wisdom (Perception) check.",
  rawText: "STR 23 (+6) DEX 14 (+2) CON 19 (+4) INT 10 (+0) WIS 13 (+1) CHA 15 (+2)\nSaving Throws Dex +6, Con +8, Wis +5\nSkills Perception +9, Stealth +6\nDamage Resistances fire\nCondition Immunities frightened\nSenses blindsight 30 ft., darkvision 120 ft., passive Perception 19\nLanguages Common, Draconic",
  sourcePage: 99,
  sourceReference: "Test SRD p. 99"
};

describe("buildMonsterCombatReference", () => {
  it("extracts abilities, initiative, defenses, and senses", () => {
    const reference = buildMonsterCombatReference(monster);

    expect(reference.abilities).toHaveLength(6);
    expect(reference.initiative).toBe("+2 (DEX 14)");
    expect(reference.savingThrows).toContain("Dex +6");
    expect(reference.resistances).toBe("fire");
    expect(reference.conditionImmunities).toBe("frightened");
    expect(reference.senses).toContain("passive Perception 19");
  });

  it("parses generated SRD blocks with labels followed by six values", () => {
    const reference = buildMonsterCombatReference({
      ...monster,
      rawText: "Armor Class 17 Hit Points 135 Speed 10 ft., swim 40 ft. STR DEX CON INT WIS CHA 21 (+5) 9 (-1) 15 (+2) 18 (+4) 15 (+2) 18 (+4) Saving Throws Con +6"
    });

    expect(reference.abilities).toEqual([
      { name: "STR", score: 21, modifier: 5 },
      { name: "DEX", score: 9, modifier: -1 },
      { name: "CON", score: 15, modifier: 2 },
      { name: "INT", score: 18, modifier: 4 },
      { name: "WIS", score: 15, modifier: 2 },
      { name: "CHA", score: 18, modifier: 4 }
    ]);
    expect(reference.initiative).toBe("-1 (DEX 9)");
  });

  it("prioritizes actionable combat entries and records other action types", () => {
    const reference = buildMonsterCombatReference(monster);

    expect(reference.actions.map((action) => action.name)).toEqual([
      "Multiattack",
      "Bite",
      "Fire Breath (Recharge 5–6)"
    ]);
    expect(reference.actions[1].summary).toContain("+9 to hit");
    expect(reference.actions[2].summary).toContain("DC 17 DEX saving throw");
    expect(reference.hasBonusActions).toBe(true);
    expect(reference.hasReactions).toBe(true);
    expect(reference.hasLegendaryActions).toBe(true);
  });

  it("fails safely when optional source sections are absent", () => {
    const reference = buildMonsterCombatReference({
      ...monster,
      rawText: "No structured ability line is available.",
      actions: "",
      bonusActions: "",
      reactions: "",
      legendaryActions: ""
    });

    expect(reference.abilities).toEqual([]);
    expect(reference.initiative).toBe("See full stat block");
    expect(reference.actions).toEqual([]);
    expect(reference.hasReactions).toBe(false);
  });
});
