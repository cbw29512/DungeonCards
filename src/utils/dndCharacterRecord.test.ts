import { describe, expect, it } from "vitest";
import { getDndPregenBuildSlot } from "./dndPregenCatalog";
import {
  createDndCharacterBlueprint,
  dndAbilityModifier,
  dndAttackBonus,
  dndFixedHitPoints,
  dndProficiencyBonus,
  dndSpellAttackBonus,
  dndSpellSaveDc,
  isDndSpellcastingExpected,
  validateDndCharacterRecord
} from "./dndCharacterRecord";

describe("D&D structured character record engine", () => {
  it("calculates ability modifiers and proficiency tiers", () => {
    expect(dndAbilityModifier(1)).toBe(-5);
    expect(dndAbilityModifier(10)).toBe(0);
    expect(dndAbilityModifier(17)).toBe(3);
    expect([1, 4, 5, 8, 9, 12, 13, 16, 17, 20].map(dndProficiencyBonus)).toEqual([2, 2, 3, 3, 4, 4, 5, 5, 6, 6]);
  });

  it("calculates fixed Hit Points with a minimum one-point increase", () => {
    expect(dndFixedHitPoints(10, 1, 14)).toBe(12);
    expect(dndFixedHitPoints(10, 5, 14)).toBe(44);
    expect(dndFixedHitPoints(6, 3, 1)).toBe(3);
  });

  it("calculates attack and spell numbers from shared level math", () => {
    expect(dndAttackBonus(18, 9, true)).toBe(8);
    expect(dndAttackBonus(18, 9, false)).toBe(4);
    expect(dndSpellSaveDc(18, 9)).toBe(16);
    expect(dndSpellAttackBonus(18, 9)).toBe(8);
  });

  it("derives spellcasting expectations by class, edition, and level", () => {
    const bard = getDndPregenBuildSlot("srd-5.1-2014", "bard", "college-lore", 1)!;
    const fighter = getDndPregenBuildSlot("srd-5.2.1-2024", "fighter", "champion", 20)!;
    const paladin2014Level1 = getDndPregenBuildSlot("srd-5.1-2014", "paladin", "oath-devotion", 1)!;
    const paladin2014Level2 = getDndPregenBuildSlot("srd-5.1-2014", "paladin", "oath-devotion", 2)!;
    const paladin2024Level1 = getDndPregenBuildSlot("srd-5.2.1-2024", "paladin", "oath-devotion", 1)!;

    expect(isDndSpellcastingExpected(bard)).toBe(true);
    expect(isDndSpellcastingExpected(fighter)).toBe(false);
    expect(isDndSpellcastingExpected(paladin2014Level1)).toBe(false);
    expect(isDndSpellcastingExpected(paladin2014Level2)).toBe(true);
    expect(isDndSpellcastingExpected(paladin2024Level1)).toBe(true);
  });

  it("creates intentionally incomplete blueprints tied to their subclass-aware slot", () => {
    const slot = getDndPregenBuildSlot("srd-5.1-2014", "cleric", "life-domain", 1)!;
    const blueprint = createDndCharacterBlueprint(slot);
    const validation = validateDndCharacterRecord(blueprint);

    expect(blueprint).toMatchObject({
      buildSlotId: slot.id,
      subclassId: "life-domain",
      subclassUnlockLevel: 1,
      spellcastingExpected: true,
      spellcasting: { kind: "none" },
      printableSummaryReady: false
    });
    expect(validation.ready).toBe(false);
    expect(validation.missingCategories).toContain("spellcasting");
    expect(validation.missingCategories).toContain("print");
  });

  it("uses the edition-specific subclass unlock level", () => {
    const clericSlot = getDndPregenBuildSlot("srd-5.1-2014", "cleric", "life-domain", 1)!;
    const cleric = createDndCharacterBlueprint(clericSlot);
    cleric.name = "Sister Arden";
    cleric.species = "Human";
    cleric.background = "Acolyte";
    cleric.abilityScores = { str: 10, dex: 12, con: 14, int: 10, wis: 16, cha: 13 };
    cleric.maximumHitPoints = 10;
    cleric.armorClass = 18;
    cleric.speedFeet = 30;
    cleric.savingThrowProficiencies = ["wis", "cha"];
    cleric.skillProficiencies = ["Insight", "Religion"];
    cleric.languages = ["Common", "Celestial"];
    cleric.attacks = [{ id: "mace", name: "Mace", attackAbility: "str", proficient: true, damageFormula: "1d6", damageType: "bludgeoning", rangeOrReach: "5 ft." }];
    cleric.classFeatures = ["Spellcasting"];
    cleric.equipment = ["Mace", "Scale mail", "Shield"];
    cleric.spellcasting = { kind: "prepared", ability: "wis", cantrips: ["Sacred Flame"], spells: ["Cure Wounds"], slotsByLevel: { 1: 2 } };
    cleric.printableSummaryReady = true;

    const validation = validateDndCharacterRecord(cleric);
    expect(validation.issues.some((issue) => issue.message.includes("Subclass features"))).toBe(true);
  });

  it("approves a complete non-spellcasting record and rejects identity regressions", () => {
    const slot = getDndPregenBuildSlot("srd-5.2.1-2024", "fighter", "champion", 5)!;
    const record = createDndCharacterBlueprint(slot);
    Object.assign(record, {
      name: "Kara Stoneguard",
      species: "Dwarf",
      background: "Soldier",
      abilityScores: { str: 18, dex: 12, con: 16, int: 10, wis: 13, cha: 8 },
      hitDie: 10,
      maximumHitPoints: dndFixedHitPoints(10, 5, 16),
      armorClass: 18,
      speedFeet: 30,
      savingThrowProficiencies: ["str", "con"],
      skillProficiencies: ["Athletics", "Perception"],
      languages: ["Common", "Dwarvish"],
      toolProficiencies: ["Smith's Tools"],
      attacks: [{ id: "longsword", name: "Longsword", attackAbility: "str", proficient: true, damageFormula: "1d8+4", damageType: "slashing", rangeOrReach: "5 ft." }],
      resources: [{ id: "second-wind", name: "Second Wind", maximum: 2, refresh: "short-rest" }],
      spellcastingExpected: false,
      spellcasting: { kind: "none" },
      classFeatures: ["Fighting Style", "Second Wind", "Action Surge", "Extra Attack"],
      subclassFeatures: ["Improved Critical"],
      advancementChoices: ["Ability Score Improvement: Strength"],
      equipment: ["Chain mail", "Shield", "Longsword", "Light crossbow"],
      currencyGp: 10,
      sources: [{ label: "2024 Free Rules Fighter", url: "https://example.com/fighter", scope: "public-srd" }],
      printableSummaryReady: true
    });

    expect(validateDndCharacterRecord(record)).toMatchObject({ ready: true, issues: [] });

    record.subclassId = "wrong-subclass";
    const invalid = validateDndCharacterRecord(record);
    expect(invalid.ready).toBe(false);
    expect(invalid.issues.some((issue) => issue.message.includes("Build slot"))).toBe(true);
  });
});
