import { describe, expect, it } from "vitest";
import type { RandomIntegerSource } from "./randomInteger";
import { rollDiceFormula, validateDiceFormula } from "./rollDice";

const constant = (value: number): RandomIntegerSource => () => value;

const sequence = (...values: number[]): RandomIntegerSource => {
  let index = 0;
  return () => values[index++] ?? values.at(-1) ?? 1;
};

describe("validateDiceFormula", () => {
  it("accepts combat, spell, and keep-highest formulas", () => {
    expect(() => validateDiceFormula("1d20+8")).not.toThrow();
    expect(() => validateDiceFormula("10d6")).not.toThrow();
    expect(() => validateDiceFormula("4d6kh3")).not.toThrow();
  });

  it("rejects unsupported text and unsafe roll sizes", () => {
    expect(() => validateDiceFormula("fireball 10d6")).toThrow("Unsupported dice formula");
    expect(() => validateDiceFormula("101d6")).toThrow("between 1 and 100");
    expect(() => validateDiceFormula("60d6+60d6")).toThrow("cannot roll more than 100 dice");
    expect(() => validateDiceFormula("1d1001")).toThrow("between d2 and d1000");
  });
});

describe("rollDiceFormula", () => {
  it("rolls weapon damage with an injected random source", () => {
    const result = rollDiceFormula("1d12+5", { randomInteger: constant(7) });

    expect(result.formula).toBe("1d12+5");
    expect(result.modifier).toBe(5);
    expect(result.total).toBe(12);
    expect(result.dice[0].results).toEqual([7]);
  });

  it("rolls upcast damage without inventing a natural failure", () => {
    const result = rollDiceFormula("10d6", { randomInteger: constant(1) });

    expect(result.dice[0].results).toHaveLength(10);
    expect(result.total).toBe(10);
    expect(result.isFailure).toBe(false);
  });

  it("uses the kept d20 for advantage and attack outcomes", () => {
    const result = rollDiceFormula("1d20+8", {
      advantageMode: "advantage",
      naturalRollRule: "attack",
      randomInteger: sequence(4, 20)
    });

    expect(result.dice[0].results).toEqual([4, 20]);
    expect(result.dice[0].keptResults).toEqual([20]);
    expect(result.total).toBe(28);
    expect(result.isCritical).toBe(true);
  });

  it("keeps the lower d20 for disadvantage", () => {
    const result = rollDiceFormula("1d20+3", {
      advantageMode: "disadvantage",
      naturalRollRule: "attack",
      randomInteger: sequence(18, 2)
    });

    expect(result.dice[0].keptResults).toEqual([2]);
    expect(result.total).toBe(5);
  });

  it("drops the lowest die for sentient item abilities", () => {
    const result = rollDiceFormula("4d6kh3", {
      randomInteger: sequence(6, 2, 5, 4)
    });

    expect(result.dice[0].results).toEqual([6, 2, 5, 4]);
    expect(result.dice[0].keptResults).toEqual([4, 5, 6]);
    expect(result.total).toBe(15);
  });

  it("does not apply attack outcomes to initiative or checks", () => {
    const result = rollDiceFormula("1d20+2", { randomInteger: constant(1) });

    expect(result.total).toBe(3);
    expect(result.isCritical).toBe(false);
    expect(result.isFailure).toBe(false);
  });

  it("rejects advantage on a non-d20 formula", () => {
    expect(() => rollDiceFormula("1d100", {
      advantageMode: "advantage",
      randomInteger: constant(50)
    })).toThrow("exactly one positive d20");
  });

  it("rejects a final total outside JavaScript's safe integer range", () => {
    expect(() => rollDiceFormula("1d6+9007199254740991", {
      randomInteger: constant(1)
    })).toThrow("final dice total is outside the supported range");
  });
});