import { describe, expect, it } from "vitest";
import { dndMovement2014 } from "../data/dndMovement2014";
import { dndMovement2024 } from "../data/dndMovement2024";
import {
  calculate2024GrappleShoveDc,
  calculateJumpDistances,
  calculateMovementCost,
  getCoverBenefit
} from "./dndMovement";

describe("edition-separated movement and special actions", () => {
  it("provides complete procedure sets for both editions", () => {
    expect(dndMovement2014).toHaveLength(9);
    expect(dndMovement2024).toHaveLength(9);
    expect(new Set(dndMovement2014.map((item) => item.id)).size).toBe(9);
    expect(new Set(dndMovement2024.map((item) => item.id)).size).toBe(9);
  });

  it("keeps grapple and Hide procedures separated", () => {
    const grapple2014 = dndMovement2014.find((item) => item.id.endsWith("-grapple"))!;
    const grapple2024 = dndMovement2024.find((item) => item.id.endsWith("-unarmed-grapple"))!;
    const hide2014 = dndMovement2014.find((item) => item.id.endsWith("-hide"))!;
    const hide2024 = dndMovement2024.find((item) => item.id.endsWith("-hide-search"))!;

    expect(grapple2014.steps.join(" ")).toContain("contested");
    expect(grapple2014.steps.join(" ")).not.toContain("8 + your Strength modifier");
    expect(grapple2024.steps.join(" ")).toContain("8 + your Strength modifier + Proficiency Bonus");
    expect(hide2014.steps.join(" ")).not.toContain("DC 15");
    expect(hide2024.steps.join(" ")).toContain("DC 15");
  });

  it("calculates combined movement costs", () => {
    expect(calculateMovementCost(15, "walk", false, false)).toBe(15);
    expect(calculateMovementCost(15, "walk", true, false)).toBe(30);
    expect(calculateMovementCost(15, "crawl", false, false)).toBe(30);
    expect(calculateMovementCost(15, "crawl", true, false)).toBe(45);
    expect(calculateMovementCost(15, "swim", true, true)).toBe(30);
  });

  it("calculates Strength-based jump distances", () => {
    expect(calculateJumpDistances(15, 2)).toEqual({
      runningLongJump: 15,
      standingLongJump: 7.5,
      runningHighJump: 5,
      standingHighJump: 2.5
    });
    expect(calculateJumpDistances(8, -4).runningHighJump).toBe(0);
  });

  it("calculates 2024 Grapple and Shove save DC", () => {
    expect(calculate2024GrappleShoveDc(4, 3)).toBe(15);
    expect(calculate2024GrappleShoveDc(-1, 2)).toBe(9);
  });

  it("returns the correct cover benefit", () => {
    expect(getCoverBenefit("half")).toMatchObject({ armorClassBonus: 2, dexteritySaveBonus: 2 });
    expect(getCoverBenefit("three-quarters")).toMatchObject({ armorClassBonus: 5, dexteritySaveBonus: 5 });
    expect(getCoverBenefit("total").canBeTargetedDirectly).toBe(false);
  });
});
