import type { FightBattleCombatantState } from "../types/fightBattle";
import type { FightCombatantProfile } from "../types/fightMatchmaker";
import type { FightDamageComponent, FightRollMode } from "../types/fightRules";
import type { RandomIntegerSource } from "./randomInteger";
import { buildCriticalBonusFormula } from "./fightExecutionProfile";
import { rollDiceFormula } from "./rollDice";

const normalizeList = (values: string[] | undefined): string[] =>
  (values ?? []).map((value) => value.trim().toLowerCase()).filter(Boolean);

export const normalizeFightDamageType = (value: string): string => value.trim().toLowerCase();

export const combineFightRollModes = (...modes: Array<FightRollMode | undefined>): FightRollMode => {
  const hasAdvantage = modes.includes("advantage");
  const hasDisadvantage = modes.includes("disadvantage");
  if (hasAdvantage && hasDisadvantage) return "normal";
  if (hasAdvantage) return "advantage";
  if (hasDisadvantage) return "disadvantage";
  return "normal";
};

export const fightAttackRollMode = (
  attacker: FightBattleCombatantState,
  target: FightBattleCombatantState,
  actionMode?: FightRollMode
): FightRollMode => combineFightRollModes(
  actionMode,
  ...attacker.effects.map((effect) => effect.attackRollMode),
  ...target.effects.map((effect) => effect.attacksAgainstRollMode)
);

export const fightSaveRollMode = (target: FightBattleCombatantState): FightRollMode =>
  combineFightRollModes(...target.effects.map((effect) => effect.saveRollMode));

export const getFightDamageMultiplier = (profile: FightCombatantProfile, damageType: string): number => {
  const normalized = normalizeFightDamageType(damageType);
  const immunities = normalizeList(profile.damageImmunities);
  if (immunities.includes(normalized)) return 0;
  const resistant = normalizeList(profile.damageResistances).includes(normalized);
  const vulnerable = normalizeList(profile.damageVulnerabilities).includes(normalized);
  if (resistant && vulnerable) return 1;
  if (resistant) return 0.5;
  if (vulnerable) return 2;
  return 1;
};

export type FightResolvedDamageComponent = {
  damageType: string;
  rawDamage: number;
  modifiedDamage: number;
  appliedDamage: number;
  multiplier: number;
};

export const rollFightDamageComponents = ({
  target,
  components,
  critical,
  damageFraction = 1,
  randomInteger
}: {
  target: FightCombatantProfile;
  components: FightDamageComponent[];
  critical: boolean;
  damageFraction?: 0 | 0.5 | 1;
  randomInteger?: RandomIntegerSource;
}): {
  rawTotal: number;
  appliedTotal: number;
  components: FightResolvedDamageComponent[];
} => {
  const resolved = components.map((component) => {
    const base = Math.max(0, rollDiceFormula(component.formula, { randomInteger }).total);
    const criticalFormula = component.criticalBonusFormula ?? buildCriticalBonusFormula(component.formula);
    const criticalBonus = critical && criticalFormula
      ? Math.max(0, rollDiceFormula(criticalFormula, { randomInteger }).total)
      : 0;
    const rawDamage = base + criticalBonus;
    const modifiedDamage = Math.floor(rawDamage * damageFraction);
    const multiplier = getFightDamageMultiplier(target, component.damageType);
    return {
      damageType: normalizeFightDamageType(component.damageType),
      rawDamage,
      modifiedDamage,
      appliedDamage: Math.floor(modifiedDamage * multiplier),
      multiplier
    };
  });
  return {
    rawTotal: resolved.reduce((sum, component) => sum + component.rawDamage, 0),
    appliedTotal: resolved.reduce((sum, component) => sum + component.appliedDamage, 0),
    components: resolved
  };
};

export const halfFightDamage = (value: number): number => Math.floor(Math.max(0, value) / 2);