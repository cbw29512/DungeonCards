import { describe, expect, it } from "vitest";
import type { DndCharacterRecord } from "../types/dndCharacter";
import type { SrdMonsterRecord } from "../types/srdCompendium";
import {
  averageDiceFormula,
  buildCharacterFightProfile,
  buildSrdMonsterFightProfile,
  parseFightWeaponRange
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
  subclassFeatures: ["Improved Critical"],
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
  rawText: "STR 18 (+4) DEX 11 (+0) CON 16 (+3) INT 6 (-2) WIS 16 (+3) CHA 9 (-1)",
  sourcePage: 1,
  sourceReference: "SRD 5.1"
};

describe("fight profile adapters", () => {
  it("averages supported dice formulas and isolates critical dice", () => {
    expect(averageDiceFormula("2d12 + 4")).toEqual({ average: 17, diceAverage: 13 });
    expect(averageDiceFormula("1d8+3")).toEqual({ average: 7.5, diceAverage: 4.5 });
    expect(averageDiceFormula("damage varies")).toBeNull();
  });

  it("preserves weapon normal/long range instead of collapsing the second band", () => {
    expect(parseFightWeaponRange("5 ft.")).toEqual({ rangeFeet: 5, attackMode: "melee" });
    expect(parseFightWeaponRange("10 ft.")).toEqual({ rangeFeet: 10, attackMode: "melee" });
    expect(parseFightWeaponRange("30/120 ft.")).toEqual({ rangeFeet: 30, longRangeFeet: 120, attackMode: "ranged" });
    expect(parseFightWeaponRange("80 / 320 ft.")).toEqual({ rangeFeet: 80, longRangeFeet: 320, attackMode: "ranged" });
  });

  it("derives Carnar's 2014 Champion actions, saves, Second Wind, and Action Surge", () => {
    const result = buildCharacterFightProfile(fighter());
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.profile).toMatchObject({
      attackBonus: 5,
      attacksPerRound: 1,
      averageDamageOnHit: 7.5,
      averageCriticalBonusDamage: 4.5,
      initiativeBonus: 1,
      attackDamageFormula: "1d8 + 3",
      criticalBonusFormula: "1d8",
      sourceActionName: "Longsword",
      speedFeet: 30,
      savingThrowBonuses: { str: 5, con: 4 }
    });
    expect(result.profile.actions?.find((action) => action.name === "Longsword")).toMatchObject({
      kind: "attack",
      attackMode: "melee",
      rangeFeet: 5,
      criticalAt: 19,
      delivery: "weapon"
    });
    expect(result.profile.actions?.some((action) => action.kind === "heal" && action.name === "Second Wind")).toBe(true);
    expect(result.profile.actions?.some((action) => action.kind === "grant-action" && action.name === "Action Surge")).toBe(true);
    expect(result.profile.resources?.map((resource) => resource.id)).toEqual(expect.arrayContaining(["second-wind", "action-surge"]));
  });

  it("preserves a character ranged weapon's normal and long ranges on its executable action", () => {
    const archer = fighter();
    archer.attacks.push({
      id: "light-crossbow",
      name: "Light Crossbow",
      attackAbility: "dex",
      proficient: true,
      damageFormula: "1d8+1",
      damageType: "piercing",
      rangeOrReach: "80/320 ft."
    });
    const result = buildCharacterFightProfile(archer);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.profile.actions?.find((action) => action.name === "Light Crossbow")).toMatchObject({
      kind: "attack",
      attackMode: "ranged",
      rangeFeet: 80,
      longRangeFeet: 320
    });
  });

  it("uses the fighter Extra Attack progression without changing the character record", () => {
    const character = fighter(20);
    const snapshot = structuredClone(character);
    const result = buildCharacterFightProfile(character);

    expect(result.ok && result.profile.attacksPerRound).toBe(4);
    if (result.ok) {
      expect(result.profile.actions?.find((action) => action.kind === "multiattack")).toMatchObject({
        sequence: [{ count: 4 }]
      });
    }
    expect(character).toEqual(snapshot);
  });

  it("derives Bob from high-confidence SRD attack text and preserves typed attacks", () => {
    const result = buildSrdMonsterFightProfile(bob);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.profile).toMatchObject({
      armorClass: 14,
      hitPoints: 76,
      attackBonus: 6,
      averageDamageOnHit: 17,
      initiativeBonus: 0,
      attackDamageFormula: "2d12 + 4",
      criticalBonusFormula: "2d12",
      sourceActionName: "Greataxe",
      challengeRating: 3,
      speedFeet: 40,
      savingThrowBonuses: { str: 4, dex: 0, con: 3 }
    });
    expect(result.profile.actions?.find((action) => action.name === "Greataxe")).toMatchObject({
      kind: "attack",
      attackMode: "melee",
      rangeFeet: 5,
      damage: [{ damageType: "slashing" }]
    });
  });

  it("preserves an explicit monster ranged attack's normal and long range", () => {
    const result = buildSrdMonsterFightProfile({
      ...bob,
      name: "Archer",
      actions: "Longbow. Ranged Weapon Attack: +6 to hit, range 150/600 ft., one target. Hit: 8 (1d8 + 4) piercing damage."
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.profile.actions?.find((action) => action.name === "Longbow")).toMatchObject({
      kind: "attack",
      attackMode: "ranged",
      rangeFeet: 150,
      longRangeFeet: 600
    });
  });

  it("refuses ambiguous Multiattack rather than inventing component attacks", () => {
    const result = buildSrdMonsterFightProfile({
      ...bob,
      actions: `Multiattack. The minotaur makes two attacks.\n${bob.actions}`
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.issues[0]).toContain("Multiattack");
  });

  it("reconciles a high-confidence Multiattack to its canonical component attack", () => {
    const result = buildSrdMonsterFightProfile({
      ...bob,
      actions: `Multiattack. The minotaur makes two attacks with its greataxe.\n${bob.actions}`
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.profile.attacksPerRound).toBe(2);
    expect(result.profile.actions?.find((action) => action.kind === "multiattack")).toMatchObject({
      sequence: [{ count: 2 }]
    });
  });

  it("models compound typed damage instead of silently dropping the rider", () => {
    const result = buildSrdMonsterFightProfile({
      ...bob,
      name: "Acid Biter",
      actions: "Bite. Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 7 (1d8 + 3) piercing damage plus 4 (1d8) acid damage."
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const bite = result.profile.actions?.find((action) => action.kind === "attack");
    expect(bite).toMatchObject({
      damage: [
        { damageType: "piercing", formula: "1d8 + 3" },
        { damageType: "acid", formula: "1d8" }
      ]
    });
    expect(result.profile.averageDamageOnHit).toBe(12);
  });
});