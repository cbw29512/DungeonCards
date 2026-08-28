import { describe, expect, it } from "vitest";
import type { FightBattleCombatantState } from "../types/fightBattle";
import type { FightCombatantProfile } from "../types/fightMatchmaker";
import {
  getFightPartySimulationIssue,
  simulateFightPartyMatchup,
  stripFightPartyConcentrationEffects
} from "./fightPartySimulation";

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

const combatant = (name: string, id: string): FightBattleCombatantState => ({
  combatantId: id,
  profile: profile(name),
  currentHitPoints: 30,
  temporaryHitPoints: 0,
  effects: [],
  resources: {},
  rechargeReady: {},
  economy: { actionsAvailable: 1, bonusActionsAvailable: 1, reactionAvailable: true, movementRemainingFeet: 30 }
});

describe("Fight Cards party simulation", () => {
  it("keeps each hero independent and produces a reproducible party report", () => {
    const heroes = [
      profile("Fighter", { hitPoints: 42, armorClass: 18 }),
      profile("Rogue", { hitPoints: 26, initiativeBonus: 4, attackDamageFormula: "1d8+4", criticalBonusFormula: "1d8" }),
      profile("Barbarian", { hitPoints: 50, attackDamageFormula: "1d12+4", criticalBonusFormula: "1d12" })
    ];
    const monster = profile("Ogre", { hitPoints: 70, armorClass: 11, attackBonus: 6, attackDamageFormula: "2d8+4", criticalBonusFormula: "2d8" });

    const first = simulateFightPartyMatchup({ heroes, monster, iterations: 100, seed: 4242 });
    const second = simulateFightPartyMatchup({ heroes, monster, iterations: 100, seed: 4242 });

    expect(first).toEqual(second);
    expect(first.partyWins + first.monsterWins + first.unresolved).toBe(100);
    expect(first.heroSurvival).toHaveLength(3);
    expect(first.heroSurvival.map((hero) => hero.name)).toEqual(["Fighter", "Rogue", "Barbarian"]);
    expect(first.medianRounds).toBeGreaterThan(0);
  });

  it("supports a focus-fire monster policy without merging party hit points", () => {
    const heroes = [
      profile("Tank", { armorClass: 20, hitPoints: 60 }),
      profile("Scout", { armorClass: 13, hitPoints: 15 })
    ];
    const monster = profile("Hunter", { attackBonus: 12, attackDamageFormula: "2d10+6", criticalBonusFormula: "2d10" });

    const result = simulateFightPartyMatchup({
      heroes,
      monster,
      iterations: 80,
      seed: 99,
      targetPolicy: "focus-lowest-hp"
    });

    expect(result.targetPolicy).toBe("focus-lowest-hp");
    expect(result.heroSurvival[1].survivalRate).toBeLessThanOrEqual(result.heroSurvival[0].survivalRate);
    expect(result.partyWins + result.monsterWins + result.unresolved).toBe(80);
  });

  it("allows concentration-dependent party profiles now that owners are keyed to combatant identity", () => {
    const concentrating = profile("Caster", {
      actions: [{
        id: "hold",
        name: "Hold",
        kind: "save",
        economy: "action",
        delivery: "spell",
        rangeFeet: 60,
        requiresConcentration: true,
        saveAbility: "wis",
        saveDc: 13,
        effectsOnFailure: [{
          id: "restrained",
          name: "Restrained",
          kind: "condition",
          concentrationLinked: true
        }]
      }]
    });
    const monster = profile("Monster");

    expect(getFightPartySimulationIssue([concentrating], monster)).toBeUndefined();
    const result = simulateFightPartyMatchup({ heroes: [concentrating], monster, iterations: 10, seed: 712 });
    expect(result.partyWins + result.monsterWins + result.unresolved).toBe(10);
  });

  it("removes only effects owned by the combatant whose concentration ended", () => {
    const target = combatant("Target", "hero:target:0");
    target.effects = [
      {
        id: "hero-one-hold",
        name: "Held by Hero One",
        kind: "condition",
        tickTiming: "manual",
        concentrationOwnerId: "hero:one:0"
      },
      {
        id: "hero-two-bane",
        name: "Bane from Hero Two",
        kind: "debuff",
        tickTiming: "manual",
        concentrationOwnerId: "hero:two:1"
      }
    ];

    const stripped = stripFightPartyConcentrationEffects(target, "hero:one:0");
    expect(stripped.effects.map((effect) => effect.id)).toEqual(["hero-two-bane"]);
  });

  it("rejects silent cross-edition party mixing", () => {
    const hero = profile("Hero", { ruleset: "srd-5.1-2014" });
    const monster = profile("Monster");
    expect(getFightPartySimulationIssue([hero], monster)).toMatch(/same ruleset/i);
  });
});
