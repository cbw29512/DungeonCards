import { describe, expect, it } from "vitest";
import { validateDndCharacterRecord } from "../utils/dndCharacterRecord";
import { dndBarbarianPregenRecords, getDndBarbarianPregenRecord } from "./dndBarbarianPregens";
import { countDndReadyPregens, dndReadyPregenRecords, getDndReadyPregenRecord } from "./dndReadyPregens";

describe("Barbarian Berserker ready-to-play pregens", () => {
  it("publishes a complete level 1–20 ladder for both editions", () => {
    expect(dndBarbarianPregenRecords).toHaveLength(40);
    expect(new Set(dndBarbarianPregenRecords.map((record) => record.id)).size).toBe(40);
    for (const ruleset of ["srd-5.1-2014", "srd-5.2.1-2024"] as const) {
      const records = dndBarbarianPregenRecords.filter((record) => record.ruleset === ruleset);
      expect(records.map((record) => record.level)).toEqual(Array.from({ length: 20 }, (_, index) => index + 1));
      expect(records.every((record) => record.subclassId === "path-berserker")).toBe(true);
    }
  });

  it("requires every published Barbarian record to pass the hard subclass-aware gate", () => {
    const failures = dndBarbarianPregenRecords
      .map((record) => ({ record, validation: validateDndCharacterRecord(record) }))
      .filter(({ validation }) => !validation.ready)
      .map(({ record, validation }) => ({ id: record.id, issues: validation.issues }));
    expect(failures).toEqual([]);
  });

  it("preserves 2014 Rage, Berserker, Brutal Critical, and level-20 behavior", () => {
    const level3 = getDndBarbarianPregenRecord("srd-5.1-2014", 3)!;
    const level10 = getDndBarbarianPregenRecord("srd-5.1-2014", 10)!;
    const level14 = getDndBarbarianPregenRecord("srd-5.1-2014", 14)!;
    const level17 = getDndBarbarianPregenRecord("srd-5.1-2014", 17)!;
    const level20 = getDndBarbarianPregenRecord("srd-5.1-2014", 20)!;

    expect(level3.subclassFeatures.join(" ")).toContain("Exhaustion");
    expect(level10.subclassFeatures.join(" ")).toContain("Charisma modifier");
    expect(level14.subclassFeatures.join(" ")).toContain("Retaliation");
    expect(level17.classFeatures.join(" ")).toContain("three additional weapon damage dice");
    expect(level20.resources.find((resource) => resource.id === "rage")).toMatchObject({ maximum: "unlimited", refresh: "none" });
    expect(level20.abilityScores).toMatchObject({ str: 24, con: 24 });
    expect(level20.armorClass).toBe(19);
  });

  it("preserves 2024 mastery, Brutal Strike, Berserker, and Epic Boon behavior", () => {
    const level3 = getDndBarbarianPregenRecord("srd-5.2.1-2024", 3)!;
    const level9 = getDndBarbarianPregenRecord("srd-5.2.1-2024", 9)!;
    const level10 = getDndBarbarianPregenRecord("srd-5.2.1-2024", 10)!;
    const level14 = getDndBarbarianPregenRecord("srd-5.2.1-2024", 14)!;
    const level17 = getDndBarbarianPregenRecord("srd-5.2.1-2024", 17)!;
    const level19 = getDndBarbarianPregenRecord("srd-5.2.1-2024", 19)!;
    const level20 = getDndBarbarianPregenRecord("srd-5.2.1-2024", 20)!;

    expect(level3.subclassFeatures.join(" ")).toContain("2d6");
    expect(level9.classFeatures.join(" ")).toContain("Brutal Strike");
    expect(level10.classFeatures.join(" ")).toContain("Weapon Mastery: 4");
    expect(level10.subclassFeatures.join(" ")).toContain("Retaliation");
    expect(level14.resources.some((resource) => resource.id === "intimidating-presence")).toBe(true);
    expect(level17.classFeatures.join(" ")).toContain("2d10");
    expect(level19.advancementChoices.join(" ")).toContain("ignore B/P/S Resistance");
    expect(level20.abilityScores).toMatchObject({ str: 25, con: 22 });
  });

  it("centralizes all released subclass paths without duplicate build slots", () => {
    expect(dndReadyPregenRecords).toHaveLength(80);
    expect(countDndReadyPregens("srd-5.1-2014")).toBe(40);
    expect(countDndReadyPregens("srd-5.2.1-2024")).toBe(40);
    expect(new Set(dndReadyPregenRecords.map((record) => record.buildSlotId)).size).toBe(80);
    expect(getDndReadyPregenRecord("srd-5.2.1-2024", "barbarian", "path-berserker", 20)?.name).toBe("Torra Ashfang");
    expect(getDndReadyPregenRecord("srd-5.1-2014", "fighter", "champion", 20)?.name).toBe("Kara Stoneguard");
  });
});
