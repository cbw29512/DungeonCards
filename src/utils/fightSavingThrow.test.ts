import { describe, expect, it } from "vitest";
import type { FightCombatantProfile } from "../types/fightMatchmaker";
import { createFightBattle } from "./fightBattle";
import { applyFightEffect, resolveFightTimedEffectSaves, startFightConcentration } from "./fightBattleEffects";
import { resolveFightSavingThrow } from "./fightSavingThrow";

const fighter = (overrides: Partial<FightCombatantProfile> = {}): FightCombatantProfile => ({
  id: "fighter-9",
  name: "Fighter 9",
  ruleset: "srd-5.2.1-2024",
  armorClass: 18,
  hitPoints: 70,
  attackBonus: 7,
  attacksPerRound: 2,
  averageDamageOnHit: 8,
  initiativeBonus: 2,
  attackDamageFormula: "1d8+4",
  criticalBonusFormula: "1d8",
  sourceActionName: "Longsword",
  attackDelivery: "weapon",
  savingThrowBonuses: { str: 8, con: 6, wis: 0 },
  resources: [{ id: "indomitable", name: "Indomitable", maximum: 1, refresh: "long-rest" }],
  failedSaveRerolls: [{
    id: "indomitable",
    name: "Indomitable",
    resourceId: "indomitable",
    bonus: 9,
    autoUse: "when-can-succeed"
  }],
  ...overrides
});

const monster = (): FightCombatantProfile => ({
  id: "monster",
  name: "Monster",
  ruleset: "srd-5.2.1-2024",
  armorClass: 15,
  hitPoints: 80,
  attackBonus: 6,
  attacksPerRound: 1,
  averageDamageOnHit: 8,
  initiativeBonus: 0,
  attackDamageFormula: "1d8+4",
  criticalBonusFormula: "1d8",
  sourceActionName: "Claw",
  attackDelivery: "weapon"
});

const sequence = (...values: number[]) => {
  let index = 0;
  return (minimum: number, maximum: number): number => {
    const value = values[index++];
    if (value === undefined || value < minimum || value > maximum) throw new Error(`Sequence exhausted at ${minimum}-${maximum}.`);
    return value;
  };
};

describe("generic Fight saving throw rerolls", () => {
  it("rerolls a failed save, adds the feature bonus to the ordinary save modifier, and consumes the resource", () => {
    const state = createFightBattle(fighter(), monster());
    const result = resolveFightSavingThrow({
      state,
      side: "character",
      ability: "wis",
      dc: 18,
      randomInteger: sequence(5, 12)
    });
    expect(result).toMatchObject({ naturalRoll: 12, total: 21, succeeded: true, rerollName: "Indomitable" });
    expect(result.state.character.resources.indomitable).toBe(0);
    expect(result.state.presentationEvents?.slice(-2).map((event) => event.type)).toEqual(["resource-used", "save-reroll"]);
  });

  it("does not waste a failed-save reroll when even the best legal reroll cannot reach the DC", () => {
    const state = createFightBattle(fighter(), monster());
    const result = resolveFightSavingThrow({
      state,
      side: "character",
      ability: "wis",
      dc: 35,
      randomInteger: sequence(2)
    });
    expect(result).toMatchObject({ naturalRoll: 2, total: 2, succeeded: false });
    expect(result.rerollName).toBeUndefined();
    expect(result.state.character.resources.indomitable).toBe(1);
  });

  it("rerolls only one d20 when the save has Advantage", () => {
    let state = createFightBattle(fighter(), monster());
    state = applyFightEffect(state, "character", {
      id: "save-advantage",
      name: "Save Advantage",
      kind: "buff",
      tickTiming: "manual",
      saveRollMode: "advantage"
    });
    const result = resolveFightSavingThrow({
      state,
      side: "character",
      ability: "wis",
      dc: 20,
      randomInteger: sequence(8, 12, 1)
    });
    expect(result).toMatchObject({ naturalRoll: 12, total: 21, succeeded: true, rerollName: "Indomitable" });
  });

  it("rerolls only the lower d20 under Disadvantage and preserves the other original die", () => {
    let state = createFightBattle(fighter(), monster());
    state = applyFightEffect(state, "character", {
      id: "save-disadvantage",
      name: "Save Disadvantage",
      kind: "debuff",
      tickTiming: "manual",
      saveRollMode: "disadvantage"
    });
    const result = resolveFightSavingThrow({
      state,
      side: "character",
      ability: "wis",
      dc: 24,
      randomInteger: sequence(4, 16, 20)
    });
    expect(result).toMatchObject({ naturalRoll: 16, total: 25, succeeded: true, rerollName: "Indomitable" });
  });

  it("uses the same reroll engine for timed condition saves", () => {
    let state = createFightBattle(fighter(), monster());
    state = applyFightEffect(state, "character", {
      id: "frightened",
      name: "Frightened",
      kind: "condition",
      iconKey: "frightened",
      tickTiming: "manual",
      saveTiming: "start",
      saveAbility: "wis",
      saveDc: 18
    });
    state = resolveFightTimedEffectSaves(state, "character", "start", sequence(4, 12));
    expect(state.character.effects.some((effect) => effect.id === "frightened")).toBe(false);
    expect(state.character.resources.indomitable).toBe(0);
    expect(state.presentationEvents?.some((event) => event.type === "save-reroll")).toBe(true);
  });

  it("can preserve concentration by rerolling the failed Constitution save", async () => {
    let state = createFightBattle(fighter(), monster());
    state = startFightConcentration(state, "character", "Bless");
    const result = resolveFightSavingThrow({
      state,
      side: "character",
      ability: "con",
      dc: 10,
      randomInteger: sequence(1, 2)
    });
    expect(result).toMatchObject({ total: 17, succeeded: true, rerollName: "Indomitable" });
    expect(result.state.character.concentration?.sourceName).toBe("Bless");
  });
});
