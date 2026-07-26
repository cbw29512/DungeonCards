import { describe, expect, it } from "vitest";
import {
  dndDrawnVehicleCatalog,
  dndMountCatalog,
  dndMountSourceByRuleset,
  dndSaddleCatalog
} from "./dndMounts";

describe("D&D mounts and drawn vehicles catalog", () => {
  it("keeps mount and vehicle IDs unique and complete", () => {
    expect(dndMountCatalog).toHaveLength(8);
    expect(new Set(dndMountCatalog.map((item) => item.id)).size).toBe(8);
    expect(dndDrawnVehicleCatalog).toHaveLength(5);
    expect(new Set(dndDrawnVehicleCatalog.map((item) => item.id)).size).toBe(5);
  });

  it("preserves the published camel capacity change", () => {
    const camel = dndMountCatalog.find((item) => item.id === "camel");
    expect(camel?.carryingCapacity).toEqual({
      "srd-5.1-2014": 480,
      "srd-5.2.1-2024": 450
    });
  });

  it("keeps source links on official D&D Beyond pages", () => {
    for (const source of Object.values(dndMountSourceByRuleset)) {
      expect(source.url).toMatch(/^https:\/\/www\.dndbeyond\.com\/sources\/dnd\//);
    }
  });

  it("keeps Pack Saddle in the 2014 catalog only", () => {
    const pack = dndSaddleCatalog.find((item) => item.id === "pack");
    expect(pack?.rulesets).toEqual(["srd-5.1-2014"]);
    expect(dndSaddleCatalog.filter((item) => item.rulesets.includes("srd-5.1-2014"))).toHaveLength(4);
    expect(dndSaddleCatalog.filter((item) => item.rulesets.includes("srd-5.2.1-2024"))).toHaveLength(3);
  });

  it("keeps every monetary and weight value positive", () => {
    expect(dndMountCatalog.every((item) => item.costGp > 0)).toBe(true);
    expect(dndDrawnVehicleCatalog.every((item) => item.costGp > 0 && item.weightPounds > 0)).toBe(true);
    expect(dndSaddleCatalog.every((item) => item.costGp > 0 && item.weightPounds > 0)).toBe(true);
  });
});
