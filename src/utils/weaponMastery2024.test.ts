import { describe, expect, it } from "vitest";
import { weaponCatalog2014 } from "../data/weaponCatalog2014";
import { weaponCatalog2024 } from "../data/weaponCatalog2024";
import {
  weaponMasteryDefinitions2024,
  weaponMasteryOrder
} from "../data/weaponMastery2024";
import {
  calculateToppleSaveDc,
  canActivateWeaponMastery,
  filterMasteryWeapons,
  findMasteryWeapon,
  getWeaponsForMastery
} from "./weaponMastery2024";

describe("2024 Weapon Mastery", () => {
  it("assigns one recognized mastery to every 2024 weapon", () => {
    expect(weaponCatalog2024).toHaveLength(38);
    for (const weapon of weaponCatalog2024) {
      expect(weapon.mastery).toBeTruthy();
      expect(weaponMasteryOrder).toContain(weapon.mastery);
    }
    expect(new Set(weaponCatalog2024.map((weapon) => weapon.mastery))).toEqual(new Set(weaponMasteryOrder));
  });

  it("keeps mastery out of the 2014 weapon catalog", () => {
    expect(weaponCatalog2014.every((weapon) => weapon.mastery === undefined)).toBe(true);
  });

  it("protects the important timing and stacking limits", () => {
    const cleaveProcedure = [
      weaponMasteryDefinitions2024.Cleave.effect,
      ...weaponMasteryDefinitions2024.Cleave.limits
    ].join(" ");
    expect(weaponMasteryDefinitions2024.Cleave.oncePerTurn).toBe(true);
    expect(cleaveProcedure).toContain("within your reach");
    expect(weaponMasteryDefinitions2024.Nick.oncePerTurn).toBe(true);
    expect(weaponMasteryDefinitions2024.Slow.limits.join(" ")).toContain("do not reduce");
    expect(weaponMasteryDefinitions2024.Sap.effect).toContain("before the start of your next turn");
    expect(weaponMasteryDefinitions2024.Vex.effect).toContain("before the end of your next turn");
  });

  it("calculates the Topple Constitution save DC", () => {
    expect(calculateToppleSaveDc(4, 3)).toBe(15);
    expect(calculateToppleSaveDc(-1, 2)).toBe(9);
  });

  it("looks up and filters weapons by mastery", () => {
    expect(findMasteryWeapon("greataxe")?.mastery).toBe("Cleave");
    expect(getWeaponsForMastery("Nick").map((weapon) => weapon.id)).toContain("dagger");
    expect(filterMasteryWeapons("crossbow", "Vex").map((weapon) => weapon.id)).toContain("hand-crossbow");
    expect(filterMasteryWeapons("crossbow", "Slow").map((weapon) => weapon.id)).toContain("light-crossbow");
  });

  it("requires an unlocking feature for the selected weapon", () => {
    const greataxe = findMasteryWeapon("greataxe");
    expect(canActivateWeaponMastery(greataxe, false)).toBe(false);
    expect(canActivateWeaponMastery(greataxe, true)).toBe(true);
  });
});
