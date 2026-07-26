import { describe, expect, it } from "vitest";
import { validateDndCharacterRecord } from "../utils/dndCharacterRecord";
import { dndBardPregenRecords, getDndBardPregenRecord } from "./dndBardPregens";
import { getDndFullCasterSlots } from "./dndCasterProgression";

const knownCounts2014 = [4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 15, 16, 18, 19, 19, 20, 22, 22, 22];
const cantripCounts2014 = [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4];
const preparedCounts2024 = [4, 5, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 17, 18, 18, 19, 20, 21, 22];
const cantripCounts2024 = [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4];

describe("Bard College of Lore ready-to-play pregens", () => {
  it("publishes a complete level 1–20 ladder for both editions", () => {
    expect(dndBardPregenRecords).toHaveLength(40);
    expect(new Set(dndBardPregenRecords.map((record) => record.id)).size).toBe(40);
    for (const ruleset of ["srd-5.1-2014", "srd-5.2.1-2024"] as const) {
      const records = dndBardPregenRecords.filter((record) => record.ruleset === ruleset);
      expect(records.map((record) => record.level)).toEqual(Array.from({ length: 20 }, (_, index) => index + 1));
      expect(records.every((record) => record.subclassId === "college-lore")).toBe(true);
    }
  });

  it("requires every published Bard record to pass the hard subclass-aware gate", () => {
    const failures = dndBardPregenRecords
      .map((record) => ({ record, validation: validateDndCharacterRecord(record) }))
      .filter(({ validation }) => !validation.ready)
      .map(({ record, validation }) => ({ id: record.id, issues: validation.issues }));
    expect(failures).toEqual([]);
  });

  it("uses the reusable full-caster slot progression at every level", () => {
    for (const record of dndBardPregenRecords) {
      expect(record.spellcasting.kind).not.toBe("none");
      if (record.spellcasting.kind !== "none") {
        expect(record.spellcasting.slotsByLevel).toEqual(getDndFullCasterSlots(record.level));
      }
    }
    expect(getDndFullCasterSlots(1)).toEqual({ 1: 2 });
    expect(getDndFullCasterSlots(20)).toEqual({ 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2, 7: 2, 8: 1, 9: 1 });
  });

  it("preserves 2014 Spells Known and Additional Magical Secrets counts", () => {
    for (let level = 1; level <= 20; level += 1) {
      const record = getDndBardPregenRecord("srd-5.1-2014", level)!;
      if (record.spellcasting.kind === "none") throw new Error("2014 Bard must cast spells.");
      const loreExtras = level >= 6 ? 2 : 0;
      expect(record.spellcasting.kind).toBe("known");
      expect(record.spellcasting.cantrips).toHaveLength(cantripCounts2014[level - 1]);
      expect(record.spellcasting.spells).toHaveLength(knownCounts2014[level - 1] + loreExtras);
      expect(record.spellcasting.notes).toContain(`Bard table Spells Known: ${knownCounts2014[level - 1]}`);
    }
    expect(getDndBardPregenRecord("srd-5.1-2014", 6)?.subclassFeatures.join(" ")).toContain("do not count");
    expect(getDndBardPregenRecord("srd-5.1-2014", 20)?.classFeatures.join(" ")).toContain("Superior Inspiration");
  });

  it("preserves 2024 prepared counts and always-prepared bonus spells", () => {
    for (let level = 1; level <= 20; level += 1) {
      const record = getDndBardPregenRecord("srd-5.2.1-2024", level)!;
      if (record.spellcasting.kind === "none") throw new Error("2024 Bard must cast spells.");
      const bonusSpells = 1 + (level >= 6 ? 2 : 0) + (level >= 20 ? 2 : 0);
      expect(record.spellcasting.kind).toBe("prepared");
      expect(record.spellcasting.cantrips).toHaveLength(cantripCounts2024[level - 1] + 2);
      expect(record.spellcasting.spells).toHaveLength(preparedCounts2024[level - 1] + bonusSpells);
      expect(record.spellcasting.notes).toContain(`Bard table Prepared Spells: ${preparedCounts2024[level - 1]}`);
    }
    expect(getDndBardPregenRecord("srd-5.2.1-2024", 6)?.subclassFeatures.join(" ")).toContain("Magical Discoveries");
    expect(getDndBardPregenRecord("srd-5.2.1-2024", 20)?.spellcasting.kind).toBe("prepared");
    expect(getDndBardPregenRecord("srd-5.2.1-2024", 20)?.classFeatures.join(" ")).toContain("Words of Creation");
  });

  it("keeps Bardic Inspiration dice, uses, and refresh rules synchronized", () => {
    const bard2014Level1 = getDndBardPregenRecord("srd-5.1-2014", 1)!;
    const bard2014Level5 = getDndBardPregenRecord("srd-5.1-2014", 5)!;
    const bard2024Level15 = getDndBardPregenRecord("srd-5.2.1-2024", 15)!;

    expect(bard2014Level1.resources.find((resource) => resource.id === "bardic-inspiration")).toMatchObject({ name: "Bardic Inspiration d6", maximum: 3, refresh: "long-rest" });
    expect(bard2014Level5.resources.find((resource) => resource.id === "bardic-inspiration")).toMatchObject({ name: "Bardic Inspiration d8", maximum: 4, refresh: "short-rest" });
    expect(bard2024Level15.resources.find((resource) => resource.id === "bardic-inspiration")).toMatchObject({ name: "Bardic Inspiration d12", maximum: 5, refresh: "short-rest" });
  });

  it("keeps the two Lore progressions and origins edition-separated", () => {
    const bard2014 = getDndBardPregenRecord("srd-5.1-2014", 14)!;
    const bard2024 = getDndBardPregenRecord("srd-5.2.1-2024", 14)!;

    expect(bard2014.background).toBe("Entertainer");
    expect(bard2014.species).toBe("Human");
    expect(bard2014.classFeatures.join(" ")).toContain("Teleport and Heal");
    expect(bard2014.subclassFeatures.join(" ")).toContain("when making an ability check");

    expect(bard2024.background).toBe("Acolyte");
    expect(bard2024.advancementChoices.join(" ")).toContain("Magic Initiate (Cleric)");
    expect(bard2024.subclassFeatures.join(" ")).toContain("retain the use if the roll still fails");
    expect(bard2024.resources.some((resource) => resource.id === "magic-initiate-bless")).toBe(true);
  });
});
