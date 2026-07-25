import { describe, expect, it } from "vitest";
import {
  calculateStartingLuck,
  resolveLuckRoll,
  rollStartingLuck,
  selectGroupLuckInvestigators,
  spendTrackedLuck
} from "./cocLuck";

describe("Call of Cthulhu Luck procedures", () => {
  it("calculates starting Luck as 3D6 times 5", () => {
    expect(calculateStartingLuck([1, 1, 1])).toBe(15);
    expect(calculateStartingLuck([6, 6, 6])).toBe(90);
    expect(rollStartingLuck(() => 4)).toEqual({ dice: [4, 4, 4], luck: 60 });
  });

  it("rejects invalid starting Luck dice", () => {
    expect(() => calculateStartingLuck([1, 2])).toThrow("exactly three");
    expect(() => calculateStartingLuck([1, 2, 7])).toThrow("from 1 to 6");
  });

  it("succeeds when the percentile roll is equal to or below Luck", () => {
    expect(resolveLuckRoll(55, 55).success).toBe(true);
    expect(resolveLuckRoll(55, 56).success).toBe(false);
    expect(resolveLuckRoll(0, 1).success).toBe(false);
  });

  it("selects the investigator with the lowest Luck for a Group Luck roll", () => {
    const result = selectGroupLuckInvestigators([
      { id: "ada", name: "Ada", luck: 65 },
      { id: "ben", name: "Ben", luck: 40 },
      { id: "cy", name: "Cy", luck: 55 }
    ]);
    expect(result.lowestLuck).toBe(40);
    expect(result.investigators.map((investigator) => investigator.name)).toEqual(["Ben"]);
  });

  it("preserves all tied lowest-Luck investigators", () => {
    const result = selectGroupLuckInvestigators([
      { id: "ada", name: "Ada", luck: 40 },
      { id: "ben", name: "Ben", luck: 40 },
      { id: "cy", name: "Cy", luck: 55 }
    ]);
    expect(result.investigators).toHaveLength(2);
    expect(result.summary).toContain("choose one of them");
  });

  it("tracks optional spending without allowing negative Luck", () => {
    expect(spendTrackedLuck(45, 12)).toEqual({ previousLuck: 45, spent: 12, remainingLuck: 33 });
    expect(spendTrackedLuck(10, 99)).toEqual({ previousLuck: 10, spent: 10, remainingLuck: 0 });
    expect(spendTrackedLuck(10, -5).remainingLuck).toBe(10);
  });
});
