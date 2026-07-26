import { describe, expect, it } from "vitest";
import { dndLargeVehicleCatalog, dndLargeVehicleSourceByRuleset } from "./dndLargeVehicles";

describe("D&D large vehicle catalog", () => {
  it("contains six shared waterborne vehicles and the 2024 Airship", () => {
    expect(dndLargeVehicleCatalog).toHaveLength(7);
    expect(new Set(dndLargeVehicleCatalog.map((item) => item.id)).size).toBe(7);
    expect(dndLargeVehicleCatalog.filter((item) => item.rulesets.includes("srd-5.1-2014"))).toHaveLength(6);
    expect(dndLargeVehicleCatalog.filter((item) => item.rulesets.includes("srd-5.2.1-2024"))).toHaveLength(7);
    expect(dndLargeVehicleCatalog.find((item) => item.id === "airship")?.rulesets).toEqual(["srd-5.2.1-2024"]);
  });

  it("keeps shared cost and speed data stable", () => {
    expect(dndLargeVehicleCatalog.find((item) => item.id === "galley")).toMatchObject({ speedMph: 4, costGp: 30000 });
    expect(dndLargeVehicleCatalog.find((item) => item.id === "rowboat")).toMatchObject({ speedMph: 1.5, costGp: 50, carriedWeightPounds: 100 });
    expect(dndLargeVehicleCatalog.find((item) => item.id === "warship")).toMatchObject({ speedMph: 2.5, costGp: 25000 });
  });

  it("preserves unpublished passenger and cargo entries", () => {
    expect(dndLargeVehicleCatalog.find((item) => item.id === "galley")?.stats2024?.passengers).toBeUndefined();
    expect(dndLargeVehicleCatalog.find((item) => item.id === "rowboat")?.stats2024?.cargoTons).toBeUndefined();
  });

  it("keeps complete 2024 structural statistics where published", () => {
    expect(dndLargeVehicleCatalog.find((item) => item.id === "sailing-ship")?.stats2024).toEqual({
      crew: 20,
      passengers: 20,
      cargoTons: 100,
      armorClass: 15,
      hitPoints: 300,
      damageThreshold: 15
    });
  });

  it("links both editions to official D&D Beyond rules", () => {
    for (const source of Object.values(dndLargeVehicleSourceByRuleset)) {
      expect(source.url).toMatch(/^https:\/\/www\.dndbeyond\.com\/sources\/dnd\//);
    }
  });
});
