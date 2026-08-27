import type {
  FightBalanceSeverity,
  FightCombatantProfile,
  FightFavoredSide,
  FightMatchAssessment,
  FightMatchRecommendation
} from "../types/fightMatchmaker";

const round = (value: number, digits = 2): number => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

const assertCombatant = (profile: FightCombatantProfile): void => {
  const positiveValues = [
    ["armorClass", profile.armorClass],
    ["hitPoints", profile.hitPoints],
    ["attacksPerRound", profile.attacksPerRound],
    ["averageDamageOnHit", profile.averageDamageOnHit]
  ] as const;

  for (const [label, value] of positiveValues) {
    if (!Number.isFinite(value) || value <= 0) {
      throw new Error(`${profile.name} has invalid ${label}: ${value}.`);
    }
  }

  if (!Number.isFinite(profile.attackBonus)) {
    throw new Error(`${profile.name} has invalid attackBonus: ${profile.attackBonus}.`);
  }
};

export const d20HitChance = (attackBonus: number, armorClass: number): number => {
  if (!Number.isFinite(attackBonus) || !Number.isFinite(armorClass)) {
    throw new Error("Attack bonus and Armor Class must be finite numbers.");
  }
  return Math.min(0.95, Math.max(0.05, (21 + attackBonus - armorClass) / 20));
};

export const expectedFightDpr = (
  attacker: FightCombatantProfile,
  defenderArmorClass: number
): number => {
  assertCombatant(attacker);
  const hitChance = d20HitChance(attacker.attackBonus, defenderArmorClass);
  const criticalBonus = Math.max(0, attacker.averageCriticalBonusDamage ?? 0);
  const expectedPerAttack = hitChance * attacker.averageDamageOnHit + 0.05 * criticalBonus;
  return expectedPerAttack * attacker.attacksPerRound;
};

const classifyBalance = (
  characterChance: number,
  characterName: string,
  monsterName: string
): { favoredSide: FightFavoredSide; severity: FightBalanceSeverity; label: string } => {
  const favoredSide: FightFavoredSide = characterChance > 0.55
    ? "character"
    : characterChance < 0.45 ? "monster" : "even";
  const favoriteChance = Math.max(characterChance, 1 - characterChance);
  const severity: FightBalanceSeverity = favoriteChance <= 0.55
    ? "fair"
    : favoriteChance <= 0.70 ? "favored"
      : favoriteChance <= 0.85 ? "brutal" : "stomp";

  if (severity === "fair") return { favoredSide, severity, label: "Fair Fight" };
  const favoriteName = favoredSide === "character" ? characterName : monsterName;
  if (severity === "favored") return { favoredSide, severity, label: `${favoriteName} Favored` };
  if (severity === "brutal") return { favoredSide, severity, label: `Brutal — ${favoriteName} Favored` };
  return { favoredSide, severity, label: `Stomp — ${favoriteName} Favored` };
};

export const assessFightMatch = (
  character: FightCombatantProfile,
  monster: FightCombatantProfile
): FightMatchAssessment => {
  assertCombatant(character);
  assertCombatant(monster);

  const characterDpr = expectedFightDpr(character, monster.armorClass);
  const monsterDpr = expectedFightDpr(monster, character.armorClass);
  const characterRounds = monster.hitPoints / characterDpr;
  const monsterRounds = character.hitPoints / monsterDpr;
  const characterKillRate = characterDpr / monster.hitPoints;
  const monsterKillRate = monsterDpr / character.hitPoints;
  const characterChance = characterKillRate / (characterKillRate + monsterKillRate);
  const balance = classifyBalance(characterChance, character.name, monster.name);
  const rulesetCompatible = character.ruleset === monster.ruleset;
  const underdogChance = Math.min(characterChance, 1 - characterChance);

  const reasons = [
    `${character.name}: ${round(characterDpr)} expected damage/round; ${round(characterRounds)} rounds to defeat ${monster.name}.`,
    `${monster.name}: ${round(monsterDpr)} expected damage/round; ${round(monsterRounds)} rounds to defeat ${character.name}.`
  ];
  if (!rulesetCompatible) {
    reasons.push("Cross-edition custom fight: RAW statistics are preserved, but the matchup is not recommended.");
  }

  return {
    characterId: character.id,
    monsterId: monster.id,
    characterWinChance: round(characterChance, 4),
    monsterWinChance: round(1 - characterChance, 4),
    ...balance,
    recommended: rulesetCompatible && underdogChance >= 0.35,
    rulesetCompatible,
    characterExpectedDpr: round(characterDpr),
    monsterExpectedDpr: round(monsterDpr),
    characterRoundsToDefeatMonster: round(characterRounds),
    monsterRoundsToDefeatCharacter: round(monsterRounds),
    reasons
  };
};

export const rankFightOpponents = (
  character: FightCombatantProfile,
  opponents: FightCombatantProfile[],
  limit = 5
): FightMatchRecommendation[] => {
  if (!Number.isInteger(limit) || limit <= 0) throw new Error("Recommendation limit must be a positive integer.");

  return opponents
    .filter((opponent) => opponent.ruleset === character.ruleset)
    .map((opponent) => ({ opponent, assessment: assessFightMatch(character, opponent) }))
    .sort((left, right) => {
      const leftDistance = Math.abs(left.assessment.characterWinChance - 0.5);
      const rightDistance = Math.abs(right.assessment.characterWinChance - 0.5);
      return leftDistance - rightDistance || left.opponent.name.localeCompare(right.opponent.name);
    })
    .slice(0, limit);
};
