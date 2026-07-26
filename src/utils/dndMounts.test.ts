import { describe, expect, it } from "vitest";
import { dndArmorCatalog } from "../data/dndArmor";
import { dndDrawnVehicleCatalog, dndMountCatalog } from "../data/dndMounts";
import { calculateDndBarding, calculateDndMountTeam } from "./dndMounts";

const mount = (id: string) => dndMountCatalog.find((item) => item.id === id)!;
const vehicle = (id: string) => dndDrawnVehicleCatalog.find((item) => item.id === id)!;
const armor = (id: string) => dndArmorCatalog.find((item) => item.id === id)!;

describe("D&D mounts, cargo, and barding", () => {
  it("preserves the edition-specific camel carrying capacity", () => {
    expect(mount("camel").carryingCapacity["srd-5.1-2014"]).toBe(480);
    expect(mount("camel").carryingCapacity["srd-5.2.1-2024"]).toBe(450);
  });

  it("adds animal capacities before applying the five-times pulling rule", () => {
    const result = calculateDndMountTeam({
      mount: mount("draft-horse"),
      ruleset: "srd-5.2.1-2024",
      animalCount: 2,
      vehicle: vehicle("wagon"),
      cargoWeight: 3000
    });
    expect(result.teamCarryingCapacity).toBe(1080);
    expect(result.pulledWeightMaximum).toBe(5400);
    expect(result.totalPulledWeight).toBe(3400);
    expect(result.withinPulledMaximum).toBe(true);
    expect(result.maximumCargoWeight).toBe(5000);
    expect(result.remainingCapacityAfterLoad).toBe(2000);
  });

  it("counts the vehicle itself against the pulled maximum", () => {
    const result = calculateDndMountTeam({
      mount: mount("mastiff"),
      ruleset: "srd-5.2.1-2024",
      animalCount: 1,
      vehicle: vehicle("carriage"),
      cargoWeight: 400
    });
    expect(result.pulledWeightMaximum).toBe(975);
    expect(result.totalPulledWeight).toBe(1000);
    expect(result.withinPulledMaximum).toBe(false);
    expect(result.remainingCapacityAfterLoad).toBe(0);
  });

  it("calculates team and vehicle purchase cost", () => {
    expect(calculateDndMountTeam({
      mount: mount("mule"),
      ruleset: "srd-5.1-2014",
      animalCount: 3,
      vehicle: vehicle("cart"),
      cargoWeight: 0
    })).toMatchObject({
      animalPurchaseCostGp: 24,
      vehiclePurchaseCostGp: 15,
      totalPurchaseCostGp: 39
    });
  });

  it("calculates barding at four times cost and twice weight", () => {
    expect(calculateDndBarding(armor("plate"))).toEqual({
      armorId: "plate",
      costGp: 6000,
      weightPounds: 130
    });
  });
});
