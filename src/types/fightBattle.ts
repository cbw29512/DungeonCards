import type { FightCombatantProfile } from "./fightMatchmaker";

export type FightSide = "character" | "monster";
export type FightBattleStatus = "ready" | "initiative-tie" | "active" | "complete";
export type FightAttackOutcome = "miss" | "hit" | "critical";
export type FightEffectKind = "condition" | "buff" | "debuff";
export type FightEffectTickTiming = "start" | "end" | "manual";

export type FightPresentationEventType =
  | "hit"
  | "miss"
  | "critical"
  | "save-success"
  | "save-failure"
  | "healing"
  | "temporary-hit-points"
  | "effect-applied"
  | "effect-removed"
  | "concentration-started"
  | "concentration-broken"
  | "downed";

export type FightPresentationDelivery = "weapon" | "spell" | "condition" | "buff" | "debuff" | "system";

export type FightPresentationEvent = {
  id: number;
  round: number;
  type: FightPresentationEventType;
  delivery: FightPresentationDelivery;
  side: FightSide;
  sourceSide?: FightSide;
  label: string;
  iconKey?: string;
  sourceName?: string;
  amount?: number;
  saveAbility?: string;
  saveDc?: number;
  saveTotal?: number;
};

export type FightConcentrationState = {
  sourceName: string;
};

export type FightEffectState = {
  id: string;
  name: string;
  kind: FightEffectKind;
  iconKey?: string;
  sourceName?: string;
  remainingRounds?: number;
  tickTiming: FightEffectTickTiming;
  saveAbility?: string;
  saveDc?: number;
  concentrationOwner?: FightSide;
};

export type FightBattleCombatantState = {
  profile: FightCombatantProfile;
  currentHitPoints: number;
  temporaryHitPoints?: number;
  concentration?: FightConcentrationState;
  effects: FightEffectState[];
};

export type FightInitiativeState = {
  characterNaturalRoll: number;
  characterTotal: number;
  monsterNaturalRoll: number;
  monsterTotal: number;
  order?: readonly [FightSide, FightSide];
};

export type FightAttackEvent = {
  id: number;
  round: number;
  attacker: FightSide;
  target: FightSide;
  attackNumber: number;
  sourceActionName: string;
  naturalRoll: number;
  attackTotal: number;
  outcome: FightAttackOutcome;
  damage: number;
  temporaryHitPointsAbsorbed?: number;
  targetHitPointsAfter: number;
  summary: string;
};

export type FightBattleState = {
  status: FightBattleStatus;
  round: number;
  activeIndex: 0 | 1;
  initiative?: FightInitiativeState;
  character: FightBattleCombatantState;
  monster: FightBattleCombatantState;
  winner?: FightSide;
  events: FightAttackEvent[];
  presentationEvents?: FightPresentationEvent[];
};
