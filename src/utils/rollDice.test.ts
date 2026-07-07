import { describe, expect, it, vi } from "vitest";
import { rollDiceFormula } from "./rollDice";

describe("rollDiceFormula", () => {
  it("rolls a weapon damage formula with a modifier", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);

    try {
      const result = rollDiceFormula("1d12+5");

      expect(result.formula).toBe("1d12+5");
      expect(result.modifier).toBe(5);
      expect(result.total).toBe(12);
      expect(result.dice[0].results).toEqual([7]);
    } finally {
      vi.restoreAllMocks();
    }
  });

  it("rolls an upcast spell formula", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);

    try {
      const result = rollDiceFormula("10d6");

      expect(result.dice[0].results).toHaveLength(10);
      expect(result.total).toBe(10);
    } finally {
      vi.restoreAllMocks();
    }
  });

  it("rejects unsupported formula text", () => {
    expect(() => rollDiceFormula("fireball 10d6")).toThrow("Unsupported dice formula");
  });
});
