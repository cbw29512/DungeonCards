import { describe, expect, it } from "vitest";
import { armorCatalog } from "../data/armorCatalog";
import { calculateArmorClass, calculateCarryingOutcome, resolveArmorOutcome } from "./armorAndCarrying";

const armor = (id: string) => armorCatalog.find((item) => item.id === id)!;

describe("edition-separated armor and carrying", () => {
  it("calculates light, medium, and heavy Armor Class", () => {
    expect(calculateArmorClass(armor("leather"), 4)).toBe(15);
    expect(calculateArmorClass(armor("half-plate"), 4)).toBe(17);
    expect(calculateArmorClass(armor("half-plate"), -1)).toBe(14);
    expect(calculateArmorClass(armor("plate"), 5)).toBe(18);
  });

  it("applies Strength and Stealth armor drawbacks", () => {
    expect(resolveArmorOutcome({
      ruleset: "dnd-2024",
      armor: armor("chain-mail"),
      dexterityModifier: 2,
      strengthScore: 12,
      armorTrained: true,
      shieldEquipped: false,
      shieldTrained: false
    })).toMatchObject({ armorClass: 16, speedPenalty: 10, stealthDisadvantage: true });
  });

  it("keeps Shield training behavior edition-separated", () => {
    expect(resolveArmorOutcome({
      ruleset: "dnd-2024",
      armor: armor("leather"),
      dexterityModifier: 3,
      strengthScore: 10,
      armorTrained: true,
      shieldEquipped: true,
      shieldTrained: false
    })).toMatchObject({ armorClass: 14, shieldBonusApplied: false });

    expect(resolveArmorOutcome({
      ruleset: "dnd-2014",
      armor: armor("leather"),
      dexterityModifier: 3,
      strengthScore: 10,
      armorTrained: true,
      shieldEquipped: true,
      shieldTrained: false
    })).toMatchObject({ armorClass: 16, shieldBonusApplied: true });
  });

  it("calculates carrying and push-drag-lift limits by size", () => {
    expect(calculateCarryingOutcome({ ruleset: "dnd-2024", strengthScore: 10, size: "Tiny", carriedWeight: 50 })).toMatchObject({ carryingCapacity: 75, pushDragLift: 150 });
    expect(calculateCarryingOutcome({ ruleset: "dnd-2024", strengthScore: 10, size: "Medium", carriedWeight: 50 })).toMatchObject({ carryingCapacity: 150, pushDragLift: 300 });
    expect(calculateCarryingOutcome({ ruleset: "dnd-2024", strengthScore: 10, size: "Large", carriedWeight: 50 })).toMatchObject({ carryingCapacity: 300, pushDragLift: 600 });
  });

  it("limits speed to 5 feet when moving weight above carry but within push-drag-lift", () => {
    expect(calculateCarryingOutcome({
      ruleset: "dnd-2024",
      strengthScore: 10,
      size: "Medium",
      carriedWeight: 200,
      pushingDraggingOrLifting: true
    })).toMatchObject({ loadStatus: "over-capacity", pushDragSpeedLimitedToFive: true });
  });

  it("applies variant encumbrance only to 2014", () => {
    expect(calculateCarryingOutcome({
      ruleset: "dnd-2014",
      strengthScore: 10,
      size: "Medium",
      carriedWeight: 60,
      use2014VariantEncumbrance: true
    })).toMatchObject({ loadStatus: "encumbered", speedPenalty: 10 });

    expect(calculateCarryingOutcome({
      ruleset: "dnd-2014",
      strengthScore: 10,
      size: "Medium",
      carriedWeight: 110,
      use2014VariantEncumbrance: true
    })).toMatchObject({ loadStatus: "heavily-encumbered", speedPenalty: 20, disadvantageOnPhysicalTests: true });

    expect(calculateCarryingOutcome({
      ruleset: "dnd-2024",
      strengthScore: 10,
      size: "Medium",
      carriedWeight: 110,
      use2014VariantEncumbrance: true
    })).toMatchObject({ loadStatus: "within-capacity", speedPenalty: 0 });
  });
});
