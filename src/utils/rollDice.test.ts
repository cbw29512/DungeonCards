import { describe, expect, it, vi } from "vitest";
import { rollDiceFormula, validateDiceFormula } from "./rollDice";

describe("validateDiceFormula", () => {
  it("accepts supported combat formulas", () => {
    expect(() => validateDiceFormula("1d20+8")).not.toThrow();
    expect(() => validateDiceFormula("10d6")).not.toThrow();
    expect(() => validateDiceFormula("2d8+4")).not.toThrow();
  });

  it("rejects unsupported text and unsafe roll sizes", () => {
    expect(() => validateDiceFormula("fireball 10d6")).toThrow("Unsupported dice formula");
    expect(() => validateDiceFormula("101d6")).toThrow("Dice count cannot exceed 100 per term");
    expect(() => validateDiceFormula("60d6+60d6")).toThrow("cannot roll more than 100 dice");
    expect(() => validateDiceFormula("1d1001")).toThrow("Die size cannot exceed d1000");
  });
});

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

  it("rolls an upcast spell without treating a damage die as a natural failure", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);

    try {
      const result = rollDiceFormula("10d6");

      expect(result.dice[0].results).toHaveLength(10);
      expect(result.total).toBe(10);
      expect(result.isFailure).toBe(false);
    } finally {
      vi.restoreAllMocks();
    }
  });

  it("uses a card's natural-roll thresholds for a single attack die", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.999);

    try {
      const result = rollDiceFormula("1d20+8", { critOn: 20, failOn: 1 });

      expect(result.total).toBe(28);
      expect(result.isCritical).toBe(true);
      expect(result.isFailure).toBe(false);
    } finally {
      vi.restoreAllMocks();
    }
  });

  it("does not invent natural-roll outcomes without card thresholds", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);

    try {
      const result = rollDiceFormula("1d20+2");

      expect(result.total).toBe(3);
      expect(result.isCritical).toBe(false);
      expect(result.isFailure).toBe(false);
    } finally {
      vi.restoreAllMocks();
    }
  });

  it("rejects a final total outside JavaScript's safe integer range", () => {
    expect(() => rollDiceFormula("1d6+9007199254740991")).toThrow(
      "final dice total is outside the supported range"
    );
  });
});
