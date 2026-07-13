import { describe, expect, it } from "vitest";
import type { RollResult } from "../types/cards";
import { formatRollBreakdown } from "./formatRollResult";

const makeResult = (overrides: Partial<RollResult> = {}): RollResult => ({
  formula: "1d12+5",
  dice: [{ sides: 12, results: [7] }],
  modifier: 5,
  total: 12,
  isCritical: false,
  isFailure: false,
  ...overrides
});

describe("formatRollBreakdown", () => {
  it("includes the modifier shown in the total", () => {
    expect(formatRollBreakdown(makeResult())).toBe("7 + 5");
  });

  it("preserves negative dice and modifiers", () => {
    const result = makeResult({
      dice: [{ sides: 6, results: [4, -2] }],
      modifier: -1,
      total: 1
    });

    expect(formatRollBreakdown(result)).toBe("4 - 2 - 1");
  });

  it("shows all dice and the kept result for advantage", () => {
    const result = makeResult({
      dice: [{ sides: 20, results: [4, 18], keptResults: [18] }],
      modifier: 5,
      total: 23
    });

    expect(formatRollBreakdown(result)).toBe("[4, 18] → 18 + 5");
  });

  it("shows a ready state before a card is rolled", () => {
    expect(formatRollBreakdown()).toBe("Ready");
  });
});