import { describe, expect, it } from "vitest";
import { dndContainerCatalog } from "../data/dndContainersPacks";
import { calculateDndContainerPlan, formatDndCoinPrice } from "./dndContainersPacks";

const container = (id: string) => dndContainerCatalog.find((item) => item.id === id)!;

describe("D&D container planning", () => {
  it("formats copper-denominated prices", () => {
    expect(formatDndCoinPrice(1)).toBe("1 CP");
    expect(formatDndCoinPrice(50)).toBe("5 SP");
    expect(formatDndCoinPrice(200)).toBe("2 GP");
    expect(formatDndCoinPrice(250)).toBe("25 SP");
  });

  it("calculates quantity, empty weight, contents weight, and cost", () => {
    expect(calculateDndContainerPlan({
      container: container("backpack"),
      ruleset: "srd-5.2.1-2024",
      quantity: 2,
      contentsWeightPounds: 45
    })).toMatchObject({
      quantity: 2,
      emptyWeightPounds: 10,
      contentsWeightPounds: 45,
      totalWeightPounds: 55,
      totalCostCp: 400,
      totalWeightCapacityPounds: 60,
      remainingWeightCapacityPounds: 15,
      overWeightCapacity: false
    });
  });

  it("flags weight-capacity overflow", () => {
    expect(calculateDndContainerPlan({
      container: container("pouch"),
      ruleset: "srd-5.1-2014",
      quantity: 2,
      contentsWeightPounds: 13
    })).toMatchObject({
      totalWeightCapacityPounds: 12,
      remainingWeightCapacityPounds: 0,
      overWeightCapacity: true
    });
  });

  it("does not invent a weight limit for volume-only containers", () => {
    expect(calculateDndContainerPlan({
      container: container("barrel"),
      ruleset: "srd-5.2.1-2024",
      quantity: 1,
      contentsWeightPounds: 500
    })).toMatchObject({
      totalWeightCapacityPounds: undefined,
      remainingWeightCapacityPounds: undefined,
      overWeightCapacity: false
    });
  });

  it("preserves the 2014-only chest weight cap", () => {
    expect(calculateDndContainerPlan({
      container: container("chest"),
      ruleset: "srd-5.1-2014",
      quantity: 1,
      contentsWeightPounds: 301
    }).overWeightCapacity).toBe(true);
    expect(calculateDndContainerPlan({
      container: container("chest"),
      ruleset: "srd-5.2.1-2024",
      quantity: 1,
      contentsWeightPounds: 301
    }).totalWeightCapacityPounds).toBeUndefined();
  });
});
