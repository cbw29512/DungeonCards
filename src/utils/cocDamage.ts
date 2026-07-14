import { parseDiceFormula } from "./diceParser";
import { rollDiceFormula } from "./rollDice";

export type CocDamageKind = "ordinary" | "extreme-blunt" | "extreme-impaling";

export type CocDamageResolution = {
  kind: CocDamageKind;
  weaponFormula: string;
  damageBonusFormula: string;
  weaponDamage: number;
  damageBonus: number;
  additionalWeaponRoll: number;
  total: number;
};

export const maximumDiceFormula = (formula: string): number => {
  const parsed = parseDiceFormula(formula);
  const diceMaximum = parsed.diceTerms.reduce((sum, term) => {
    const termMaximum = term.sign > 0
      ? term.count * term.sides
      : -(term.count);
    return sum + termMaximum;
  }, 0);
  const maximum = diceMaximum + parsed.modifier;

  if (!Number.isSafeInteger(maximum)) {
    throw new Error("The maximum damage is outside the supported range.");
  }
  return Math.max(0, maximum);
};

export const resolveCocDamage = (
  weaponFormula: string,
  damageBonusFormula = "0",
  kind: CocDamageKind = "ordinary"
): CocDamageResolution => {
  try {
    if (kind === "ordinary") {
      const weaponDamage = rollDiceFormula(weaponFormula).total;
      const damageBonus = rollDiceFormula(damageBonusFormula).total;
      return {
        kind,
        weaponFormula,
        damageBonusFormula,
        weaponDamage,
        damageBonus,
        additionalWeaponRoll: 0,
        total: Math.max(0, weaponDamage + damageBonus)
      };
    }

    const weaponDamage = maximumDiceFormula(weaponFormula);
    const damageBonus = maximumDiceFormula(damageBonusFormula);
    const additionalWeaponRoll = kind === "extreme-impaling"
      ? rollDiceFormula(weaponFormula).total
      : 0;

    return {
      kind,
      weaponFormula,
      damageBonusFormula,
      weaponDamage,
      damageBonus,
      additionalWeaponRoll,
      total: Math.max(0, weaponDamage + damageBonus + additionalWeaponRoll)
    };
  } catch (error) {
    console.error("Call of Cthulhu damage resolution failed", {
      weaponFormula,
      damageBonusFormula,
      kind,
      error
    });
    throw error;
  }
};