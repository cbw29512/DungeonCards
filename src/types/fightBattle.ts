import type { FightCombatantProfile } from "./fightMatchmaker";

export type FightSide = "character" | "monster";
export type FightBattleStatus = "ready" | "initiative-tie" | "active" | "complete";
export type FightAttackOutcome = "miss" | "hit" | "critical";

export type FightBattleCombatantState = {
  profile: FightCombatantProfile;
  currentHitPoints: number;
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
};
