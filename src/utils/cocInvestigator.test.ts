import { describe, expect, it } from "vitest";
import {
  COC_OCCUPATION_VALUES,
  applyPersonalInterestBoost,
  calculateCocDerivedAttributes,
  calculateCocThresholds,
  calculateDamageBonusAndBuild,
  isCthulhuMythosSkill,
  shuffleStandardCharacteristics,
  validateOccupationValueAllocation,
  validateStandardCharacteristicAllocation,
  type CocCharacteristics
} from "./cocInvestigator";

const investigator: CocCharacteristics = {
  STR: 60,
  CON: 50,
  POW: 70,
  DEX: 50,
  APP: 40,
  SIZ: 60,
  INT: 80,
  EDU: 50
};

describe("Call of Cthulhu investigator creation", () => {
  it("calculates Regular, Half, and Fifth values by rounding down", () => {
    expect(calculateCocThresholds(45)).toEqual({ regular: 45, hard: 22, extreme: 9 });
    expect(calculateCocThresholds(70)).toEqual({ regular: 70, hard: 35, extreme: 14 });
  });

  it("validates the simplified fixed characteristic array", () => {
    expect(validateStandardCharacteristicAllocation(investigator)).toBe(true);
    expect(validateStandardCharacteristicAllocation({ ...investigator, APP: 50 })).toBe(false);
  });

  it("shuffles without changing the fixed characteristic values", () => {
    const shuffled = shuffleStandardCharacteristics((minimum) => minimum);
    expect(validateStandardCharacteristicAllocation(shuffled)).toBe(true);
  });

  it("calculates public secondary attributes", () => {
    expect(calculateCocDerivedAttributes(investigator)).toEqual({
      hitPoints: 11,
      move: 8,
      sanity: 70,
      magicPoints: 14,
      strengthAndSize: 120,
      damageBonus: "None",
      build: 0
    });
  });

  it("uses the published human Damage Bonus and Build bands", () => {
    expect(calculateDamageBonusAndBuild(30, 30)).toMatchObject({ damageBonus: "−2", build: -2 });
    expect(calculateDamageBonusAndBuild(40, 40)).toMatchObject({ damageBonus: "−1", build: -1 });
    expect(calculateDamageBonusAndBuild(60, 60)).toMatchObject({ damageBonus: "None", build: 0 });
    expect(calculateDamageBonusAndBuild(70, 70)).toMatchObject({ damageBonus: "+1D4", build: 1 });
    expect(calculateDamageBonusAndBuild(90, 90)).toMatchObject({ damageBonus: "+1D6", build: 2 });
  });

  it("validates the simplified occupation and Credit Rating value set", () => {
    expect(validateOccupationValueAllocation([...COC_OCCUPATION_VALUES])).toBe(true);
    expect(validateOccupationValueAllocation([70, 70, 60, 50, 50, 50, 40, 40, 40])).toBe(false);
  });

  it("applies personal-interest boosts and blocks Mythos creation points", () => {
    expect(applyPersonalInterestBoost(25)).toBe(45);
    expect(applyPersonalInterestBoost(90)).toBe(100);
    expect(isCthulhuMythosSkill("Cthulhu Mythos")).toBe(true);
    expect(isCthulhuMythosSkill("Library Use")).toBe(false);
  });
});
