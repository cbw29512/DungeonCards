import { describe, expect, it } from "vitest";
import type { FightCombatantProfile } from "../types/fightMatchmaker";
import { createFightBattle, resolveFightTurn, rollFightInitiative } from "./fightBattle";
import { startFightConcentration } from "./fightBattleEffects";

const sequence = (...values: number[]) => {
  let index = 0;
  return (minimum: number, maximum: number): number => {
    const value = values[index++];
    if (value === undefined || value < minimum || value > maximum) {
      throw new Error(`Sequence exhausted at ${minimum}-${maximum}; value=${value}.`);
    }
    return value;
  };
};

const indomitableFighter = (): FightCombatantProfile => ({
  id: "fighter-9",
  name: "Fighter 9",
  ruleset: "srd-5.2.1-2024",
  armorClass: 18,
  hitPoints: 70,
  attackBonus: 7,
  attacksPerRound: 2,
  averageDamageOnHit: 8,
  initiativeBonus: 0,
  attackDamageFormula: "1d8+4",
  criticalBonusFormula: "1d8",
  sourceActionName: "Longsword",
  attackDelivery: "weapon",
  speedFeet: 30,
  savingThrowBonuses: { con: 6, wis: 0 },
  resources: [{
    id: "indomitable",
    name: "Indomitable",
    maximum: 1,
    refresh: "long-rest",
    longRestRecovery: "all"
  }],
  failedSaveRerolls: [{
    id: "indomitable",
    name: "Indomitable",
    resourceId: "indomitable",
    bonus: 9,
    autoUse: "when-can-succeed"
  }],
  actions: [{
    id: "longsword",
    name: "Longsword",
    kind: "attack",
    economy: "action",
    delivery: "weapon",
    attackMode: "melee",
    attackBonus: 7,
    rangeFeet: 5,
    damage: [{ formula: "1d8+4", damageType: "slashing", criticalBonusFormula: "1d8" }]
  }]
});

const saveMonster = (): FightCombatantProfile => ({
  id: "save-monster",
  name: "Save Monster",
  ruleset: "srd-5.2.1-2024",
  armorClass: 15,
  hitPoints: 80,
  attackBonus: 0,
  attacksPerRound: 1,
  averageDamageOnHit: 3.5,
  initiativeBonus: 10,
  attackDamageFormula: "1d6",
  criticalBonusFormula: "1d6",
  sourceActionName: "Dread Pulse",
  attackDelivery: "spell",
  speedFeet: 30,
  actions: [{
    id: "dread-pulse",
    name: "Dread Pulse",
    kind: "save",
    economy: "action",
    delivery: "spell",
    rangeFeet: 60,
    saveAbility: "wis",
    saveDc: 18,
    damage: [{ formula: "1d6", damageType: "psychic", criticalBonusFormula: "1d6" }],
    damageOnSuccess: "none"
  }]
});

const attackMonster = (): FightCombatantProfile => ({
  id: "attack-monster",
  name: "Attack Monster",
  ruleset: "srd-5.2.1-2024",
  armorClass: 15,
  hitPoints: 80,
  attackBonus: 20,
  attacksPerRound: 1,
  averageDamageOnHit: 3.5,
  initiativeBonus: 10,
  attackDamageFormula: "1d6",
  criticalBonusFormula: "1d6",
  sourceActionName: "Claw",
  attackDelivery: "weapon",
  speedFeet: 30,
  actions: [{
    id: "claw",
    name: "Claw",
    kind: "attack",
    economy: "action",
    delivery: "weapon",
    attackMode: "melee",
    attackBonus: 20,
    rangeFeet: 5,
    damage: [{ formula: "1d6", damageType: "slashing", criticalBonusFormula: "1d6" }]
  }]
});

describe("2024 Indomitable canonical integration", () => {
  it("rerolls a failed monster/spell save through the ordinary save-action path", () => {
    const fighter = indomitableFighter();
    let battle = rollFightInitiative(createFightBattle(fighter, saveMonster()), sequence(1, 20));
    battle = resolveFightTurn(battle, sequence(5, 12));

    expect(battle.character.currentHitPoints).toBe(fighter.hitPoints);
    expect(battle.character.resources.indomitable).toBe(0);
    expect(battle.presentationEvents?.filter((event) => ["resource-used", "save-reroll", "save-success"].includes(event.type)).map((event) => event.type))
      .toEqual(["resource-used", "save-reroll", "save-success"]);
    expect(battle.presentationEvents?.findLast((event) => event.type === "save-success")?.saveTotal).toBe(21);
  });

  it("uses the same reroll after damage to preserve concentration", () => {
    const fighter = indomitableFighter();
    let battle = createFightBattle(fighter, attackMonster());
    battle = startFightConcentration(battle, "character", "Bless");
    battle = rollFightInitiative(battle, sequence(1, 20));
    battle = resolveFightTurn(battle, sequence(10, 4, 1, 2));

    expect(battle.character.currentHitPoints).toBe(fighter.hitPoints - 4);
    expect(battle.character.concentration?.sourceName).toBe("Bless");
    expect(battle.character.resources.indomitable).toBe(0);
    expect(battle.presentationEvents?.filter((event) => ["resource-used", "save-reroll", "save-success"].includes(event.type)).map((event) => event.type))
      .toEqual(["resource-used", "save-reroll", "save-success"]);
    expect(battle.presentationEvents?.findLast((event) => event.type === "save-success")?.saveTotal).toBe(17);
  });
});
