import { describe, expect, it } from "vitest";
import type { FightCombatantProfile } from "../types/fightMatchmaker";
import { createFightBattle, resolveFightTurn, rollFightInitiative } from "./fightBattle";
import { applyFightEffect, startFightConcentration } from "./fightBattleEffects";

const sequence = (values: number[]) => {
  let index = 0;
  return (minimum: number, maximum: number) => Math.max(minimum, Math.min(maximum, values[index++] ?? minimum));
};

const legacyProfile = (name: string, overrides: Partial<FightCombatantProfile> = {}): FightCombatantProfile => ({
  id: name.toLowerCase(),
  name,
  ruleset: "srd-5.1-2014",
  armorClass: 14,
  hitPoints: 80,
  attackBonus: 5,
  averageDamageOnHit: 7.5,
  attacksPerRound: 1,
  initiativeBonus: 0,
  attackDamageFormula: "1d8+3",
  criticalBonusFormula: "1d8",
  sourceActionName: "Longsword",
  speedFeet: 30,
  savingThrowBonuses: { con: 0, dex: 0 },
  ...overrides
});

describe("rules-driven Fight Card battle execution", () => {
  it("moves into melee range before attacking and records the movement", () => {
    let state = createFightBattle(legacyProfile("Hero"), legacyProfile("Monster"));
    state = rollFightInitiative(state, sequence([20, 1]));
    state = resolveFightTurn(state, sequence([15, 4]));

    expect(state.distanceFeet).toBe(5);
    expect(state.character.economy.movementRemainingFeet).toBe(5);
    expect(state.presentationEvents?.some((event) => event.type === "movement" && event.amount === 25)).toBe(true);
    expect(state.events).toHaveLength(1);
  });

  it("treats a Champion natural 19 as a Heroic Crit with max base dice plus one normal damage roll", () => {
    const hero = legacyProfile("Champion", {
      actions: [{
        id: "longsword",
        name: "Longsword",
        kind: "attack",
        economy: "action",
        delivery: "weapon",
        attackBonus: 5,
        criticalAt: 19,
        rangeFeet: 30,
        damage: [{ formula: "1d8+3", damageType: "slashing", criticalBonusFormula: "1d8" }]
      }]
    });
    let state = createFightBattle(hero, legacyProfile("Monster"));
    state = rollFightInitiative(state, sequence([20, 1]));
    state = resolveFightTurn(state, sequence([19, 4]));

    expect(state.events[0]).toMatchObject({ outcome: "critical", naturalRoll: 19, rawDamage: 15, damage: 15 });
  });

  it("resolves a save-half effect before resistance", () => {
    const caster = legacyProfile("Caster", {
      actions: [{
        id: "flame",
        name: "Flame Burst",
        kind: "save",
        economy: "action",
        delivery: "spell",
        rangeFeet: 60,
        saveAbility: "dex",
        saveDc: 12,
        damage: [{ formula: "2d6", damageType: "fire", criticalBonusFormula: "2d6" }],
        damageOnSuccess: "half"
      }]
    });
    const target = legacyProfile("Target", { damageResistances: ["fire"], savingThrowBonuses: { dex: 0, con: 0 } });
    let state = createFightBattle(caster, target);
    state = rollFightInitiative(state, sequence([20, 1]));
    state = resolveFightTurn(state, sequence([15, 4, 4]));

    expect(state.monster.currentHitPoints).toBe(78);
    expect(state.presentationEvents?.some((event) => event.type === "save-success" && event.saveTotal === 15)).toBe(true);
    expect(state.presentationEvents?.some((event) => event.type === "damage-resisted" && event.damageType === "fire")).toBe(true);
  });

  it("forces the concentration check after damage and clears concentration on failure", () => {
    let state = createFightBattle(legacyProfile("Hero"), legacyProfile("Caster"));
    state = startFightConcentration(state, "monster", "Hold Person");
    state = rollFightInitiative(state, sequence([20, 1]));
    state = resolveFightTurn(state, sequence([15, 8, 5]));

    expect(state.monster.concentration).toBeUndefined();
    expect(state.presentationEvents?.some((event) => event.type === "save-failure" && event.label.includes("Concentration"))).toBe(true);
    expect(state.presentationEvents?.some((event) => event.type === "concentration-broken")).toBe(true);
  });

  it("spends Action Surge once and executes a second action in the same turn", () => {
    const fighter = legacyProfile("Fighter", {
      resources: [{ id: "action-surge", name: "Action Surge", maximum: 1, refresh: "short-rest" }],
      actions: [
        {
          id: "longsword",
          name: "Longsword",
          kind: "attack",
          economy: "action",
          delivery: "weapon",
          attackBonus: 5,
          rangeFeet: 30,
          damage: [{ formula: "1d8+3", damageType: "slashing", criticalBonusFormula: "1d8" }]
        },
        {
          id: "action-surge",
          name: "Action Surge",
          kind: "grant-action",
          economy: "free",
          grants: "action",
          resourceCosts: [{ resourceId: "action-surge", amount: 1 }]
        }
      ]
    });
    let state = createFightBattle(fighter, legacyProfile("Monster"));
    state = rollFightInitiative(state, sequence([20, 1]));
    state = resolveFightTurn(state, sequence([15, 4, 16, 5]));

    expect(state.events).toHaveLength(2);
    expect(state.character.resources["action-surge"]).toBe(0);
    expect(state.presentationEvents?.some((event) => event.type === "resource-used" && event.sourceName === "Action Surge")).toBe(true);
  });

  it("executes a reconciled Multiattack sequence and stops after the declared components", () => {
    const monster = legacyProfile("Two-Claw", {
      attacksPerRound: 2,
      actions: [
        {
          id: "claw",
          name: "Claw",
          kind: "attack",
          economy: "action",
          delivery: "weapon",
          attackBonus: 5,
          rangeFeet: 5,
          damage: [{ formula: "1d6+2", damageType: "slashing", criticalBonusFormula: "1d6" }]
        },
        {
          id: "multiattack",
          name: "Multiattack",
          kind: "multiattack",
          economy: "action",
          delivery: "weapon",
          rangeFeet: 5,
          sequence: [{ actionId: "claw", count: 2 }]
        }
      ]
    });
    let state = createFightBattle(legacyProfile("Hero"), monster);
    state = rollFightInitiative(state, sequence([1, 20]));
    state = resolveFightTurn(state, sequence([15, 4, 16, 5]));

    expect(state.events).toHaveLength(2);
    expect(state.events.map((event) => event.sourceActionName)).toEqual(["Claw", "Claw"]);
  });

  it("recharges an expended Recharge 5-6 action at the start of its next turn", () => {
    const breathUser = legacyProfile("Breather", {
      actions: [{
        id: "breath",
        name: "Breath Weapon (Recharge 5-6)",
        kind: "save",
        economy: "action",
        delivery: "spell",
        recharge: { minimum: 5, dieSides: 6, initiallyReady: true },
        rangeFeet: 30,
        saveAbility: "dex",
        saveDc: 10,
        damage: [{ formula: "1d6", damageType: "fire", criticalBonusFormula: "1d6" }],
        damageOnSuccess: "half"
      }]
    });
    let state = createFightBattle(breathUser, legacyProfile("Target"));
    state = rollFightInitiative(state, sequence([20, 1]));
    state = resolveFightTurn(state, sequence([1, 4]));
    expect(state.character.rechargeReady.breath).toBe(false);

    state = resolveFightTurn(state, sequence([15, 3]));
    state = resolveFightTurn(state, sequence([6, 1, 5]));
    expect(state.presentationEvents?.some((event) => event.type === "recharge-ready" && event.sourceName?.includes("Breath"))).toBe(true);
    expect(state.character.rechargeReady.breath).toBe(false);
  });

  it("blocks actions and movement while stunned but still advances the turn", () => {
    let state = createFightBattle(legacyProfile("Hero"), legacyProfile("Monster"));
    state = applyFightEffect(state, "character", {
      id: "stunned",
      name: "Stunned",
      kind: "condition",
      tickTiming: "manual"
    });
    state = rollFightInitiative(state, sequence([20, 1]));
    state = resolveFightTurn(state, sequence([]));

    expect(state.events).toEqual([]);
    expect(state.character.economy).toMatchObject({ actionsAvailable: 0, bonusActionsAvailable: 0, reactionAvailable: false, movementRemainingFeet: 0 });
    expect(state.activeIndex).toBe(1);
  });
});