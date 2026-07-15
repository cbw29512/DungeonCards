import { describe, expect, it } from "vitest";
import type { RandomIntegerSource } from "./randomInteger";
import { maximumDiceFormula, resolveCocDamage } from "./cocDamage";

const sequence = (...values: number[]): RandomIntegerSource => {
  let index = 0;
  return () => values[index++] ?? values.at(-1) ?? 1;
};

describe("maximumDiceFormula", () => {
  it("calculates maximum weapon and damage-bonus formulas", () => {
    expect(maximumDiceFormula("1d6")).toBe(6);
    expect(maximumDiceFormula("2d6+4")).toBe(16);
    expect(maximumDiceFormula("1d4+1d6+1")).toBe(11);
    expect(maximumDiceFormula("0")).toBe(0);
  });
});

describe("resolveCocDamage", () => {
  it("rolls ordinary weapon damage and damage bonus", () => {
    const resolution = resolveCocDamage("1d6", "1d4", "ordinary", sequence(4, 3));

    expect(resolution.weaponDamage).toBe(4);
    expect(resolution.damageBonus).toBe(3);
    expect(resolution.total).toBe(7);
  });

  it("maximizes weapon damage and damage bonus for Extreme blunt damage", () => {
    const resolution = resolveCocDamage("1d6", "1d4", "extreme-blunt", sequence(1));

    expect(resolution.weaponDamage).toBe(6);
    expect(resolution.damageBonus).toBe(4);
    expect(resolution.additionalWeaponRoll).toBe(0);
    expect(resolution.total).toBe(10);
  });

  it("adds another weapon-damage roll for Extreme impaling damage", () => {
    const resolution = resolveCocDamage("1d10", "0", "extreme-impaling", sequence(7));

    expect(resolution.weaponDamage).toBe(10);
    expect(resolution.damageBonus).toBe(0);
    expect(resolution.additionalWeaponRoll).toBe(7);
    expect(resolution.total).toBe(17);
  });

  it("supports fixed modifiers in an impaling weapon formula", () => {
    const resolution = resolveCocDamage("2d6+4", "0", "extreme-impaling", sequence(2, 5));

    expect(resolution.weaponDamage).toBe(16);
    expect(resolution.additionalWeaponRoll).toBe(11);
    expect(resolution.total).toBe(27);
  });
});