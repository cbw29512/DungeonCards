import { describe, expect, it } from "vitest";
import { dndArmorCatalog } from "../data/dndArmor";
import {
  calculate2014VariantEncumbrance,
  calculateArmorDexterityContribution,
  calculateDndArmor,
  calculateDndCapacity,
  calculateLoadoutWeight
} from "./dndArmor";

const armor = (id: string) => dndArmorCatalog.find((item) => item.id === id);

describe("D&D armor and loadout rules", () => {
  it("contains the complete shared twelve-armor SRD table", () => {
    expect(dndArmorCatalog).toHaveLength(12);
    expect(dndArmorCatalog.filter((item) => item.category === "light")).toHaveLength(3);
    expect(dndArmorCatalog.filter((item) => item.category === "medium")).toHaveLength(5);
    expect(dndArmorCatalog.filter((item) => item.category === "heavy")).toHaveLength(4);
  });

  it("calculates unarmored, light, medium, and heavy AC", () => {
    expect(calculateArmorDexterityContribution(undefined, 3)).toBe(3);
    expect(calculateArmorDexterityContribution(armor("leather"), 3)).toBe(3);
    expect(calculateArmorDexterityContribution(armor("breastplate"), 4)).toBe(2);
    expect(calculateArmorDexterityContribution(armor("breastplate"), -1)).toBe(-1);
    expect(calculateArmorDexterityContribution(armor("plate"), 4)).toBe(0);

    expect(calculateDndArmor({
      ruleset: "srd-5.2.1-2024",
      armor: armor("studded-leather"),
      dexterityModifier: 3,
      strengthScore: 10,
      armorTrained: true,
      shieldEquipped: false,
      shieldTrained: false
    }).armorClass).toBe(15);

    expect(calculateDndArmor({
      ruleset: "srd-5.1-2014",
      armor: armor("plate"),
      dexterityModifier: -2,
      strengthScore: 15,
      armorTrained: true,
      shieldEquipped: true,
      shieldTrained: true
    }).armorClass).toBe(20);
  });

  it("separates 2014 shield proficiency from 2024 shield training", () => {
    const oldResult = calculateDndArmor({
      ruleset: "srd-5.1-2014",
      dexterityModifier: 2,
      strengthScore: 10,
      armorTrained: true,
      shieldEquipped: true,
      shieldTrained: false
    });
    expect(oldResult.armorClass).toBe(14);
    expect(oldResult.shieldBonus).toBe(2);
    expect(oldResult.trainingIssue).toBe(true);

    const newResult = calculateDndArmor({
      ruleset: "srd-5.2.1-2024",
      dexterityModifier: 2,
      strengthScore: 10,
      armorTrained: true,
      shieldEquipped: true,
      shieldTrained: false
    });
    expect(newResult.armorClass).toBe(12);
    expect(newResult.shieldBonus).toBe(0);
    expect(newResult.trainingIssue).toBe(false);
  });

  it("applies Strength and Stealth armor consequences", () => {
    const result = calculateDndArmor({
      ruleset: "srd-5.2.1-2024",
      armor: armor("chain-mail"),
      dexterityModifier: 2,
      strengthScore: 12,
      armorTrained: true,
      shieldEquipped: false,
      shieldTrained: false
    });
    expect(result.speedPenaltyFeet).toBe(10);
    expect(result.stealthDisadvantage).toBe(true);

    expect(calculateDndArmor({
      ruleset: "srd-5.1-2014",
      armor: armor("chain-mail"),
      dexterityModifier: 2,
      strengthScore: 12,
      armorTrained: true,
      shieldEquipped: false,
      shieldTrained: false,
      ignoreArmorStrengthRequirement: true
    }).speedPenaltyFeet).toBe(0);
  });

  it("calculates size-scaled carrying and push/drag/lift limits", () => {
    expect(calculateDndCapacity(10, "tiny", 75)).toMatchObject({ carryingCapacity: 75, pushDragLiftMaximum: 150, loadStatus: "within-capacity" });
    expect(calculateDndCapacity(10, "medium", 200)).toMatchObject({ carryingCapacity: 150, pushDragLiftMaximum: 300, loadStatus: "over-carrying-capacity", speedMaximumFeet: 5 });
    expect(calculateDndCapacity(10, "large", 301)).toMatchObject({ carryingCapacity: 300, pushDragLiftMaximum: 600, loadStatus: "over-carrying-capacity" });
    expect(calculateDndCapacity(10, "medium", 301).loadStatus).toBe("over-push-drag-lift");
  });

  it("resolves the published 2014 variant thresholds without enabling them for 2024", () => {
    expect(calculate2014VariantEncumbrance(10, "medium", 50)).toBe("normal");
    expect(calculate2014VariantEncumbrance(10, "medium", 51)).toBe("encumbered");
    expect(calculate2014VariantEncumbrance(10, "medium", 101)).toBe("heavily-encumbered");
    expect(calculate2014VariantEncumbrance(10, "medium", 151)).toBe("over-capacity");
  });

  it("adds armor, shield, and other gear weight", () => {
    expect(calculateLoadoutWeight(armor("chain-mail"), true, 20)).toBe(81);
    expect(calculateLoadoutWeight(undefined, false, -5)).toBe(0);
  });
});
