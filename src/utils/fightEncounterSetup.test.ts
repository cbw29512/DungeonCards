import { describe, expect, it } from "vitest";
import type { FightCombatantProfile } from "../types/fightMatchmaker";
import { createFightBattle, fightBattleDistanceFeet } from "./fightBattle";
import {
  FIGHT_AVERAGE_STARTING_DISTANCES_FEET,
  FIGHT_WATCHED_STARTING_DISTANCE_FEET,
  fightStartingDistanceForIteration,
  normalizeFightStartingDistances,
  setFightStartingDistance
} from "./fightEncounterSetup";

const profile = (name: string): FightCombatantProfile => ({
  id: name.toLowerCase(),
  name,
  ruleset: "srd-5.2.1-2024",
  armorClass: 15,
  hitPoints: 30,
  attackBonus: 5,
  attacksPerRound: 1,
  averageDamageOnHit: 7.5,
  initiativeBonus: 2,
  attackDamageFormula: "1d8+3",
  criticalBonusFormula: "1d8",
  sourceActionName: "Longsword",
  speedFeet: 30
});

describe("Fight Cards encounter setup", () => {
  it("uses a non-melee watched-fight default and a multi-distance average baseline", () => {
    expect(FIGHT_WATCHED_STARTING_DISTANCE_FEET).toBe(30);
    expect(FIGHT_AVERAGE_STARTING_DISTANCES_FEET).toEqual([30, 60, 90]);
  });

  it("cycles average simulations evenly through configured starting distances", () => {
    expect(Array.from({ length: 6 }, (_, index) => fightStartingDistanceForIteration(index))).toEqual([
      30, 60, 90, 30, 60, 90
    ]);
  });

  it("deduplicates explicit distance sets without inventing a melee start", () => {
    expect(normalizeFightStartingDistances([60, 30, 60, 90])).toEqual([60, 30, 90]);
  });

  it("positions both combatants and keeps derived distance synchronized", () => {
    const state = setFightStartingDistance(createFightBattle(profile("Hero"), profile("Monster")), 75);
    expect(state.character.positionFeet).toBe(0);
    expect(state.monster.positionFeet).toBe(75);
    expect(state.distanceFeet).toBe(75);
    expect(fightBattleDistanceFeet(state)).toBe(75);
  });
});
