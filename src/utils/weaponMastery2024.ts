import { weaponCatalog2024 } from "../data/weaponCatalog2024";
import type { WeaponDefinition } from "../data/weaponCatalogTypes";
import type { WeaponMasteryName } from "../data/weaponMastery2024";

export const calculateToppleSaveDc = (
  attackAbilityModifier: number,
  proficiencyBonus: number
): number => 8 + Math.trunc(attackAbilityModifier) + Math.max(0, Math.trunc(proficiencyBonus));

export const getWeaponsForMastery = (mastery: WeaponMasteryName): WeaponDefinition[] =>
  weaponCatalog2024.filter((weapon) => weapon.mastery === mastery);

export const findMasteryWeapon = (weaponId: string): WeaponDefinition | undefined =>
  weaponCatalog2024.find((weapon) => weapon.id === weaponId);

export const filterMasteryWeapons = (
  query: string,
  mastery: WeaponMasteryName | "all"
): WeaponDefinition[] => {
  const normalized = query.trim().toLowerCase();
  return weaponCatalog2024.filter((weapon) => {
    if (mastery !== "all" && weapon.mastery !== mastery) return false;
    if (!normalized) return true;
    return [weapon.name, weapon.damage, weapon.damageType, weapon.properties, weapon.mastery]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(normalized);
  });
};

export const canActivateWeaponMastery = (
  weapon: WeaponDefinition | undefined,
  masteryUnlockedForWeapon: boolean
): boolean => Boolean(weapon?.mastery && masteryUnlockedForWeapon);
