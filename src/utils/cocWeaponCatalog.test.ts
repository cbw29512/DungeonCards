import { describe, expect, it } from "vitest";
import {
  cocWeaponAvailabilityLevels,
  cocWeaponCatalog,
  cocWeaponEras,
  cocWeaponKinds
} from "../data/cocWeaponCatalog";
import { adaptCocWeapon } from "./cardPlatformCocWeaponAdapter";
import { validateCardDefinition } from "./cardPlatformValidation";

const firearmKinds = new Set(["handgun", "long-gun", "shotgun"]);

describe("Percentile Horror original weapon library", () => {
  it("ships a substantial unique era-aware armory", () => {
    expect(cocWeaponCatalog).toHaveLength(24);
    expect(new Set(cocWeaponCatalog.map((weapon) => weapon.id)).size).toBe(cocWeaponCatalog.length);
    expect(new Set(cocWeaponCatalog.map((weapon) => weapon.name)).size).toBe(cocWeaponCatalog.length);
    expect(new Set(cocWeaponCatalog.map((weapon) => weapon.kind))).toEqual(new Set(cocWeaponKinds));
    expect(new Set(cocWeaponCatalog.flatMap((weapon) => weapon.eras))).toEqual(new Set(cocWeaponEras));
    expect(new Set(cocWeaponCatalog.map((weapon) => weapon.availability))).toEqual(new Set(cocWeaponAvailabilityLevels));
  });

  it("keeps every weapon complete and internally consistent", () => {
    for (const weapon of cocWeaponCatalog) {
      expect(weapon.id).toMatch(/^coc-original-/);
      expect(weapon.name.length).toBeGreaterThan(3);
      expect(weapon.category.length).toBeGreaterThan(3);
      expect(weapon.eras.length).toBeGreaterThan(0);
      expect(weapon.defaultSkill).toBeGreaterThan(0);
      expect(weapon.defaultSkill).toBeLessThanOrEqual(100);
      expect(weapon.damageFormula).toMatch(/^\d+d\d+(?:(?:\+|-)\d+)?$/);
      expect(weapon.capacity).toBeGreaterThanOrEqual(0);
      expect(weapon.range.length).toBeGreaterThan(2);
      expect(weapon.attacksPerRound.length).toBeGreaterThan(0);
      expect(weapon.reload.length).toBeGreaterThan(5);
      expect(weapon.notes.length).toBeGreaterThan(40);

      if (firearmKinds.has(weapon.kind)) {
        expect(weapon.capacity).toBeGreaterThan(0);
        expect(weapon.malfunction).toBeGreaterThanOrEqual(90);
        expect(weapon.malfunction).toBeLessThanOrEqual(100);
        expect(weapon.usesDamageBonus).toBe(false);
      } else {
        expect(weapon.capacity).toBe(0);
        expect(weapon.malfunction).toBeUndefined();
        expect(weapon.usesDamageBonus).toBe(true);
      }
    }
  });

  it("adapts every record into a valid Card Platform definition", () => {
    for (const weapon of cocWeaponCatalog) {
      const card = adaptCocWeapon(weapon);
      expect(card).toMatchObject({
        gameSystemId: "coc-7e",
        family: "weapon",
        visibility: "player-safe",
        source: {
          kind: "original",
          publicDistributionAllowed: true
        }
      });
      expect(card.resources).toHaveLength(weapon.capacity > 0 ? 1 : 0);
      expect(card.actions).toHaveLength(3);
      expect(validateCardDefinition(card)).toEqual([]);
    }
  });
});
