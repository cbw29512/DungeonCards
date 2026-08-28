import type { DndAbilityId } from "./dndCharacter";
import type { AdvantageMode } from "./ruleCards";

export type FightRollMode = AdvantageMode;
export type FightActionEconomy = "action" | "bonus-action" | "reaction" | "free";
export type FightActionDelivery = "weapon" | "spell";
export type FightEffectKindValue = "condition" | "buff" | "debuff";
export type FightEffectTickTimingValue = "start" | "end" | "manual";

export type FightDamageType =
  | "acid"
  | "bludgeoning"
  | "cold"
  | "fire"
  | "force"
  | "lightning"
  | "necrotic"
  | "piercing"
  | "poison"
  | "psychic"
  | "radiant"
  | "slashing"
  | "thunder"
  | string;

export type FightDamageComponent = {
  formula: string;
  damageType: FightDamageType;
  criticalBonusFormula?: string;
};

export type FightActionEffectDefinition = {
  id: string;
  name: string;
  kind: FightEffectKindValue;
  iconKey?: string;
  sourceName?: string;
  remainingRounds?: number;
  tickTiming?: FightEffectTickTimingValue;
  saveAbility?: DndAbilityId;
  saveDc?: number;
  saveTiming?: FightEffectTickTimingValue;
  concentrationLinked?: boolean;
  attackRollMode?: FightRollMode;
  attacksAgainstRollMode?: FightRollMode;
  saveRollMode?: FightRollMode;
};

export type FightActionResourceCost = {
  resourceId: string;
  amount: number;
};

export type FightRechargeDefinition = {
  minimum: number;
  dieSides?: number;
  initiallyReady?: boolean;
};

export type FightResourceDefinition = {
  id: string;
  name: string;
  maximum: number;
  initial?: number;
  refresh: "turn" | "round" | "short-rest" | "long-rest" | "manual" | "none";
};

type FightActionBase = {
  id: string;
  name: string;
  economy: FightActionEconomy;
  delivery?: FightActionDelivery;
  resourceCosts?: FightActionResourceCost[];
  recharge?: FightRechargeDefinition;
  rangeFeet?: number;
  requiresConcentration?: boolean;
};

export type FightAttackAction = FightActionBase & {
  kind: "attack";
  attackBonus: number;
  attackRollMode?: FightRollMode;
  criticalAt?: number;
  damage: FightDamageComponent[];
  effectsOnHit?: FightActionEffectDefinition[];
};

export type FightSaveAction = FightActionBase & {
  kind: "save";
  saveAbility: DndAbilityId;
  saveDc: number;
  damage?: FightDamageComponent[];
  damageOnSuccess?: "none" | "half" | "full";
  effectsOnFailure?: FightActionEffectDefinition[];
  effectsOnSuccess?: FightActionEffectDefinition[];
};

export type FightHealAction = FightActionBase & {
  kind: "heal";
  formula: string;
  target: "self";
};

export type FightTemporaryHitPointsAction = FightActionBase & {
  kind: "temporary-hit-points";
  formula: string;
  target: "self";
};

export type FightGrantAction = FightActionBase & {
  kind: "grant-action";
  grants: "action";
};

export type FightMultiattackStep = {
  actionId: string;
  count: number;
};

export type FightMultiattackAction = FightActionBase & {
  kind: "multiattack";
  sequence: FightMultiattackStep[];
};

export type FightActionDefinition =
  | FightAttackAction
  | FightSaveAction
  | FightHealAction
  | FightTemporaryHitPointsAction
  | FightGrantAction
  | FightMultiattackAction;