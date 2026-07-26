import { secureRandomInteger, type RandomIntegerSource } from "./randomInteger";

export const COC_CHARACTERISTIC_NAMES = [
  "STR",
  "CON",
  "POW",
  "DEX",
  "APP",
  "SIZ",
  "INT",
  "EDU"
] as const;

export type CocCharacteristicName = typeof COC_CHARACTERISTIC_NAMES[number];
export type CocCharacteristics = Record<CocCharacteristicName, number>;

export const COC_STANDARD_CHARACTERISTIC_VALUES = [40, 50, 50, 50, 60, 60, 70, 80] as const;
export const COC_OCCUPATION_VALUES = [70, 60, 60, 50, 50, 50, 40, 40, 40] as const;

export type CocThresholds = {
  regular: number;
  hard: number;
  extreme: number;
};

export type CocDerivedAttributes = {
  hitPoints: number;
  move: number;
  sanity: number;
  magicPoints: number;
  damageBonus: string;
  build: number;
  strengthAndSize: number;
};

const sorted = (values: readonly number[]): number[] => [...values].sort((a, b) => a - b);

export const calculateCocThresholds = (value: number): CocThresholds => {
  const regular = Math.max(0, Math.trunc(value) || 0);
  return {
    regular,
    hard: Math.floor(regular / 2),
    extreme: Math.floor(regular / 5)
  };
};

export const validateStandardCharacteristicAllocation = (
  characteristics: CocCharacteristics
): boolean => {
  const actual = sorted(COC_CHARACTERISTIC_NAMES.map((name) => characteristics[name]));
  const expected = sorted(COC_STANDARD_CHARACTERISTIC_VALUES);
  return actual.length === expected.length && actual.every((value, index) => value === expected[index]);
};

export const shuffleStandardCharacteristics = (
  randomInteger: RandomIntegerSource = secureRandomInteger
): CocCharacteristics => {
  const values = [...COC_STANDARD_CHARACTERISTIC_VALUES];
  for (let index = values.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInteger(0, index);
    [values[index], values[swapIndex]] = [values[swapIndex], values[index]];
  }
  return Object.fromEntries(
    COC_CHARACTERISTIC_NAMES.map((name, index) => [name, values[index]])
  ) as CocCharacteristics;
};

export const calculateDamageBonusAndBuild = (
  strength: number,
  size: number
): Pick<CocDerivedAttributes, "damageBonus" | "build" | "strengthAndSize"> => {
  const strengthAndSize = Math.max(2, Math.trunc(strength) + Math.trunc(size));
  if (strengthAndSize <= 64) return { strengthAndSize, damageBonus: "−2", build: -2 };
  if (strengthAndSize <= 84) return { strengthAndSize, damageBonus: "−1", build: -1 };
  if (strengthAndSize <= 124) return { strengthAndSize, damageBonus: "None", build: 0 };
  if (strengthAndSize <= 164) return { strengthAndSize, damageBonus: "+1D4", build: 1 };
  return { strengthAndSize, damageBonus: "+1D6", build: 2 };
};

export const calculateCocDerivedAttributes = (
  characteristics: CocCharacteristics
): CocDerivedAttributes => {
  const damage = calculateDamageBonusAndBuild(characteristics.STR, characteristics.SIZ);
  return {
    hitPoints: Math.floor((characteristics.CON + characteristics.SIZ) / 10),
    move: 8,
    sanity: characteristics.POW,
    magicPoints: Math.floor(characteristics.POW / 5),
    ...damage
  };
};

export const validateOccupationValueAllocation = (values: number[]): boolean => {
  const actual = sorted(values);
  const expected = sorted(COC_OCCUPATION_VALUES);
  return actual.length === expected.length && actual.every((value, index) => value === expected[index]);
};

export const applyPersonalInterestBoost = (baseValue: number): number =>
  Math.max(0, Math.trunc(baseValue) || 0) + 20;

export const isCthulhuMythosSkill = (skillName: string): boolean =>
  skillName.trim().toLowerCase().replace(/[^a-z]/g, "") === "cthulhumythos";
