import { describe, expect, it } from "vitest";
import type { FightCombatantProfile } from "../types/fightMatchmaker";
import { assessFightMatch, d20HitChance, rankFightOpponents } from "./fightMatchmaker";

const profile = (
  overrides: Partial<FightCombatantProfile> & Pick<FightCombatantProfile, "id" | "name">
): FightCombatantProfile => ({
  ruleset: "srd-5.1-2014",
  armorClass: 15,
  hitPoints: 30,
  attackBonus: 5,
  attacksPerRound: 1,
  averageDamageOnHit: 8,
  averageCriticalBonusDamage: 4.5,
  ...overrides
});

const carnar = profile({
  id: "carnar-3",
  name: "Carnar",
  armorClass: 18,
  hitPoints: 28,
  attackBonus: 5,
  averageDamageOnHit: 7.5,
  averageCriticalBonusDamage: 4.5,
  level: 3
});

const bob = profile({
  id: "bob-minotaur",
  name: "Bob the Minotaur",
  armorClass: 14,
  hitPoints: 76,
  attackBonus: 6,
  averageDamageOnHit: 17,
  averageCriticalBonusDamage: 13,
  challengeRating: 3
});

describe("fight matchmaker", () => {
  it("honors natural 1 and natural 20 hit bounds", () => {
    expect(d20HitChance(100, 10)).toBe(0.95);
    expect(d20HitChance(-100, 30)).toBe(0.05);
    expect(d20HitChance(5, 15)).toBe(0.55);
  });

  it("marks statistically even combatants as a recommended fair fight", () => {
    const hero = profile({ id: "hero", name: "Hero" });
    const rival = profile({ id: "rival", name: "Rival" });
    const assessment = assessFightMatch(hero, rival);

    expect(assessment.characterWinChance).toBe(0.5);
    expect(assessment.monsterWinChance).toBe(0.5);
    expect(assessment.severity).toBe("fair");
    expect(assessment.label).toBe("Fair Fight");
    expect(assessment.recommended).toBe(true);
  });

  it("rates Carnar versus the SRD-style minotaur as a brutal Bob-favored duel", () => {
    const assessment = assessFightMatch(carnar, bob);

    expect(assessment.characterWinChance).toBeCloseTo(0.1734, 4);
    expect(assessment.monsterWinChance).toBeCloseTo(0.8266, 4);
    expect(assessment.severity).toBe("brutal");
    expect(assessment.favoredSide).toBe("monster");
    expect(assessment.label).toBe("Brutal — Bob the Minotaur Favored");
    expect(assessment.recommended).toBe(false);
  });

  it("allows absurd custom fights while honestly labeling a stomp", () => {
    const goblin = profile({
      id: "goblin",
      name: "Goblin",
      armorClass: 15,
      hitPoints: 7,
      attackBonus: 4,
      averageDamageOnHit: 5.5,
      averageCriticalBonusDamage: 3.5
    });
    const champion = profile({
      id: "level-20-fighter",
      name: "Level 20 Fighter",
      armorClass: 20,
      hitPoints: 190,
      attackBonus: 11,
      attacksPerRound: 4,
      averageDamageOnHit: 11.5,
      averageCriticalBonusDamage: 6.5,
      level: 20
    });

    const assessment = assessFightMatch(champion, goblin);
    expect(assessment.characterWinChance).toBeGreaterThan(0.85);
    expect(assessment.severity).toBe("stomp");
    expect(assessment.favoredSide).toBe("character");
    expect(assessment.recommended).toBe(false);
  });

  it("assesses cross-edition custom fights but never recommends them", () => {
    const revisedMonster = profile({
      id: "revised-monster",
      name: "Revised Monster",
      ruleset: "srd-5.2.1-2024"
    });
    const assessment = assessFightMatch(carnar, revisedMonster);

    expect(assessment.rulesetCompatible).toBe(false);
    expect(assessment.recommended).toBe(false);
    expect(assessment.characterWinChance + assessment.monsterWinChance).toBe(1);
    expect(assessment.reasons.at(-1)).toContain("Cross-edition custom fight");
  });

  it("ranks same-edition opponents by closeness to an even duel without mutating inputs", () => {
    const even = profile({ id: "even", name: "Even" });
    const tough = profile({ id: "tough", name: "Tough", hitPoints: 80, averageDamageOnHit: 14 });
    const revised = profile({ id: "revised", name: "Revised", ruleset: "srd-5.2.1-2024" });
    const candidates = [tough, revised, even];
    const snapshot = structuredClone(candidates);

    const ranked = rankFightOpponents(profile({ id: "hero", name: "Hero" }), candidates);

    expect(ranked.map(({ opponent }) => opponent.id)).toEqual(["even", "tough"]);
    expect(candidates).toEqual(snapshot);
  });

  it("rejects invalid combat profiles instead of fabricating an assessment", () => {
    const invalid = profile({ id: "invalid", name: "Invalid", hitPoints: 0 });
    expect(() => assessFightMatch(invalid, bob)).toThrow(/invalid hitPoints/);
  });
});
