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
  level?: number;
  challengeRating?: number;
};

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
