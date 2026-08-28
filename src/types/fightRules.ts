import type { DndAbilityId } from "./dndCharacter";
import type { AdvantageMode } from "./ruleCards";

export type FightRollMode = AdvantageMode;
export type FightActionEconomy = "action" | "bonus-action" | "reaction" | "free";
export type FightActionDelivery = "weapon" | "spell";
export type FightAttackMode = "melee" | "ranged";
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
  shortRestRecovery?: number | "all";
  longRestRecovery?: number | "all";
};

export type FightFailedSaveRerollDefinition = {
  id: string;
  name: string;
  resourceId: string;
  /** Added to the ordinary saving-throw modifier on the reroll. */
  bonus: number;
  /** Auto-combat policy. RAW still owns whether the feature is optional. */
  autoUse: "when-can-succeed" | "always";
};

export type FightFailedAttackRerollDefinition = {
  id: string;
  name: string;
  resourceId: string;
  /** Auto-combat policy. RAW still owns whether the reroll is optional. */
  autoUse: "when-can-hit" | "always";
};

export type FightTurnStartResourceGrantDefinition = {
  id: string;
  name: string;
  resourceId: string;
  amount: number;
  /** Grant only when the tracked resource is below its profile maximum. */
  when: "missing";
};

export type FightTurnStartHealingDefinition = {
  id: string;
  name: string;
  amount: number;
  minimumHitPoints: number;
  /** Trigger when current HP is at or below this fraction of maximum HP. */
  maximumHitPointFraction: number;
};

export type FightPostCriticalMovementDefinition = {
  id: string;
  name: string;
  maximumFeet: number;
  opportunityAttackSafe: boolean;
  /** Conservative duel policy; RAW still allows any movement up to the maximum. */
  autoUse: "retreat-ranged-without-leaving-normal-range";
};

/**
 * A target-specific benefit created by one attack roll and consumed by a later
 * attack roll. Studied Attacks is the first user; this shape also supports
 * future RAW mechanics such as Vex without baking class names into the engine.
 */
export type FightAttackFollowUpDefinition = {
  id: string;
  name: string;
  trigger: "miss" | "hit-and-damage";
  rollMode: FightRollMode;
  target: "same-creature";
  expires: "end-of-next-turn";
};

type FightActionBase = {
  id: string;
  name: string;
  economy: FightActionEconomy;
  delivery?: FightActionDelivery;
  resourceCosts?: FightActionResourceCost[];
  recharge?: FightRechargeDefinition;
  /** Maximum ordinary range/reach for the action. */
  rangeFeet?: number;
  requiresConcentration?: boolean;
};

export type FightAttackAction = FightActionBase & {
  kind: "attack";
  /** Explicit attack mode when the source distinguishes melee from ranged. */
  attackMode?: FightAttackMode;
  /** Ranged-weapon long range. Attacks beyond rangeFeet and through this value have Disadvantage. */
  longRangeFeet?: number;
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
  movementGrantedFeet?: number;
};

export type FightTemporaryHitPointsAction = FightActionBase & {
  kind: "temporary-hit-points";
  formula: string;
  target: "self";
};

export type FightGrantAction = FightActionBase & {
  kind: "grant-action";
  grants: "action";
  excludedDelivery?: FightActionDelivery;
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
