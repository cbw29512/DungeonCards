import { describe, expect, it } from "vitest";
import type { RandomIntegerSource } from "./randomInteger";
import {
  getCocSuccessLevel,
  meetsCocDifficulty,
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

  it("uses the lower-skill fumble threshold", () => {
    expect(getCocSuccessLevel(95, 40)).toBe("failure");
    expect(getCocSuccessLevel(96, 40)).toBe("fumble");
  });
});

describe("rollCocPercentile", () => {
  it("uses the lower tens die for a bonus die", () => {
    const result = rollCocPercentile(65, "regular", "bonus", sequence(4, 7, 2));

    expect(result.unitDie).toBe(4);
    expect(result.tensDice).toEqual([7, 2]);
    expect(result.candidates).toEqual([74, 24]);
    expect(result.roll).toBe(24);
    expect(result.successLevel).toBe("hard");
  });

  it("uses the higher tens die for a penalty die", () => {
    const result = rollCocPercentile(65, "regular", "penalty", sequence(4, 7, 2));

    expect(result.roll).toBe(74);
    expect(result.successLevel).toBe("failure");
  });

  it("treats double zero as 100", () => {
    const result = rollCocPercentile(80, "regular", "normal", sequence(0, 0));

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
