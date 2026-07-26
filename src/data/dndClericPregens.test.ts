import { describe, expect, it } from "vitest";
import { dndAbilityModifier, dndFixedHitPoints, validateDndCharacterRecord } from "../utils/dndCharacterRecord";
import { getDndFullCasterSlots } from "./dndCasterProgression";
import { dndClericPregenRecords, getDndClericPregenRecord } from "./dndClericPregens";

const preparedCounts2024 = [4, 5, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 17, 18, 18, 19, 20, 21, 22];
const domainCounts2014 = (level: number) => level >= 9 ? 10 : level >= 7 ? 8 : level >= 5 ? 6 : level >= 3 ? 4 : 2;
const domainCounts2024 = (level: number) => level >= 9 ? 10 : level >= 7 ? 8 : level >= 5 ? 6 : level >= 3 ? 4 : 0;

describe("Cleric Life Domain ready-to-play pregens", () => {
  it("publishes a complete level 1–20 ladder for both editions", () => {
    expect(dndClericPregenRecords).toHaveLength(40);
    expect(new Set(dndClericPregenRecords.map((record) => record.id)).size).toBe(40);
    for (const ruleset of ["srd-5.1-2014", "srd-5.2.1-2024"] as const) {
      const records = dndClericPregenRecords.filter((record) => record.ruleset === ruleset);
      expect(records.map((record) => record.level)).toEqual(Array.from({ length: 20 }, (_, index) => index + 1));
      expect(records.every((record) => record.subclassId === "life-domain")).toBe(true);
    }
  });

  it("requires every published Cleric record to pass the hard readiness gate", () => {
    const failures = dndClericPregenRecords
      .map((record) => ({ id: record.id, validation: validateDndCharacterRecord(record) }))
      .filter(({ validation }) => !validation.ready)
      .map(({ id, validation }) => ({ id, issues: validation.issues }));
    expect(failures).toEqual([]);
  });

  it("uses full-caster slots and exact 2014 preparation plus domain counts", () => {
    for (let level = 1; level <= 20; level += 1) {
      const record = getDndClericPregenRecord("srd-5.1-2014", level)!;
      if (record.spellcasting.kind === "none") throw new Error("2014 Cleric must cast spells.");
      const prepared = level + dndAbilityModifier(record.abilityScores.wis);
      expect(record.spellcasting.slotsByLevel).toEqual(getDndFullCasterSlots(level));
      expect(record.spellcasting.spells).toHaveLength(prepared + domainCounts2014(level));
      expect(record.spellcasting.notes).toContain(`Prepared Cleric spells: ${prepared}`);
    }
  });

  it("uses exact 2024 table preparation, domain, origin, and cantrip counts", () => {
    for (let level = 1; level <= 20; level += 1) {
      const record = getDndClericPregenRecord("srd-5.2.1-2024", level)!;
      if (record.spellcasting.kind === "none") throw new Error("2024 Cleric must cast spells.");
      const clericCantrips = level >= 10 ? 5 : level >= 4 ? 4 : 3;
      expect(record.spellcasting.slotsByLevel).toEqual(getDndFullCasterSlots(level));
      expect(record.spellcasting.cantrips).toHaveLength(clericCantrips + 2);
      expect(record.spellcasting.spells).toHaveLength(preparedCounts2024[level - 1] + domainCounts2024(level) + 1);
      expect(record.spellcasting.notes).toContain(`Cleric table Prepared Spells: ${preparedCounts2024[level - 1]}`);
    }
  });

  it("adds Dwarven Toughness separately from fixed Hit Die progression", () => {
    for (const record of dndClericPregenRecords) {
      expect(record.maximumHitPoints).toBe(dndFixedHitPoints(8, record.level, record.abilityScores.con) + record.level);
    }
    expect(getDndClericPregenRecord("srd-5.1-2014", 1)?.maximumHitPoints).toBe(12);
    expect(getDndClericPregenRecord("srd-5.2.1-2024", 1)?.maximumHitPoints).toBe(11);
  });

  it("preserves edition-specific subclass timing and Life features", () => {
    const cleric2014Level1 = getDndClericPregenRecord("srd-5.1-2014", 1)!;
    const cleric2024Level1 = getDndClericPregenRecord("srd-5.2.1-2024", 1)!;
    const cleric2024Level3 = getDndClericPregenRecord("srd-5.2.1-2024", 3)!;
    const cleric2014Level17 = getDndClericPregenRecord("srd-5.1-2014", 17)!;
    const cleric2024Level17 = getDndClericPregenRecord("srd-5.2.1-2024", 17)!;

    expect(cleric2014Level1.subclassUnlockLevel).toBe(1);
    expect(cleric2014Level1.subclassFeatures.join(" ")).toContain("Disciple of Life");
    expect(cleric2024Level1.subclassUnlockLevel).toBe(3);
    expect(cleric2024Level1.subclassFeatures).toEqual([]);
    expect(cleric2024Level3.subclassFeatures.join(" ")).toContain("Preserve Life");
    expect(cleric2014Level17.subclassFeatures.join(" ")).toContain("maximum result");
    expect(cleric2024Level17.subclassFeatures.join(" ")).toContain("maximum result");
  });

  it("tracks Channel Divinity uses and capstones without blending editions", () => {
    expect(getDndClericPregenRecord("srd-5.1-2014", 2)?.resources.find((resource) => resource.id === "channel-divinity")?.maximum).toBe(1);
    expect(getDndClericPregenRecord("srd-5.1-2014", 18)?.resources.find((resource) => resource.id === "channel-divinity")?.maximum).toBe(3);
    expect(getDndClericPregenRecord("srd-5.2.1-2024", 2)?.resources.find((resource) => resource.id === "channel-divinity")?.maximum).toBe(2);
    expect(getDndClericPregenRecord("srd-5.2.1-2024", 18)?.resources.find((resource) => resource.id === "channel-divinity")?.maximum).toBe(4);
    expect(getDndClericPregenRecord("srd-5.1-2014", 20)?.classFeatures.join(" ")).toContain("succeeds automatically");
    expect(getDndClericPregenRecord("srd-5.2.1-2024", 20)?.classFeatures.join(" ")).toContain("Wish");
  });
});
