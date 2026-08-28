import { describe, expect, it } from "vitest";
import type { DndCharacterRecord } from "../types/dndCharacter";
import type { FightCombatantProfile } from "../types/fightMatchmaker";
import { createFightBattle, resolveFightTurn, rollFightInitiative } from "./fightBattle";
import { buildCharacterFightProfile } from "./fightProfileAdapters";

const fighter = (
  level: number,
  ruleset: DndCharacterRecord["ruleset"] = "srd-5.2.1-2024",
  subclassName = "Champion"
): DndCharacterRecord => ({
  id: `fighter-${ruleset}-${level}`,
  buildSlotId: `fighter-${level}`,
  ruleset,
  name: `Fighter ${level}`,
  classId: "fighter",
  className: "Fighter",
  subclassId: "champion",
  subclassName,
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

const profileFor = (character: DndCharacterRecord): FightCombatantProfile => {
  const result = buildCharacterFightProfile(character);
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error(result.issues.join(" "));
  return result.profile;
};

const resource = (profile: FightCombatantProfile, id: string) => profile.resources?.find((entry) => entry.id === id);
const action = (profile: FightCombatantProfile, id: string) => profile.actions?.find((entry) => entry.id === id);

const dummy = (): FightCombatantProfile => ({
  id: "dummy",
  name: "Training Dummy",
  ruleset: "srd-5.2.1-2024",
  armorClass: 10,
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

const sequence = (...values: number[]) => {
  let index = 0;
  return (minimum: number, maximum: number): number => {
    const value = values[index++];
    if (value === undefined || value < minimum || value > maximum) throw new Error(`Test random sequence exhausted at ${minimum}-${maximum}.`);
    return value;
  };
};

describe("2024 Fighter core Fight Cards mechanics", () => {
  it("models the published Second Wind use progression and partial Short Rest recovery", () => {
    expect(resource(profileFor(fighter(1)), "second-wind")).toMatchObject({ maximum: 2, shortRestRecovery: 1, longRestRecovery: "all" });
    expect(resource(profileFor(fighter(4)), "second-wind")).toMatchObject({ maximum: 3, shortRestRecovery: 1, longRestRecovery: "all" });
    expect(resource(profileFor(fighter(10)), "second-wind")).toMatchObject({ maximum: 4, shortRestRecovery: 1, longRestRecovery: "all" });
  });

  it("keeps 2014 Second Wind at one use while scaling Action Surge to two uses at level 17 in both editions", () => {
    expect(resource(profileFor(fighter(10, "srd-5.1-2014")), "second-wind")).toMatchObject({ maximum: 1 });
    expect(resource(profileFor(fighter(16)), "action-surge")).toMatchObject({ maximum: 1 });
    expect(resource(profileFor(fighter(17)), "action-surge")).toMatchObject({ maximum: 2 });
    expect(resource(profileFor(fighter(17, "srd-5.1-2014")), "action-surge")).toMatchObject({ maximum: 2 });
  });

  it("marks 2024 Action Surge's granted action as unable to use spell-delivery Magic actions", () => {
    expect(action(profileFor(fighter(2)), "action-surge")).toMatchObject({
      kind: "grant-action",
      grants: "action",
      excludedDelivery: "spell"
    });
  });

  it("adds Tactical Shift half-Speed movement to Second Wind at level 5+", () => {
    expect(action(profileFor(fighter(4)), "second-wind")).not.toHaveProperty("movementGrantedFeet");
    expect(action(profileFor(fighter(5)), "second-wind")).toMatchObject({ movementGrantedFeet: 15 });
  });

  it("gives only the 2024 Champion Remarkable Athlete Advantage on Initiative", () => {
    expect(profileFor(fighter(3)).initiativeRollMode).toBe("advantage");
    expect(profileFor(fighter(3, "srd-5.1-2014")).initiativeRollMode).toBeUndefined();
    expect(profileFor(fighter(2)).initiativeRollMode).toBeUndefined();
  });

  it("uses Initiative Advantage through the canonical d20 roller", () => {
    const champion = profileFor(fighter(3));
    const battle = rollFightInitiative(createFightBattle(champion, dummy()), sequence(4, 17, 10));
    expect(battle.initiative).toMatchObject({ characterNaturalRoll: 17, characterTotal: 19, monsterNaturalRoll: 10, monsterTotal: 10 });
    expect(battle.initiative?.order).toEqual(["character", "monster"]);
  });

  it("grants Tactical Shift movement when Second Wind is actually activated", () => {
    const baseChampion = profileFor(fighter(5));
    const champion: FightCombatantProfile = {
      ...baseChampion,
      actions: baseChampion.actions?.filter((entry) => entry.id !== "action-surge"),
      resources: baseChampion.resources?.filter((entry) => entry.id !== "action-surge")
    };
    let battle = rollFightInitiative(createFightBattle(champion, dummy()), sequence(18, 2, 1));
    battle = {
      ...battle,
      character: { ...battle.character, currentHitPoints: Math.floor(champion.hitPoints / 2) }
    };
    battle = resolveFightTurn(battle, sequence(5, 12, 4, 12, 4));
    expect(battle.character.resources["second-wind"]).toBe(2);
    expect(battle.character.positionFeet).toBe(25);
    expect(battle.character.economy.movementRemainingFeet).toBe(20);
  });

  it("prevents Action Surge's extra action from selecting a spell-delivery action", () => {
    const profile: FightCombatantProfile = {
      ...profileFor(fighter(2)),
      actions: [
        {
          id: "spell-attack",
          name: "Spell Attack",
          kind: "attack",
          economy: "action",
          delivery: "spell",
          attackMode: "ranged",
          attackBonus: 5,
          rangeFeet: 120,
          damage: [{ formula: "1d6", damageType: "force", criticalBonusFormula: "1d6" }]
        },
        {
          id: "weapon-attack",
          name: "Weapon Attack",
          kind: "attack",
          economy: "action",
          delivery: "weapon",
          attackMode: "ranged",
          attackBonus: 5,
          rangeFeet: 120,
          damage: [{ formula: "1d6", damageType: "piercing", criticalBonusFormula: "1d6" }]
        },
        action(profileFor(fighter(2)), "action-surge")!
      ]
    };
    let battle = rollFightInitiative(createFightBattle(profile, dummy()), sequence(18, 2));
    battle = resolveFightTurn(battle, sequence(12, 4, 12, 4));
    expect(battle.events.slice(0, 2).map((event) => event.sourceActionName)).toEqual(["Spell Attack", "Weapon Attack"]);
    expect(battle.character.resources["action-surge"]).toBe(0);
  });
});
