import { describe, expect, it } from "vitest";
import type { FightCombatantProfile } from "../types/fightMatchmaker";
import { fightBattleDistanceFeet, resolveFightTurn } from "./fightBattle";
import { setFightStartingDistance } from "./fightEncounterSetup";
import { createFightBattle } from "./fightBattle";

const archer = (speedFeet = 30): FightCombatantProfile => ({
  id: `archer-${speedFeet}`,
  name: "Archer",
  ruleset: "srd-5.2.1-2024",
  armorClass: 15,
  hitPoints: 30,
  attackBonus: 6,
  attacksPerRound: 1,
  averageDamageOnHit: 7.5,
  initiativeBonus: 3,
  attackDamageFormula: "1d8+3",
  criticalBonusFormula: "1d8",
  sourceActionName: "Bow",
  speedFeet,
  actions: [{
    id: "bow",
    name: "Bow",
    kind: "attack",
    economy: "action",
    delivery: "weapon",
    attackMode: "ranged",
    attackBonus: 6,
    rangeFeet: 80,
    longRangeFeet: 320,
    damage: [{ formula: "1d8+3", damageType: "piercing", criticalBonusFormula: "1d8" }]
  }]
});

const target: FightCombatantProfile = {
  id: "target",
  name: "Target",
  ruleset: "srd-5.2.1-2024",
  armorClass: 12,
  hitPoints: 40,
  attackBonus: 4,
  attacksPerRound: 1,
  averageDamageOnHit: 5.5,
  initiativeBonus: 0,
  attackDamageFormula: "1d6+2",
  criticalBonusFormula: "1d6",
  sourceActionName: "Club",
  speedFeet: 30
};

const sequence = (...values: number[]) => {
  let index = 0;
  return (minimum: number, maximum: number): number => {
    const value = values[index++];
    if (value === undefined || value < minimum || value > maximum) throw new Error("Test random sequence exhausted or invalid.");
    return value;
  };
};

const activeFight = (distanceFeet: number, speedFeet = 30) => {
  let state = setFightStartingDistance(createFightBattle(archer(speedFeet), target), distanceFeet);
  state = {
    ...state,
    status: "active",
    activeIndex: 0,
    initiative: {
      characterNaturalRoll: 20,
      characterTotal: 23,
      monsterNaturalRoll: 1,
      monsterTotal: 1,
      order: ["character", "monster"]
    }
  };
  return state;
};

describe("canonical ranged attack resolution", () => {
  it("moves into normal range when possible and attacks without the long-range penalty", () => {
    const resolved = resolveFightTurn(activeFight(100), sequence(15, 4));
    expect(resolved.character.positionFeet).toBe(20);
    expect(fightBattleDistanceFeet(resolved)).toBe(80);
    expect(resolved.character.economy.movementRemainingFeet).toBe(10);
    expect(resolved.events).toHaveLength(1);
    expect(resolved.events[0]).toMatchObject({ naturalRoll: 15, outcome: "hit", damage: 7 });
  });

  it("attacks with Disadvantage when movement cannot close from long range to normal range", () => {
    const resolved = resolveFightTurn(activeFight(120, 0), sequence(18, 2));
    expect(fightBattleDistanceFeet(resolved)).toBe(120);
    expect(resolved.events).toHaveLength(1);
    expect(resolved.events[0]).toMatchObject({ naturalRoll: 2, outcome: "miss" });
  });

  it("cannot attack beyond long range after spending available movement", () => {
    const resolved = resolveFightTurn(activeFight(400), sequence());
    expect(resolved.character.positionFeet).toBe(30);
    expect(fightBattleDistanceFeet(resolved)).toBe(370);
    expect(resolved.events).toHaveLength(0);
    expect(resolved.character.economy.actionsAvailable).toBe(1);
  });

  it("uses Disadvantage for an adjacent ranged attack", () => {
    const resolved = resolveFightTurn(activeFight(5, 0), sequence(18, 2));
    expect(resolved.events).toHaveLength(1);
    expect(resolved.events[0]).toMatchObject({ naturalRoll: 2, outcome: "miss" });
  });
});