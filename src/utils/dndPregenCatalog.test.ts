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
      expect(new Set(definitions.map((definition) => definition.subclassId)).size).toBe(12);
      expect(definitions.every((definition) => definition.licenseScope === "public-srd")).toBe(true);
    }
  });

  it("creates one subclass-aware build slot for every public path and level", () => {
    expect(dndPregenBuildSlots).toHaveLength(480);
    expect(new Set(dndPregenBuildSlots.map((slot) => slot.id)).size).toBe(480);
    expect(dndPregenBuildSlots.every((slot) => slot.id.includes(slot.subclassId))).toBe(true);
    expect(summarizeDndPregenBuilds("srd-5.1-2014")).toEqual({
      classes: 12,
      subclasses: 12,
      levels: 20,
      total: 240,
      readyToPlay: 0,
      blueprints: 240
    });
    expect(summarizeDndPregenBuilds("srd-5.2.1-2024")).toEqual({
      classes: 12,
      subclasses: 12,
      levels: 20,
      total: 240,
      readyToPlay: 0,
      blueprints: 240
    });
  });

  it("preserves edition-specific subclass unlock levels", () => {
    expect(getDndPregenBuildSlot("srd-5.1-2014", "cleric", "life-domain", 1)?.subclassActive).toBe(true);
    expect(getDndPregenBuildSlot("srd-5.1-2014", "wizard", "school-evocation", 1)?.subclassActive).toBe(false);
    expect(getDndPregenBuildSlot("srd-5.1-2014", "wizard", "school-evocation", 2)?.subclassActive).toBe(true);
    expect(getDndPregenBuildSlot("srd-5.1-2014", "fighter", "champion", 2)?.subclassActive).toBe(false);
    expect(getDndPregenBuildSlot("srd-5.1-2014", "fighter", "champion", 3)?.subclassActive).toBe(true);
    expect(getDndPregenBuildSlot("srd-5.2.1-2024", "cleric", "life-domain", 2)?.subclassActive).toBe(false);
    expect(getDndPregenBuildSlot("srd-5.2.1-2024", "cleric", "life-domain", 3)?.subclassActive).toBe(true);
  });

  it("filters deterministically by edition, class, subclass, and level", () => {
    expect(filterDndPregenBuildSlots({ ruleset: "srd-5.2.1-2024", classId: "wizard", subclassId: "all", level: "all" })).toHaveLength(20);
    expect(filterDndPregenBuildSlots({ ruleset: "srd-5.1-2014", classId: "all", subclassId: "all", level: 5 })).toHaveLength(12);
    expect(filterDndPregenBuildSlots({ ruleset: "srd-5.2.1-2024", classId: "rogue", subclassId: "thief", level: 11 })).toMatchObject([
      { className: "Rogue", subclassId: "thief", subclassName: "Thief", level: 11 }
    ]);
  });
});
