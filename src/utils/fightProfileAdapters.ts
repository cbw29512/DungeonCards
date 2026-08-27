import type { DndCharacterAttack, DndCharacterRecord } from "../types/dndCharacter";
import type { FightCombatantProfile, FightProfileBuildResult } from "../types/fightMatchmaker";
import type { SrdMonsterRecord } from "../types/srdCompendium";
import { d20HitChance } from "./fightMatchmaker";

const abilityModifier = (score: number): number => Math.floor((score - 10) / 2);
const proficiencyBonus = (level: number): number => 2 + Math.floor((level - 1) / 4);

type FormulaAverage = { average: number; diceAverage: number };

export const averageDiceFormula = (formula: string): FormulaAverage | null => {
  const normalized = formula.replaceAll(" ", "").toLowerCase();
  const terms = normalized.match(/[+-]?[^+-]+/g);
  if (!terms?.length || terms.join("") !== normalized) return null;

  let average = 0;
  let diceAverage = 0;
  for (const rawTerm of terms) {
    const sign = rawTerm.startsWith("-") ? -1 : 1;
    const term = rawTerm.replace(/^[+-]/, "");
    const dice = term.match(/^(\d*)d(\d+)$/);
    if (dice) {
      const count = Number(dice[1] || "1");
      const sides = Number(dice[2]);
      if (!Number.isInteger(count) || count <= 0 || !Number.isInteger(sides) || sides <= 1) return null;
      const value = sign * count * ((sides + 1) / 2);
      average += value;
      diceAverage += value;
      continue;
    }
    if (!/^\d+(?:\.\d+)?$/.test(term)) return null;
    average += sign * Number(term);
  }
  return average > 0 && diceAverage > 0 ? { average, diceAverage } : null;
};

const fighterAttacksPerRound = (character: DndCharacterRecord): number => {
  if (character.classId !== "fighter") return 1;
  if (character.level >= 20) return 4;
  if (character.level >= 11) return 3;
  if (character.level >= 5) return 2;
  return 1;
};

const characterAttackProfile = (
  character: DndCharacterRecord,
  attack: DndCharacterAttack
): FightCombatantProfile | null => {
  const damage = averageDiceFormula(attack.damageFormula);
  if (!damage) return null;
  return {
    id: character.id,
    name: character.name,
    ruleset: character.ruleset,
    armorClass: character.armorClass,
    hitPoints: character.maximumHitPoints,
    attackBonus: abilityModifier(character.abilityScores[attack.attackAbility])
      + (attack.proficient ? proficiencyBonus(character.level) : 0),
    attacksPerRound: fighterAttacksPerRound(character),
    averageDamageOnHit: damage.average,
    averageCriticalBonusDamage: damage.diceAverage,
    level: character.level
  };
};

export const buildCharacterFightProfile = (character: DndCharacterRecord): FightProfileBuildResult => {
  const candidates = character.attacks.flatMap((attack) => {
    const profile = characterAttackProfile(character, attack);
    return profile ? [{ attack, profile }] : [];
  });
  if (!candidates.length) {
    return { ok: false, issues: [`${character.name} has no attack with a safely parseable damage formula.`] };
  }

  const best = candidates.toSorted((left, right) => {
    const leftScore = d20HitChance(left.profile.attackBonus, 15) * left.profile.averageDamageOnHit;
    const rightScore = d20HitChance(right.profile.attackBonus, 15) * right.profile.averageDamageOnHit;
    return rightScore - leftScore;
  })[0];
  return { ok: true, profile: best.profile, sourceActionName: best.attack.name };
};

const parseNumber = (value: string): number | null => {
  const match = value.match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : null;
};

const parseChallenge = (value: string): number | undefined => {
  const fraction = value.match(/(\d+)\s*\/\s*(\d+)/);
  if (fraction) return Number(fraction[1]) / Number(fraction[2]);
  return parseNumber(value) ?? undefined;
};

const parseMonsterAttack = (line: string, monster: SrdMonsterRecord): { name: string; profile: FightCombatantProfile } | null => {
  const name = line.match(/^([^.!?]+)\./)?.[1]?.trim();
  const attackBonus = line.match(/([+-]\d+)\s+to hit/i);
  const hit = line.match(/Hit:\s*(\d+)\s*\(([^)]+)\)/i);
  if (!name || !attackBonus || !hit) return null;
  if (/\bplus\b/i.test(line.slice((hit.index ?? 0) + hit[0].length))) return null;

  const damage = averageDiceFormula(hit[2]);
  const armorClass = parseNumber(monster.armorClass);
  const hitPoints = parseNumber(monster.hitPoints);
  if (!damage || armorClass === null || hitPoints === null) return null;

  return {
    name,
    profile: {
      id: monster.id,
      name: monster.name,
      ruleset: monster.edition,
      armorClass,
      hitPoints,
      attackBonus: Number(attackBonus[1]),
      attacksPerRound: 1,
      averageDamageOnHit: Number(hit[1]),
      averageCriticalBonusDamage: damage.diceAverage,
      challengeRating: parseChallenge(monster.challenge)
    }
  };
};

export const buildSrdMonsterFightProfile = (monster: SrdMonsterRecord): FightProfileBuildResult => {
  if (/\bMultiattack\b/i.test(monster.actions)) {
    return { ok: false, issues: [`${monster.name} uses Multiattack; no safe duel profile is emitted until component attacks are automated.`] };
  }
  const candidates = monster.actions.split(/\n+/).flatMap((line) => {
    const parsed = parseMonsterAttack(line.trim(), monster);
    return parsed ? [parsed] : [];
  });
  if (!candidates.length) {
    return { ok: false, issues: [`${monster.name} has no high-confidence basic attack for matchmaking.`] };
  }

  const best = candidates.toSorted((left, right) => {
    const leftScore = d20HitChance(left.profile.attackBonus, 15) * left.profile.averageDamageOnHit;
    const rightScore = d20HitChance(right.profile.attackBonus, 15) * right.profile.averageDamageOnHit;
    return rightScore - leftScore;
  })[0];
  return { ok: true, profile: best.profile, sourceActionName: best.name };
};
