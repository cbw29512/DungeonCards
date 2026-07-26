import { describe, expect, it } from "vitest";
import { dndPregenClassDefinitions } from "../data/dndPregenCatalog";
import {
  dndPregenBuildSlots,
  filterDndPregenBuildSlots,
  getDndPregenBuildSlot,
  summarizeDndPregenBuilds
} from "./dndPregenCatalog";

describe("D&D pregen catalog foundation", () => {
  it("defines all twelve public SRD class paths in both editions", () => {
    expect(dndPregenClassDefinitions).toHaveLength(24);
    for (const ruleset of ["srd-5.1-2014", "srd-5.2.1-2024"] as const) {
      const definitions = dndPregenClassDefinitions.filter((definition) => definition.ruleset === ruleset);
      expect(definitions).toHaveLength(12);
      expect(new Set(definitions.map((definition) => definition.classId)).size).toBe(12);
      expect(definitions.every((definition) => definition.licenseScope === "public-srd")).toBe(true);
    }
  });

  it("creates one build slot for every class and level in each edition", () => {
    expect(dndPregenBuildSlots).toHaveLength(480);
    expect(new Set(dndPregenBuildSlots.map((slot) => slot.id)).size).toBe(480);
    expect(summarizeDndPregenBuilds("srd-5.1-2014")).toEqual({
      classes: 12,
      levels: 20,
      total: 240,
      readyToPlay: 0,
      blueprints: 240
    });
    expect(summarizeDndPregenBuilds("srd-5.2.1-2024")).toEqual({
      classes: 12,
      levels: 20,
      total: 240,
      readyToPlay: 0,
      blueprints: 240
    });
  });

  it("preserves edition-specific subclass unlock levels", () => {
    expect(getDndPregenBuildSlot("srd-5.1-2014", "cleric", 1)?.subclassActive).toBe(true);
    expect(getDndPregenBuildSlot("srd-5.1-2014", "wizard", 1)?.subclassActive).toBe(false);
    expect(getDndPregenBuildSlot("srd-5.1-2014", "wizard", 2)?.subclassActive).toBe(true);
    expect(getDndPregenBuildSlot("srd-5.1-2014", "fighter", 2)?.subclassActive).toBe(false);
    expect(getDndPregenBuildSlot("srd-5.1-2014", "fighter", 3)?.subclassActive).toBe(true);
    expect(getDndPregenBuildSlot("srd-5.2.1-2024", "cleric", 2)?.subclassActive).toBe(false);
    expect(getDndPregenBuildSlot("srd-5.2.1-2024", "cleric", 3)?.subclassActive).toBe(true);
  });

  it("filters deterministically by edition, class, and level", () => {
    expect(filterDndPregenBuildSlots("srd-5.2.1-2024", "wizard", "all")).toHaveLength(20);
    expect(filterDndPregenBuildSlots("srd-5.1-2014", "all", 5)).toHaveLength(12);
    expect(filterDndPregenBuildSlots("srd-5.2.1-2024", "rogue", 11)).toMatchObject([
      { className: "Rogue", subclassName: "Thief", level: 11 }
    ]);
  });
});
