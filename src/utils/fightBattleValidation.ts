import type { FightCombatantProfile } from "../types/fightMatchmaker";

export const getFightBattleProfileIssue = (profile: FightCombatantProfile): string | undefined => {
  if (profile.initiativeBonus === undefined) return `${profile.name} is missing a safe initiative bonus.`;
  if (!profile.attackDamageFormula || !profile.criticalBonusFormula || !profile.sourceActionName) {
    return `${profile.name} is missing an executable canonical attack.`;
  }
  if (!Number.isInteger(profile.attacksPerRound) || profile.attacksPerRound < 1) {
    return `${profile.name} has an invalid attacks-per-round value.`;
  }
  return undefined;
};

export const assertFightBattleProfile = (profile: FightCombatantProfile): void => {
  const issue = getFightBattleProfileIssue(profile);
  if (issue) throw new Error(issue);
};
