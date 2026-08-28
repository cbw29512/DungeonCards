import type { DndAbilityId } from "./dndCharacter";
import type {
  FightActionDefinition,
  FightAttackFollowUpDefinition,
  FightFailedAttackRerollDefinition,
  FightFailedSaveRerollDefinition,
  FightPostCriticalMovementDefinition,
  FightResourceDefinition,
  FightRollMode,
  FightTurnStartHealingDefinition,
  FightTurnStartResourceGrantDefinition
} from "./fightRules";
import type { RulesetId } from "./ruleCards";

export type FightCombatantProfile = {
  id: string;
  name: string;
  ruleset: RulesetId;
  armorClass: number;
  hitPoints: number;
  attackBonus: number;
  attacksPerRound: number;
  averageDamageOnHit: number;
  averageCriticalBonusDamage?: number;
  initiativeBonus?: number;
  initiativeRollMode?: FightRollMode;
  attackDamageFormula?: string;
  criticalBonusFormula?: string;
  sourceActionName?: string;
  attackDelivery?: "weapon" | "spell";
  speedFeet?: number;
  savingThrowBonuses?: Partial<Record<DndAbilityId, number>>;
  failedSaveRerolls?: FightFailedSaveRerollDefinition[];
  failedAttackRerolls?: FightFailedAttackRerollDefinition[];
  attackFollowUps?: FightAttackFollowUpDefinition[];
  turnStartResourceGrants?: FightTurnStartResourceGrantDefinition[];
  turnStartHealing?: FightTurnStartHealingDefinition[];
  postCriticalMovement?: FightPostCriticalMovementDefinition[];
  damageResistances?: string[];
  damageImmunities?: string[];
  damageVulnerabilities?: string[];
  conditionImmunities?: string[];
  actions?: FightActionDefinition[];
  resources?: FightResourceDefinition[];
  level?: number;
  challengeRating?: number;
};

export type FightProfileBuildResult =
  | { ok: true; profile: FightCombatantProfile; sourceActionName: string }
  | { ok: false; issues: string[] };

export type FightFavoredSide = "character" | "monster" | "even";
export type FightBalanceSeverity = "fair" | "favored" | "brutal" | "stomp";

export type FightMatchAssessment = {
  characterId: string;
  monsterId: string;
  characterWinChance: number;
  monsterWinChance: number;
  favoredSide: FightFavoredSide;
  severity: FightBalanceSeverity;
  label: string;
  recommended: boolean;
  rulesetCompatible: boolean;
  characterExpectedDpr: number;
  monsterExpectedDpr: number;
  characterRoundsToDefeatMonster: number;
  monsterRoundsToDefeatCharacter: number;
  reasons: string[];
};

export type FightMatchRecommendation = {
  opponent: FightCombatantProfile;
  assessment: FightMatchAssessment;
};
