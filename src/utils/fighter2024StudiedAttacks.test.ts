import { describe, expect, it } from "vitest";
import type { DndCharacterRecord } from "../types/dndCharacter";
import type { FightCombatantProfile } from "../types/fightMatchmaker";
import { createFightBattle, resolveFightTurn, rollFightInitiative } from "./fightBattle";
import { buildCharacterFightProfile } from "./fightProfileAdapters";

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

const fighterCharacter = (
  level: number,
  ruleset: DndCharacterRecord["ruleset"] = "srd-5.2.1-2024"
): DndCharacterRecord => ({
  id: `fighter-${ruleset}-${level}`,
  buildSlotId: `fighter-${level}`,
  ruleset,
  name: `Fighter ${level}`,
  classId: "fighter",
  className: "Fighter",
  subclassId: "champion",
  subclassName: "Champion",
  subclassUnlockLevel: 3,
  level,
  species: "Human",
  background: "Soldier",
  abilityScores: { str: 16, dex: 14, con: 14, int: 10, wis: 10, cha: 10 },
  hitDie: 10,
  maximumHitPoints: 20 + level * 4,
  armorClass: 18,
  speedFeet: 30,
  savingThrowProficiencies: ["str", "con"],
  skillProficiencies: ["Athletics"],
  languages: ["Common"],
  toolProficiencies: [],
  senses: [],
  attacks: [{
    id: "longsword",
    name: "Longsword",
    attackAbility: "str",
    proficient: true,
    damageFormula: "1d8+3",
    damageType: "slashing",
    rangeOrReach: "5 ft."
  }],
  resources: [],
  spellcastingExpected: false,
  spellcasting: { kind: "none" },
  classFeatures: [],
  subclassFeatures: [],
  advancementChoices: [],
  equipment: ["Longsword", "Shield"],
  currencyGp: 0,
  notes: [],
  sources: [],
  printableSummaryReady: true
});

const builtProfile = (level: number, ruleset: DndCharacterRecord["ruleset"] = "srd-5.2.1-2024"): FightCombatantProfile => {
  const result = buildCharacterFightProfile(fighterCharacter(level, ruleset));
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error(result.issues.join(" "));
  return result.profile;
};

const target = (): FightCombatantProfile => ({
  id: "target",
  name: "Target",
  ruleset: "srd-5.2.1-2024",
  armorClass: 15,
  hitPoints: 100,
  attackBonus: 0,
  attacksPerRound: 1,
  averageDamageOnHit: 1,
  initiativeBonus: 0,
  attackDamageFormula: "1d4",
  criticalBonusFormula: "1d4",
  sourceActionName: "Club",
  attackDelivery: "weapon",
  speedFeet: 0,
  actions: [{
    id: "club",
    name: "Club",
    kind: "attack",
    economy: "action",
    delivery: "weapon",
    attackMode: "melee",
    attackBonus: 0,
    rangeFeet: 5,
    damage: [{ formula: "1d4", damageType: "bludgeoning", criticalBonusFormula: "1d4" }]
  }]
});

const studiedProfile = (actionRollMode?: "advantage" | "disadvantage" | "normal"): FightCombatantProfile => ({
  id: "studied-fighter",
  name: "Studied Fighter",
  ruleset: "srd-5.2.1-2024",
  armorClass: 18,
  hitPoints: 80,
  attackBonus: 5,
  attacksPerRound: 2,
  averageDamageOnHit: 7.5,
  initiativeBonus: 10,
  attackDamageFormula: "1d8+3",
  criticalBonusFormula: "1d8",
  sourceActionName: "Longsword",
  attackDelivery: "weapon",
  speedFeet: 30,
  attackFollowUps: [{
    id: "studied-attacks",
    name: "Studied Attacks",
    trigger: "miss",
    rollMode: "advantage",
    target: "same-creature",
    expires: "end-of-next-turn"
  }],
  actions: [
    {
      id: "longsword",
      name: "Longsword",
      kind: "attack",
      economy: "action",
      delivery: "weapon",
      attackMode: "melee",
      attackBonus: 5,
      attackRollMode: actionRollMode,
      rangeFeet: 5,
      damage: [{ formula: "1d8+3", damageType: "slashing", criticalBonusFormula: "1d8" }]
    },
    {
      id: "attack-action-multi",
      name: "Attack ×2",
      kind: "multiattack",
      economy: "action",
      delivery: "weapon",
      rangeFeet: 5,
      sequence: [{ actionId: "longsword", count: 2 }]
    }
  ]
});

describe("2024 Fighter Studied Attacks", () => {
  it("appears at Fighter 13 in 2024 only", () => {
    expect(builtProfile(12).attackFollowUps).toBeUndefined();
    expect(builtProfile(13).attackFollowUps).toEqual([
      expect.objectContaining({
        id: "studied-attacks",
        trigger: "miss",
        rollMode: "advantage",
        target: "same-creature",
        expires: "end-of-next-turn"
      })
    ]);
    expect(builtProfile(20).attackFollowUps).toHaveLength(1);
    expect(builtProfile(13, "srd-5.1-2014").attackFollowUps).toBeUndefined();
  });

  it("turns a miss into Advantage on the next attack roll against the same creature", () => {
    let battle = rollFightInitiative(createFightBattle(studiedProfile(), target()), sequence(20, 1));
    battle = resolveFightTurn(battle, sequence(2, 3, 15, 4));

    expect(battle.events.slice(0, 2).map((event) => [event.naturalRoll, event.outcome])).toEqual([
      [2, "miss"],
      [15, "hit"]
    ]);
    expect(battle.presentationEvents?.filter((event) => event.type.startsWith("attack-follow-up")).map((event) => event.type))
      .toEqual(["attack-follow-up", "attack-follow-up-consumed"]);
    expect(battle.character.attackFollowUps).toEqual([]);
  });

  it("combines Studied Advantage with action Disadvantage using the canonical cancellation rule", () => {
    let battle = rollFightInitiative(createFightBattle(studiedProfile("disadvantage"), target()), sequence(20, 1));
    battle = resolveFightTurn(battle, sequence(2, 19, 15, 4));

    // First attack rolls with Disadvantage and keeps 2. Studied then cancels
    // Disadvantage on attack two, so that attack consumes only one d20: 15.
    expect(battle.events.slice(0, 2).map((event) => event.naturalRoll)).toEqual([2, 15]);
    expect(battle.events[1].outcome).toBe("hit");
  });

  it("expires an unused Studied benefit at the end of the Fighter's next turn", () => {
    let battle = rollFightInitiative(createFightBattle(studiedProfile(), target()), sequence(20, 1));
    battle = {
      ...battle,
      character: {
        ...battle.character,
        turnsStarted: 0,
        attackFollowUps: [{
          id: "studied-attacks",
          name: "Studied Attacks",
          targetCombatantId: "target",
          rollMode: "advantage",
          expiresAfterOwnerTurn: 1
        }],
        effects: [{ id: "stunned", name: "Stunned", kind: "condition", tickTiming: "manual" }]
      }
    };

    battle = resolveFightTurn(battle);
    expect(battle.character.turnsStarted).toBe(1);
    expect(battle.character.attackFollowUps).toEqual([]);
    expect(battle.presentationEvents?.some((event) => event.type === "attack-follow-up-expired")).toBe(true);
  });
});
