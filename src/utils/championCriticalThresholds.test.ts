import { describe, expect, it } from "vitest";
import type { DndCharacterRecord } from "../types/dndCharacter";
import type { FightCombatantProfile } from "../types/fightMatchmaker";
import { createFightBattle, resolveFightTurn, rollFightInitiative } from "./fightBattle";
import { buildCharacterFightProfile } from "./fightProfileAdapters";

const champion = (ruleset: DndCharacterRecord["ruleset"], level: number): DndCharacterRecord => ({
  id: `champion-${ruleset}-${level}`,
  buildSlotId: `fighter-${level}`,
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
  abilityScores: { str: 16, dex: 12, con: 14, int: 10, wis: 10, cha: 10 },
  hitDie: 10,
  maximumHitPoints: 20 + level,
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
  subclassFeatures: level >= 15 ? ["Improved Critical", "Superior Critical"] : level >= 3 ? ["Improved Critical"] : [],
  advancementChoices: [],
  equipment: ["Longsword", "Shield"],
  currencyGp: 0,
  notes: [],
  sources: [],
  printableSummaryReady: true
});

const criticalAt = (character: DndCharacterRecord): number | undefined => {
  const result = buildCharacterFightProfile(character);
  expect(result.ok).toBe(true);
  if (!result.ok) return undefined;
  const attack = result.profile.actions?.find((action) => action.kind === "attack" && action.name === "Longsword");
  return attack?.kind === "attack" ? attack.criticalAt : undefined;
};

const attacker = (criticalThreshold: number): FightCombatantProfile => ({
  id: `attacker-${criticalThreshold}`,
  name: "Champion",
  ruleset: "srd-5.2.1-2024",
  armorClass: 18,
  hitPoints: 40,
  attackBonus: 5,
  attacksPerRound: 1,
  averageDamageOnHit: 7.5,
  initiativeBonus: 5,
  attackDamageFormula: "1d8+3",
  criticalBonusFormula: "1d8",
  sourceActionName: "Longsword",
  attackDelivery: "weapon",
  actions: [{
    id: "longsword",
    name: "Longsword",
    kind: "attack",
    economy: "action",
    delivery: "weapon",
    attackMode: "melee",
    attackBonus: 5,
    criticalAt: criticalThreshold,
    rangeFeet: 5,
    damage: [{ formula: "1d8+3", damageType: "slashing", criticalBonusFormula: "1d8" }]
  }]
});

const target = (armorClass: number): FightCombatantProfile => ({
  id: `target-${armorClass}`,
  name: "Target",
  ruleset: "srd-5.2.1-2024",
  armorClass,
  hitPoints: 40,
  attackBonus: 0,
  attacksPerRound: 1,
  averageDamageOnHit: 1,
  initiativeBonus: 0,
  attackDamageFormula: "1d4",
  criticalBonusFormula: "1d4",
  sourceActionName: "Club",
  attackDelivery: "weapon",
  actions: [{
    id: "club",
    name: "Club",
    kind: "attack",
    economy: "action",
    delivery: "weapon",
    attackMode: "melee",
    attackBonus: 0,
    criticalAt: 20,
    rangeFeet: 5,
    damage: [{ formula: "1d4", damageType: "bludgeoning", criticalBonusFormula: "1d4" }]
  }]
});

const sequence = (...values: number[]) => {
  let index = 0;
  return (minimum: number, maximum: number): number => {
    const value = values[index++];
    if (value === undefined || value < minimum || value > maximum) throw new Error("Test random sequence exhausted or invalid.");
    return value;
  };
};

describe("Champion critical thresholds", () => {
  it.each(["srd-5.1-2014", "srd-5.2.1-2024"] as const)("applies the published Champion progression for %s", (ruleset) => {
    expect(criticalAt(champion(ruleset, 2))).toBe(20);
    expect(criticalAt(champion(ruleset, 3))).toBe(19);
    expect(criticalAt(champion(ruleset, 14))).toBe(19);
    expect(criticalAt(champion(ruleset, 15))).toBe(18);
    expect(criticalAt(champion(ruleset, 20))).toBe(18);
  });

  it("does not turn an expanded Champion crit-range roll into an automatic hit when the attack total misses AC", () => {
    let battle = rollFightInitiative(createFightBattle(attacker(18), target(30)), sequence(20, 1));
    battle = resolveFightTurn(battle, sequence(18));
    expect(battle.events.at(-1)).toMatchObject({ naturalRoll: 18, attackTotal: 23, outcome: "miss", damage: 0 });
  });

  it("scores an expanded-range critical when the attack total hits AC", () => {
    let battle = rollFightInitiative(createFightBattle(attacker(18), target(23)), sequence(20, 1));
    battle = resolveFightTurn(battle, sequence(18, 4));
    expect(battle.events.at(-1)).toMatchObject({ naturalRoll: 18, attackTotal: 23, outcome: "critical", damage: 15 });
  });

  it("keeps a natural 20 an automatic critical hit regardless of AC", () => {
    let battle = rollFightInitiative(createFightBattle(attacker(18), target(99)), sequence(20, 1));
    battle = resolveFightTurn(battle, sequence(20, 4));
    expect(battle.events.at(-1)).toMatchObject({ naturalRoll: 20, outcome: "critical", damage: 15 });
  });
});
