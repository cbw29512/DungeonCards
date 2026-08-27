import { describe, expect, it } from "vitest";
import type { DndCharacterRecord } from "../types/dndCharacter";
import type { SrdMonsterRecord } from "../types/srdCompendium";
import {
  averageDiceFormula,
  buildCharacterFightProfile,
  buildSrdMonsterFightProfile
} from "./fightProfileAdapters";

const fighter = (level = 3): DndCharacterRecord => ({
  id: `carnar-${level}`,
  buildSlotId: `fighter-${level}`,
  ruleset: "srd-5.1-2014",
  name: "Carnar",
  classId: "fighter",
  className: "Fighter",
  subclassId: "champion",
  subclassName: "Champion",
  subclassUnlockLevel: 3,
  level,
  species: "Human",
  background: "Soldier",
  abilityScores: { str: 16, dex: 12, con: 14, int: 10, wis: 11, cha: 13 },
  hitDie: 10,
  maximumHitPoints: 28,
  armorClass: 18,
  speedFeet: 30,
  savingThrowProficiencies: ["str", "con"],
  skillProficiencies: ["Athletics"],
  languages: ["Common"],
  toolProficiencies: [],
  senses: [],
  attacks: [{
    id: "longsword",
    name: "Longsword",
    attackAbility: "str",
    proficient: true,
    damageFormula: "1d8 + 3",
    damageType: "slashing",
    rangeOrReach: "5 ft."
  }],
  resources: [],
  spellcastingExpected: false,
  spellcasting: { kind: "none" },
  classFeatures: ["Second Wind", "Action Surge"],
  subclassFeatures: [],
  advancementChoices: [],
  equipment: ["Longsword", "Shield"],
  currencyGp: 0,
  notes: [],
  sources: [],
  printableSummaryReady: true
});

const bob: SrdMonsterRecord = {
  id: "srd51-minotaur",
  edition: "srd-5.1-2014",
  sourceVersion: "SRD 5.1",
  name: "Bob the Minotaur",
  size: "Large",
  type: "monstrosity",
  alignment: "chaotic evil",
  armorClass: "14 (natural armor)",
  hitPoints: "76 (9d10 + 27)",
  speed: "40 ft.",
  challenge: "3 (700 XP)",
  traits: "Charge. Test.\nReckless. Test.",
  actions: "Greataxe. Melee Weapon Attack: +6 to hit, reach 5 ft., one target. Hit: 17 (2d12 + 4) slashing damage.\nGore. Melee Weapon Attack: +6 to hit, reach 5 ft., one target. Hit: 13 (2d8 + 4) piercing damage.",
  bonusActions: "",
  reactions: "",
  legendaryActions: "",
  rawText: "",
  sourcePage: 1,
  sourceReference: "SRD 5.1"
};

describe("fight profile adapters", () => {
  it("averages supported dice formulas and isolates critical dice", () => {
    expect(averageDiceFormula("2d12 + 4")).toEqual({ average: 17, diceAverage: 13 });
    expect(averageDiceFormula("1d8+3")).toEqual({ average: 7.5, diceAverage: 4.5 });
    expect(averageDiceFormula("damage varies")).toBeNull();
  });

  it("derives Carnar's level 3 fighter profile from the pregen attack record", () => {
    const result = buildCharacterFightProfile(fighter());
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.sourceActionName).toBe("Longsword");
    expect(result.profile.attackBonus).toBe(5);
    expect(result.profile.attacksPerRound).toBe(1);
    expect(result.profile.averageDamageOnHit).toBe(7.5);
    expect(result.profile.averageCriticalBonusDamage).toBe(4.5);
  });

  it("uses the fighter Extra Attack progression without changing the character record", () => {
    const character = fighter(20);
    const snapshot = structuredClone(character);
    const result = buildCharacterFightProfile(character);

    expect(result.ok && result.profile.attacksPerRound).toBe(4);
    expect(character).toEqual(snapshot);
  });

  it("derives Bob from high-confidence SRD attack text and selects Greataxe", () => {
    const result = buildSrdMonsterFightProfile(bob);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.sourceActionName).toBe("Greataxe");
    expect(result.profile.armorClass).toBe(14);
    expect(result.profile.hitPoints).toBe(76);
    expect(result.profile.attackBonus).toBe(6);
    expect(result.profile.averageDamageOnHit).toBe(17);
    expect(result.profile.challengeRating).toBe(3);
  });

  it("refuses ambiguous Multiattack rather than inventing an attacks-per-round value", () => {
    const result = buildSrdMonsterFightProfile({
      ...bob,
      actions: `Multiattack. The minotaur makes two attacks.\n${bob.actions}`
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.issues[0]).toContain("Multiattack");
  });

  it("refuses a compound damage attack until all damage components are modeled", () => {
    const result = buildSrdMonsterFightProfile({
      ...bob,
      name: "Acid Biter",
      actions: "Bite. Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 7 (1d8 + 3) piercing damage plus 4 (1d8) acid damage."
    });
    expect(result.ok).toBe(false);
  });
});
