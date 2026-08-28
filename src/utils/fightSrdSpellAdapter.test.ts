import { describe, expect, it } from "vitest";
import type { SrdSpellRecord } from "../types/srdCompendium";
import { buildSrdSpellFightAction } from "./fightSrdSpellAdapter";

const spell = (overrides: Partial<SrdSpellRecord>): SrdSpellRecord => ({
  id: "spell-test",
  edition: "srd-5.1-2014",
  sourceVersion: "SRD 5.1",
  name: "Test Spell",
  level: 1,
  school: "Evocation",
  castingTime: "1 action",
  range: "60 feet",
  components: "V, S",
  duration: "Instantaneous",
  classes: ["Wizard"],
  description: "",
  higherLevels: "",
  sourcePage: 1,
  sourceReference: "SRD 5.1",
  ...overrides
});

const build = (record: SrdSpellRecord, characterLevel = 3) => buildSrdSpellFightAction({
  spell: record,
  characterLevel,
  spellAttackBonus: 5,
  spellSaveDc: 13,
  spellcastingModifier: 3
});

describe("SRD spell Fight action adapter", () => {
  it("creates a ranged spell attack with typed critical damage", () => {
    const action = build(spell({
      name: "Fire Bolt",
      level: 0,
      description: "Make a ranged spell attack against the target. On a hit, the target takes 1d10 fire damage."
    }));
    expect(action).toMatchObject({
      kind: "attack",
      delivery: "spell",
      attackBonus: 5,
      criticalAt: 20,
      damage: [{ formula: "1d10", damageType: "fire", criticalBonusFormula: "1d10" }]
    });
  });

  it("uses explicit cantrip tiers when the character reaches them", () => {
    const action = build(spell({
      name: "Fire Bolt",
      level: 0,
      description: "Make a ranged spell attack against the target. On a hit, the target takes 1d10 fire damage. 5th level (2d10). 11th level (3d10). 17th level (4d10)."
    }), 11);
    expect(action).toMatchObject({ kind: "attack", damage: [{ formula: "3d10", damageType: "fire" }] });
  });

  it("creates save-for-half spell damage and spends the base spell slot", () => {
    const action = build(spell({
      name: "Burning Hands",
      level: 1,
      range: "Self (15-foot cone)",
      description: "Each creature must make a Dexterity saving throw. A creature takes 3d6 fire damage on a failed save, or half as much damage on a successful one."
    }));
    expect(action).toMatchObject({
      kind: "save",
      saveAbility: "dex",
      saveDc: 13,
      damageOnSuccess: "half",
      resourceCosts: [{ resourceId: "spell-slot-1", amount: 1 }],
      damage: [{ formula: "3d6", damageType: "fire" }]
    });
  });

  it("creates a concentration-linked save condition with repeated end-of-turn saves", () => {
    const action = build(spell({
      name: "Hold Person",
      level: 2,
      duration: "Concentration, up to 1 minute",
      description: "The target must succeed on a Wisdom saving throw or be paralyzed for the duration. At the end of each of its turns, the target can repeat the saving throw."
    }));
    expect(action).toMatchObject({
      kind: "save",
      saveAbility: "wis",
      saveDc: 13,
      requiresConcentration: true,
      resourceCosts: [{ resourceId: "spell-slot-2", amount: 1 }],
      effectsOnFailure: [{
        name: "Paralyzed",
        iconKey: "paralyzed",
        concentrationLinked: true,
        saveAbility: "wis",
        saveDc: 13,
        saveTiming: "end"
      }]
    });
  });

  it("creates self-legal healing with the spellcasting modifier", () => {
    const action = build(spell({
      name: "Cure Wounds",
      range: "Touch",
      description: "A creature you touch regains hit points equal to 1d8 + your spellcasting ability modifier."
    }));
    expect(action).toMatchObject({
      kind: "heal",
      formula: "1d8+3",
      target: "self",
      resourceCosts: [{ resourceId: "spell-slot-1", amount: 1 }]
    });
  });

  it("fails closed on an irregular unsupported spell instead of inventing mechanics", () => {
    const action = build(spell({
      name: "Odd Utility",
      description: "Reality bends in a way that requires manual adjudication."
    }));
    expect(action).toBeNull();
  });
});
