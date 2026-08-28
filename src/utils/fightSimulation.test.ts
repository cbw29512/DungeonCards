import { describe, expect, it } from "vitest";
import type { FightCombatantProfile } from "../types/fightMatchmaker";
import {
  createSeededFightRandomInteger,
  simulateFightMatchup,
  stableFightSimulationSeed
} from "./fightSimulation";

const profile = (name: string, overrides: Partial<FightCombatantProfile> = {}): FightCombatantProfile => ({
  id: name.toLowerCase(),
  name,
  ruleset: "srd-5.2.1-2024",
  armorClass: 14,
  hitPoints: 30,
  attackBonus: 5,
  attacksPerRound: 1,
  averageDamageOnHit: 7.5,
  initiativeBonus: 2,
  attackDamageFormula: "1d8+3",
  criticalBonusFormula: "1d8",
  sourceActionName: "Longsword",
  speedFeet: 30,
  ...overrides
});

describe("Fight Cards matchup simulation", () => {
  it("creates deterministic bounded random integers from a seed", () => {
    const first = createSeededFightRandomInteger(12345);
    const second = createSeededFightRandomInteger(12345);
    const firstSequence = Array.from({ length: 8 }, () => first(1, 20));
    const secondSequence = Array.from({ length: 8 }, () => second(1, 20));

    expect(firstSequence).toEqual(secondSequence);
    expect(firstSequence.every((value) => value >= 1 && value <= 20)).toBe(true);
  });

  it("returns the same average-fight report for the same matchup, sample size, seed, and encounter-distance mix", () => {
    const hero = profile("Hero");
    const monster = profile("Monster", { initiativeBonus: 0 });
    const seed = stableFightSimulationSeed(hero.id, monster.id, hero.ruleset, "30,60,90");

    const first = simulateFightMatchup({ character: hero, monster, iterations: 99, seed });
    const second = simulateFightMatchup({ character: hero, monster, iterations: 99, seed });

    expect(first).toEqual(second);
    expect(first.iterations).toBe(99);
    expect(first.startingDistancesFeet).toEqual([30, 60, 90]);
    expect(first.characterWins + first.monsterWins + first.unresolved).toBe(99);
    expect(first.averageRounds).toBeGreaterThan(0);
    expect(first.medianRounds).toBeGreaterThan(0);
  });

  it("supports a DM-specified starting distance without changing either combatant profile", () => {
    const hero = profile("Hero");
    const monster = profile("Monster");
    const beforeHero = structuredClone(hero);
    const beforeMonster = structuredClone(monster);

    const result = simulateFightMatchup({
      character: hero,
      monster,
      iterations: 12,
      startingDistancesFeet: [120],
      seed: 91
    });

    expect(result.startingDistancesFeet).toEqual([120]);
    expect(hero).toEqual(beforeHero);
    expect(monster).toEqual(beforeMonster);
  });

  it("uses the actual battle engine strongly enough to reflect an overwhelming matchup", () => {
    const hero = profile("Hero", {
      armorClass: 25,
      hitPoints: 100,
      attackBonus: 20,
      attackDamageFormula: "2d8+10",
      criticalBonusFormula: "2d8",
      averageDamageOnHit: 19
    });
    const monster = profile("Monster", {
      armorClass: 10,
      hitPoints: 10,
      attackBonus: 0,
      attackDamageFormula: "1d4",
      criticalBonusFormula: "1d4",
      averageDamageOnHit: 2.5,
      initiativeBonus: 0
    });

    const result = simulateFightMatchup({ character: hero, monster, iterations: 198, seed: 77 });

    expect(result.characterWinRate).toBeGreaterThan(95);
    expect(result.unresolved).toBe(0);
    expect(result.averageCharacterHitPointsOnWin).toBeGreaterThan(0);
  });
});
