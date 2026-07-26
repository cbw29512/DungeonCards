import { describe, expect, it } from "vitest";
import { dndToolCatalog } from "../data/dndTools";
import {
  calculateDndToolCheckModifier,
  filterDndTools,
  resolveDndToolPurchase,
  rollDndToolCheck
} from "./dndTools";

const tool = (id: string) => dndToolCatalog.find((item) => item.id === id)!;

describe("D&D tool checks", () => {
  it("resolves family and variant price and weight", () => {
    expect(resolveDndToolPurchase(tool("thieves"))).toMatchObject({ name: "Thieves’ Tools", costCp: 2500, weightPounds: 1 });
    expect(resolveDndToolPurchase(tool("instrument"), "dulcimer")).toMatchObject({
      name: "Musical Instrument: Dulcimer",
      costCp: 2500,
      weightPounds: 10
    });
    expect(resolveDndToolPurchase(tool("gaming"), "dice")).toMatchObject({ costCp: 10, weightPounds: undefined });
  });

  it("adds Proficiency Bonus only when proficient with the tool", () => {
    expect(calculateDndToolCheckModifier(3, 4, true)).toBe(7);
    expect(calculateDndToolCheckModifier(3, 4, false)).toBe(3);
  });

  it("uses a normal 2014 check even when a relevant skill is proficient", () => {
    expect(rollDndToolCheck({
      ruleset: "srd-5.1-2014",
      abilityModifier: 2,
      proficiencyBonus: 3,
      toolProficient: true,
      relevantSkillProficient: true,
      dc: 15,
      randomInteger: () => 10
    })).toEqual({
      ruleset: "srd-5.1-2014",
      rolls: [10],
      chosenRoll: 10,
      abilityModifier: 2,
      proficiencyBonus: 3,
      toolProficient: true,
      relevantSkillProficient: true,
      advantage: false,
      total: 15,
      dc: 15,
      success: true
    });
  });

  it("uses Advantage for a relevant 2024 skill proficiency", () => {
    const results = [4, 16];
    expect(rollDndToolCheck({
      ruleset: "srd-5.2.1-2024",
      abilityModifier: 3,
      proficiencyBonus: 2,
      toolProficient: true,
      relevantSkillProficient: true,
      dc: 20,
      randomInteger: () => results.shift() ?? 1
    })).toMatchObject({
      rolls: [4, 16],
      chosenRoll: 16,
      advantage: true,
      total: 21,
      success: true
    });
  });

  it("can roll a 2024 tool check without tool proficiency", () => {
    expect(rollDndToolCheck({
      ruleset: "srd-5.2.1-2024",
      abilityModifier: 3,
      proficiencyBonus: 2,
      toolProficient: false,
      relevantSkillProficient: false,
      randomInteger: () => 12
    })).toMatchObject({
      proficiencyBonus: 0,
      total: 15,
      success: undefined
    });
  });

  it("filters by category, procedure, craft, and variant", () => {
    expect(filterDndTools(dndToolCatalog, "potion of healing", "all").map((item) => item.id)).toContain("herbalism");
    expect(filterDndTools(dndToolCatalog, "dulcimer", "other").map((item) => item.id)).toEqual(["instrument"]);
    expect(filterDndTools(dndToolCatalog, "strength", "artisan").map((item) => item.id)).toEqual(expect.arrayContaining(["carpenter", "mason", "smith"]));
  });
});
