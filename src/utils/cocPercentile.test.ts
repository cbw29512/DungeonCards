import { describe, expect, it } from "vitest";
import type { RandomIntegerSource } from "./randomInteger";
import {
  getCocSuccessLevel,
  meetsCocDifficulty,
  resolveCocRollMode,
  rollCocPercentile
} from "./cocPercentile";

const sequence = (...values: number[]): RandomIntegerSource => {
  let index = 0;
  return () => values[index++] ?? values.at(-1) ?? 0;
};

describe("getCocSuccessLevel", () => {
  it("resolves critical, extreme, hard, regular, failure, and fumble", () => {
    expect(getCocSuccessLevel(1, 60)).toBe("critical");
    expect(getCocSuccessLevel(12, 60)).toBe("extreme");
    expect(getCocSuccessLevel(30, 60)).toBe("hard");
    expect(getCocSuccessLevel(60, 60)).toBe("regular");
    expect(getCocSuccessLevel(61, 60)).toBe("failure");
    expect(getCocSuccessLevel(100, 60)).toBe("fumble");
  });

  it("uses floored half and fifth values", () => {
    expect(getCocSuccessLevel(10, 53)).toBe("extreme");
    expect(getCocSuccessLevel(11, 53)).toBe("hard");
    expect(getCocSuccessLevel(26, 53)).toBe("hard");
    expect(getCocSuccessLevel(27, 53)).toBe("regular");
  });

  it("uses the lower-skill fumble threshold below 50", () => {
    expect(getCocSuccessLevel(95, 49)).toBe("failure");
    expect(getCocSuccessLevel(96, 49)).toBe("fumble");
  });

  it("uses only 100 as a fumble at skill 50 or higher", () => {
    expect(getCocSuccessLevel(99, 50)).toBe("failure");
    expect(getCocSuccessLevel(100, 50)).toBe("fumble");
  });
});

describe("resolveCocRollMode", () => {
  it("cancels opposing Bonus and Penalty dice", () => {
    expect(resolveCocRollMode(0, 0)).toBe("normal");
    expect(resolveCocRollMode(1, 1)).toBe("normal");
    expect(resolveCocRollMode(2, 1)).toBe("bonus");
    expect(resolveCocRollMode(1, 2)).toBe("penalty");
    expect(resolveCocRollMode(2, 0)).toBe("double-bonus");
    expect(resolveCocRollMode(0, 2)).toBe("double-penalty");
  });

  it("rejects unsupported dice counts", () => {
    expect(() => resolveCocRollMode(3, 0)).toThrow("Bonus dice");
    expect(() => resolveCocRollMode(0, -1)).toThrow("Penalty dice");
  });
});

describe("rollCocPercentile", () => {
  it("uses the lower tens die for one Bonus die", () => {
    const result = rollCocPercentile(65, "regular", "bonus", sequence(4, 7, 2));

    expect(result.unitDie).toBe(4);
    expect(result.tensDice).toEqual([7, 2]);
    expect(result.candidates).toEqual([74, 24]);
    expect(result.roll).toBe(24);
    expect(result.successLevel).toBe("hard");
  });

  it("uses the lowest of three candidates for two Bonus dice", () => {
    const result = rollCocPercentile(65, "regular", "double-bonus", sequence(7, 8, 4, 1));

    expect(result.tensDice).toEqual([8, 4, 1]);
    expect(result.candidates).toEqual([87, 47, 17]);
    expect(result.roll).toBe(17);
    expect(result.successLevel).toBe("hard");
  });

  it("uses the higher tens die for one Penalty die", () => {
    const result = rollCocPercentile(65, "regular", "penalty", sequence(4, 7, 2));

    expect(result.roll).toBe(74);
    expect(result.successLevel).toBe("failure");
  });

  it("uses the highest of three candidates for two Penalty dice", () => {
    const result = rollCocPercentile(65, "regular", "double-penalty", sequence(7, 8, 4, 1));

    expect(result.candidates).toEqual([87, 47, 17]);
    expect(result.roll).toBe(87);
    expect(result.successLevel).toBe("failure");
  });

  it("treats double zero as 100", () => {
    const result = rollCocPercentile(80, "regular", "normal", sequence(0, 0));

    expect(result.roll).toBe(100);
    expect(result.successLevel).toBe("fumble");
  });

  it("selects 10 instead of 100 when a Bonus die offers both with a shared zero unit", () => {
    const result = rollCocPercentile(65, "regular", "bonus", sequence(0, 0, 1));

    expect(result.candidates).toEqual([100, 10]);
    expect(result.roll).toBe(10);
  });

  it("selects 100 when a Penalty die offers 100 and 10", () => {
    const result = rollCocPercentile(65, "regular", "penalty", sequence(0, 0, 1));

    expect(result.roll).toBe(100);
    expect(result.successLevel).toBe("fumble");
  });

  it("checks the requested difficulty", () => {
    expect(meetsCocDifficulty("hard", "regular")).toBe(true);
    expect(meetsCocDifficulty("hard", "hard")).toBe(true);
    expect(meetsCocDifficulty("hard", "extreme")).toBe(false);
    expect(meetsCocDifficulty("critical", "extreme")).toBe(true);
  });
});