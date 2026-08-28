import type { FightBattleCombatantState } from "../types/fightBattle";
import type { FightCombatantProfile } from "../types/fightMatchmaker";
import type { FightDamageComponent, FightRollMode } from "../types/fightRules";
import type { RandomIntegerSource } from "./randomInteger";
import { parseDiceFormula } from "./diceParser";
import { buildCriticalBonusFormula } from "./fightExecutionProfile";
import { rollDiceFormula } from "./rollDice";

export type FightCriticalDamageRule = "standard-extra-dice" | "heroic-max-plus-roll";

/**
 * Fight Cards' presentation default. This is an explicit house rule, not
 * D&D 2024 RAW. RAW conformance tests pass `standard-extra-dice` directly.
 */
export const FIGHT_CARDS_DEFAULT_CRITICAL_DAMAGE_RULE: FightCriticalDamageRule = "heroic-max-plus-roll";

const normalizeList = (values: string[] | undefined): string[] =>
  (values ?? []).map((value) => value.trim().toLowerCase()).filter(Boolean);

export const normalizeFightDamageType = (value: string): string => value.trim().toLowerCase();
const normalizeEffectKey = (value: string): string => value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
const effectKeys = (combatant: FightBattleCombatantState): Set<string> => new Set(
  combatant.effects.flatMap((effect) => [normalizeEffectKey(effect.id), normalizeEffectKey(effect.name)])
);
const hasEffect = (keys: Set<string>, value: string): boolean => keys.has(normalizeEffectKey(value));

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
  actionMode?: FightRollMode,
  distanceFeet = 5
): FightRollMode => {
  const attackerEffects = effectKeys(attacker);
  const targetEffects = effectKeys(target);
  const standardModes: FightRollMode[] = [];

  if (["blinded", "poisoned", "frightened", "restrained", "prone"].some((effect) => hasEffect(attackerEffects, effect))) {
    standardModes.push("disadvantage");
  }
  if (hasEffect(attackerEffects, "invisible")) standardModes.push("advantage");

  if (["blinded", "restrained", "paralyzed", "stunned", "unconscious"].some((effect) => hasEffect(targetEffects, effect))) {
    standardModes.push("advantage");
  }
  if (hasEffect(targetEffects, "invisible")) standardModes.push("disadvantage");
  if (hasEffect(targetEffects, "prone")) standardModes.push(distanceFeet <= 5 ? "advantage" : "disadvantage");

  return combineFightRollModes(
    actionMode,
    ...attacker.effects.map((effect) => effect.attackRollMode),
    ...target.effects.map((effect) => effect.attacksAgainstRollMode),
    ...standardModes
  );
};

export const fightSaveRollMode = (target: FightBattleCombatantState): FightRollMode =>
  combineFightRollModes(...target.effects.map((effect) => effect.saveRollMode));

export const isFightIncapacitated = (combatant: FightBattleCombatantState): boolean => {
  const keys = effectKeys(combatant);
  return ["incapacitated", "paralyzed", "stunned", "unconscious"].some((effect) => hasEffect(keys, effect));
};

export const fightMovementAllowance = (combatant: FightBattleCombatantState): number => {
  const keys = effectKeys(combatant);
  if (["grappled", "restrained", "paralyzed", "stunned", "unconscious"].some((effect) => hasEffect(keys, effect))) return 0;
  return Math.max(0, combatant.profile.speedFeet ?? 30);
};

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

export const maximumFightCriticalDice = (formula: string): number => {
  const parsed = parseDiceFormula(formula);
  if (parsed.diceTerms.some((term) => term.sign < 0)) {
    throw new Error("Heroic critical damage does not support subtractive critical dice.");
  }
  return parsed.diceTerms.reduce((sum, term) => (
    sum + (term.keep?.count ?? term.count) * term.sides
  ), 0);
};

export const rollFightDamageComponents = ({
  target,
  components,
  critical,
  criticalDamageRule = FIGHT_CARDS_DEFAULT_CRITICAL_DAMAGE_RULE,
  damageFraction = 1,
  randomInteger
}: {
  target: FightCombatantProfile;
  components: FightDamageComponent[];
  critical: boolean;
  criticalDamageRule?: FightCriticalDamageRule;
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
      ? criticalDamageRule === "heroic-max-plus-roll"
        ? maximumFightCriticalDice(criticalFormula)
        : Math.max(0, rollDiceFormula(criticalFormula, { randomInteger }).total)
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
