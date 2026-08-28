import { describe, expect, it } from "vitest";
import type { DndCharacterRecord } from "../types/dndCharacter";
import type { FightBattleState } from "../types/fightBattle";
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

const champion = (
  level: number,
  ruleset: DndCharacterRecord["ruleset"] = "srd-5.2.1-2024",
  ranged = true
): DndCharacterRecord => ({
  id: `champion-${ruleset}-${level}`,
  buildSlotId: `champion-${level}`,
  ruleset,
  name: `Champion ${level}`,
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
  attacks: [ranged ? {
    id: "longbow",
    name: "Longbow",
    attackAbility: "dex",
    proficient: true,
    damageFormula: "1d8+2",
    damageType: "piercing",
    rangeOrReach: "150/600 ft."
  } : {
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
  equipment: ranged ? ["Longbow"] : ["Longsword", "Shield"],
  currencyGp: 0,
  notes: [],
  sources: [],
  printableSummaryReady: true
});

const built = (
  level: number,
  ruleset: DndCharacterRecord["ruleset"] = "srd-5.2.1-2024",
  ranged = true
): FightCombatantProfile => {
  const result = buildCharacterFightProfile(champion(level, ruleset, ranged));
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error(result.issues.join(" "));
  return result.profile;
};

const target = (armorClass = 15): FightCombatantProfile => ({
  id: "target",
  name: "Target",
  ruleset: "srd-5.2.1-2024",
  armorClass,
  hitPoints: 200,
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

const withoutActionSurge = (state: FightBattleState): FightBattleState => ({
  ...state,
  character: {
    ...state.character,
    resources: { ...state.character.resources, "action-surge": 0 }
  }
});

describe("2024 Champion combat", () => {
  it("adds Remarkable Athlete critical movement at Champion 3 only for the 2024 ruleset", () => {
    expect(built(2).postCriticalMovement).toBeUndefined();
    expect(built(3).postCriticalMovement).toEqual([
      expect.objectContaining({
        id: "remarkable-athlete",
        maximumFeet: 15,
        opportunityAttackSafe: true
      })
    ]);
    expect(built(3, "srd-5.1-2014").postCriticalMovement).toBeUndefined();
  });

  it("moves a ranged Champion up to half Speed immediately after a Critical Hit without spending normal movement", () => {
    let battle = withoutActionSurge(rollFightInitiative(createFightBattle(built(3), target()), sequence(20, 19, 1)));
    battle = resolveFightTurn(battle, sequence(19, 4));

    expect(battle.events[0].outcome).toBe("critical");
    expect(battle.distanceFeet).toBe(45);
    expect(battle.character.economy.movementRemainingFeet).toBe(30);
    expect(battle.presentationEvents).toEqual(expect.arrayContaining([
      expect.objectContaining({
        type: "movement",
        sourceName: "Remarkable Athlete",
        amount: 15
      })
    ]));
  });

  it("does not auto-retreat a melee Champion after a Critical Hit", () => {
    let battle = withoutActionSurge(rollFightInitiative(
      createFightBattle(built(3, "srd-5.2.1-2024", false), target()),
      sequence(20, 19, 1)
    ));
    battle = resolveFightTurn(battle, sequence(19, 4));

    expect(battle.events[0].outcome).toBe("critical");
    expect(battle.distanceFeet).toBe(5);
    expect(battle.presentationEvents?.some((event) => event.sourceName === "Remarkable Athlete" && event.type === "movement")).toBe(false);
  });

  it("adds Heroic Warrior at Champion 10 and spends its Heroic Inspiration on a recoverable missed attack", () => {
    const profile = built(10);
    expect(profile.turnStartResourceGrants).toEqual([
      expect.objectContaining({ id: "heroic-warrior", resourceId: "heroic-inspiration" })
    ]);
    expect(profile.failedAttackRerolls?.[0]).toEqual(expect.objectContaining({
      id: "heroic-inspiration",
      resourceId: "heroic-inspiration"
    }));
    expect(profile.failedSaveRerolls?.[0]).toEqual(expect.objectContaining({
      id: "heroic-inspiration",
      resourceId: "heroic-inspiration",
      bonus: 0
    }));

    let battle = withoutActionSurge(rollFightInitiative(createFightBattle(profile, target()), sequence(20, 19, 1)));
    battle = resolveFightTurn(battle, sequence(2, 9, 4, 15, 4));

    expect(battle.events.slice(0, 2).map((event) => event.outcome)).toEqual(["hit", "hit"]);
    expect(battle.character.resources["heroic-inspiration"]).toBe(0);
    expect(battle.presentationEvents).toEqual(expect.arrayContaining([
      expect.objectContaining({ type: "resource-gained", sourceName: "Heroic Warrior" }),
      expect.objectContaining({ type: "attack-reroll", sourceName: "Heroic Inspiration" })
    ]));
  });

  it("does not add Heroic Warrior before level 10 or to the 2014 Champion", () => {
    expect(built(9).turnStartResourceGrants).toBeUndefined();
    expect(built(10, "srd-5.1-2014").turnStartResourceGrants).toBeUndefined();
  });

  it("applies Heroic Rally at the start of a Bloodied level 18 Champion turn", () => {
    const profile = built(18, "srd-5.2.1-2024", false);
    expect(profile.turnStartHealing).toEqual([
      expect.objectContaining({ id: "heroic-rally", amount: 7, minimumHitPoints: 1, maximumHitPointFraction: 0.5 })
    ]);

    let battle = rollFightInitiative(createFightBattle(profile, target()), sequence(20, 19, 1));
    battle = {
      ...battle,
      character: {
        ...battle.character,
        currentHitPoints: Math.floor(profile.hitPoints / 2),
        effects: [{ id: "stunned", name: "Stunned", kind: "condition", tickTiming: "manual" }]
      }
    };
    battle = resolveFightTurn(battle);

    expect(battle.character.currentHitPoints).toBe(Math.floor(profile.hitPoints / 2) + 7);
    expect(battle.presentationEvents).toEqual(expect.arrayContaining([
      expect.objectContaining({ type: "healing", sourceName: "Heroic Rally", amount: 7 })
    ]));
  });

  it("does not apply Heroic Rally at 0 HP or above Bloodied", () => {
    const profile = built(18, "srd-5.2.1-2024", false);
    let battle = rollFightInitiative(createFightBattle(profile, target()), sequence(20, 19, 1));
    battle = {
      ...battle,
      character: {
        ...battle.character,
        currentHitPoints: 0,
        effects: [{ id: "stunned", name: "Stunned", kind: "condition", tickTiming: "manual" }]
      }
    };
    const zero = resolveFightTurn(battle);
    expect(zero.character.currentHitPoints).toBe(0);

    battle = {
      ...battle,
      character: { ...battle.character, currentHitPoints: Math.floor(profile.hitPoints / 2) + 1 }
    };
    const healthy = resolveFightTurn(battle);
    expect(healthy.character.currentHitPoints).toBe(Math.floor(profile.hitPoints / 2) + 1);
  });

  it("treats Superior Critical as an actual hit even when the attack total is below AC", () => {
    let battle = withoutActionSurge(rollFightInitiative(createFightBattle(built(15), target(50)), sequence(20, 19, 1)));
    battle = resolveFightTurn(battle, sequence(18, 4, 15, 4, 15, 4));

    expect(battle.events[0].naturalRoll).toBe(18);
    expect(battle.events[0].attackTotal).toBeLessThan(50);
    expect(battle.events[0].outcome).toBe("critical");
  });
});
