import { describe, expect, it } from "vitest";
import { dndAttackBonus, dndProficiencyBonus, validateDndCharacterRecord } from "../utils/dndCharacterRecord";
import { dndFighterPregenRecords, getDndReadyPregenRecord } from "./dndFighterPregens";

describe("Fighter Champion ready-to-play pregens", () => {
  it("publishes a complete level 1–20 ladder for both editions", () => {
    expect(dndFighterPregenRecords).toHaveLength(40);
    expect(new Set(dndFighterPregenRecords.map((record) => record.id)).size).toBe(40);
    for (const ruleset of ["srd-5.1-2014", "srd-5.2.1-2024"] as const) {
      const records = dndFighterPregenRecords.filter((record) => record.ruleset === ruleset);
      expect(records.map((record) => record.level)).toEqual(Array.from({ length: 20 }, (_, index) => index + 1));
    }
  });

  it("requires every published Fighter record to pass the hard readiness gate", () => {
    const failures = dndFighterPregenRecords
      .map((record) => ({ record, validation: validateDndCharacterRecord(record) }))
      .filter(({ validation }) => !validation.ready)
      .map(({ record, validation }) => ({ id: record.id, issues: validation.issues }));
    expect(failures).toEqual([]);
  });

  it("preserves the 2014 Fighter and Champion milestones", () => {
    const level1 = getDndReadyPregenRecord("srd-5.1-2014", "fighter", 1)!;
    const level3 = getDndReadyPregenRecord("srd-5.1-2014", "fighter", 3)!;
    const level10 = getDndReadyPregenRecord("srd-5.1-2014", "fighter", 10)!;
    const level17 = getDndReadyPregenRecord("srd-5.1-2014", "fighter", 17)!;
    const level20 = getDndReadyPregenRecord("srd-5.1-2014", "fighter", 20)!;

    expect(level1.armorClass).toBe(19);
    expect(level1.resources.find((resource) => resource.id === "second-wind")?.maximum).toBe(1);
    expect(level3.subclassFeatures.join(" ")).toContain("19–20");
    expect(level10.attacks.find((attack) => attack.id === "longsword")?.damageFormula).toBe("1d8+7");
    expect(level17.resources.find((resource) => resource.id === "action-surge")?.maximum).toBe(2);
    expect(level17.resources.find((resource) => resource.id === "indomitable")?.maximum).toBe(3);
    expect(level20.classFeatures.join(" ")).toContain("four attacks");
  });

  it("preserves the 2024 tactical, mastery, and Champion milestones", () => {
    const level1 = getDndReadyPregenRecord("srd-5.2.1-2024", "fighter", 1)!;
    const level3 = getDndReadyPregenRecord("srd-5.2.1-2024", "fighter", 3)!;
    const level7 = getDndReadyPregenRecord("srd-5.2.1-2024", "fighter", 7)!;
    const level9 = getDndReadyPregenRecord("srd-5.2.1-2024", "fighter", 9)!;
    const level19 = getDndReadyPregenRecord("srd-5.2.1-2024", "fighter", 19)!;
    const level20 = getDndReadyPregenRecord("srd-5.2.1-2024", "fighter", 20)!;

    expect(level1.resources.find((resource) => resource.id === "second-wind")?.maximum).toBe(2);
    expect(level1.classFeatures.join(" ")).toContain("Weapon Mastery choices available: 3");
    expect(level3.subclassFeatures).toHaveLength(2);
    expect(level7.subclassFeatures.join(" ")).toContain("Great Weapon Fighting");
    expect(level9.classFeatures.join(" ")).toContain("Tactical Master");
    expect(level19.resources.some((resource) => resource.id === "combat-prowess")).toBe(true);
    expect(level20.classFeatures.join(" ")).toContain("four attacks");
    expect(level20.classFeatures.join(" ")).toContain("Weapon Mastery choices available: 6");
  });

  it("keeps derived attack bonuses synchronized with progression math", () => {
    for (const record of dndFighterPregenRecords) {
      const greatswordOrLongsword = record.attacks[0];
      const expected = dndAttackBonus(record.abilityScores.str, record.level, true);
      expect(expected).toBe(dndProficiencyBonus(record.level) + Math.floor((record.abilityScores.str - 10) / 2));
      expect(greatswordOrLongsword.attackAbility).toBe("str");
    }
  });
});
