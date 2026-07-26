import { describe, expect, it } from "vitest";
import {
  dndContainerCatalog,
  dndContainerPackSourceByRuleset,
  dndEquipmentPackCatalog
} from "./dndContainersPacks";

describe("D&D containers and equipment packs", () => {
  it("keeps container and pack IDs unique and complete", () => {
    expect(dndContainerCatalog).toHaveLength(16);
    expect(new Set(dndContainerCatalog.map((item) => item.id)).size).toBe(16);
    expect(dndEquipmentPackCatalog).toHaveLength(7);
    expect(new Set(dndEquipmentPackCatalog.map((item) => item.id)).size).toBe(7);
  });

  it("preserves container capacity differences", () => {
    const bucket = dndContainerCatalog.find((item) => item.id === "bucket");
    const chest = dndContainerCatalog.find((item) => item.id === "chest");
    expect(bucket?.capacity["srd-5.1-2014"]).toContain("3 gallons");
    expect(bucket?.capacity["srd-5.2.1-2024"]).not.toContain("3 gallons");
    expect(chest?.weightCapacityPounds["srd-5.1-2014"]).toBe(300);
    expect(chest?.weightCapacityPounds["srd-5.2.1-2024"]).toBeUndefined();
  });

  it("preserves the Priest's Pack price and content rewrite", () => {
    const priest = dndEquipmentPackCatalog.find((item) => item.id === "priest");
    expect(priest?.costCp).toEqual({ "srd-5.1-2014": 1900, "srd-5.2.1-2024": 3300 });
    expect(priest?.contents["srd-5.1-2014"]).toContain("Alms box");
    expect(priest?.contents["srd-5.2.1-2024"]).toContain("Holy water");
  });

  it("uses published single-pack weights only where available", () => {
    expect(dndEquipmentPackCatalog.every((pack) => pack.totalWeightPounds["srd-5.1-2014"] === undefined)).toBe(true);
    expect(dndEquipmentPackCatalog.every((pack) => pack.totalWeightPounds["srd-5.2.1-2024"] !== undefined)).toBe(true);
  });

  it("keeps official source links", () => {
    for (const source of Object.values(dndContainerPackSourceByRuleset)) {
      expect(source.url).toMatch(/^https:\/\/www\.dndbeyond\.com\/sources\/dnd\//);
    }
  });
});
