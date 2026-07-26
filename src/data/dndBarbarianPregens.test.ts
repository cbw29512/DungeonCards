import { describe, expect, it } from "vitest";
import { validateDndCharacterRecord } from "../utils/dndCharacterRecord";
import {
  dndBarbarianPregenRecords,
  getDndBarbarianPregenRecord
} from "./dndBarbarianPregens";
import { dndReadyPregenRecords } from "./dndReadyPregens";

describe("Barbarian Berserker ready-to-play pregens", () => {
  it("publishes a complete level 1–20 ladder for both editions", () => {
    expect(dndBarbarianPregenRecords).toHaveLength(40);
    expect(new Set(dndBarbarianPregenRecords.map((record) => record.id)).size).toBe(40);
    expect(dndBarbarianPregenRecords.every((record) => record.classId === "barbarian")).toBe(true);
    expect(dndBarbarianPregenRecords.every((record) => record.subclassId === "path-berserker")).toBe(true);
    for (const ruleset of ["srd-5.1-2014", "srd-5.2.1-2024"] as const) {
      expect(dndBarbarianPregenRecords
        .filter((record) => record.ruleset === ruleset)
        .map((record) => record.level)
      ).toEqual(Array.from({ length: 20 }, (_, index) => index + 1));
    }
  });

  it("requires every Barbarian record to pass the hard readiness gate", () => {
    const failures = dndBarbarianPregenRecords
      .map((record) => ({ id: record.id, validation: validateDndCharacterRecord(record) }))
      .filter(({ validation }) => !validation.ready);
    expect(failures).toEqual([]);
  });

  it("preserves the 2014 Rage, Berserker, and capstone milestones", () => {
    const level3 = getDndBarbarianPregenRecord("srd-5.1-2014", 3)!;
    const level10 = getDndBarbarianPregenRecord("srd-5.1-2014", 10)!;
    const level14 = getDndBarbarianPregenRecord("srd-5.1-2014", 14)!;
    const level20 = getDndBarbarianPregenRecord("srd-5.1-2014", 20)!;

    expect(level3.subclassFeatures.join(" ")).toContain("Exhaustion");
    expect(level10.subclassFeatures.join(" ")).toContain("immune for 24 hours");
    expect(level14.subclassFeatures.join(" ")).toContain("Retaliation");
    expect(level20.abilityScores.str).toBe(24);
    expect(level20.abilityScores.con).toBe(24);
    expect(level20.resources.find((resource) => resource.id === "rage")).toMatchObject({
      maximum: 0,
      unlimited: true
    });
    expect(level20.armorClass).toBe(19);
  });

  it("preserves the 2024 Frenzy, Primal Knowledge, and resource milestones", () => {
    const level2 = getDndBarbarianPregenRecord("srd-5.2.1-2024", 2)!;
    const level3 = getDndBarbarianPregenRecord("srd-5.2.1-2024", 3)!;
    const level10 = getDndBarbarianPregenRecord("srd-5.2.1-2024", 10)!;
    const level14 = getDndBarbarianPregenRecord("srd-5.2.1-2024", 14)!;
    const level15 = getDndBarbarianPregenRecord("srd-5.2.1-2024", 15)!;
    const level17 = getDndBarbarianPregenRecord("srd-5.2.1-2024", 17)!;
    const level20 = getDndBarbarianPregenRecord("srd-5.2.1-2024", 20)!;

    expect(level2.skillProficiencies).not.toContain("Stealth");
    expect(level3.skillProficiencies).toContain("Stealth");
    expect(level10.skillProficiencies).toContain("Acrobatics");
    expect(level3.attacks[0].notes).toContain("2d6");
    expect(level14.resources.some((resource) => resource.id === "intimidating-presence")).toBe(true);
    expect(level15.resources.some((resource) => resource.id === "persistent-rage-refresh")).toBe(true);
    expect(level17.classFeatures.join(" ")).toContain("2d10");
    expect(level20.abilityScores.str).toBe(24);
    expect(level20.abilityScores.con).toBe(24);
    expect(level20.notes.join(" ")).toContain("Tough adds 2 HP per level");
  });

  it("adds the new ladder without duplicating released catalog slots", () => {
    expect(dndReadyPregenRecords).toHaveLength(80);
    expect(new Set(dndReadyPregenRecords.map((record) => record.id)).size).toBe(80);
    expect(new Set(dndReadyPregenRecords.map((record) => record.buildSlotId)).size).toBe(80);
  });
});
