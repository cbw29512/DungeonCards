import { describe, expect, it } from "vitest";
import type { DndPregenSeriesBlueprint } from "../types/dndPregenSeries";
import {
  generateDndPregenLevel,
  generateDndPregenSeries
} from "./dndPregenSeries";

const blueprint: DndPregenSeriesBlueprint = {
  id: "kara-stoneguard-2024",
  name: "Kara Stoneguard",
  ruleset: "srd-5.2.1-2024",
  classId: "fighter",
  className: "Fighter",
  subclassId: "champion",
  subclassName: "Champion",
  subclassUnlockLevel: 3,
  species: "Dwarf",
  background: "Soldier",
  sources: [{
    label: "2024 Free Rules Fighter",
    url: "https://www.dndbeyond.com/sources/dnd/br-2024/character-classes/fighter",
    scope: "public-srd"
  }],
  levels: {
    1: {
      abilityScores: { str: 16, dex: 12, con: 16, int: 10, wis: 13, cha: 8 },
      hitDie: 10,
      maximumHitPoints: 13,
      armorClass: 18,
      speedFeet: 30,
      savingThrowProficiencies: ["str", "con"],
      skillProficiencies: ["Athletics", "Perception"],
      languages: ["Common", "Dwarvish"],
      toolProficiencies: ["Smith's Tools"],
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
      resources: [{
        id: "second-wind",
        name: "Second Wind",
        maximum: 2,
        refresh: "short-rest"
      }],
      spellcastingExpected: false,
      spellcasting: { kind: "none" },
      classFeatures: ["Fighting Style", "Second Wind", "Weapon Mastery"],
      subclassFeatures: [],
      advancementChoices: [],
      equipment: ["Chain mail", "Shield", "Longsword", "Light crossbow"],
      currencyGp: 10,
      notes: ["Beginner defender"],
      printableSummaryReady: true
    }
  }
};

describe("D&D pregen series generation", () => {
  it("generates a stable subclass-aware ready record", () => {
    const first = generateDndPregenLevel(blueprint, 1);
    const second = generateDndPregenLevel(blueprint, 1);
    expect(first).toEqual(second);
    expect(first).toMatchObject({
      ok: true,
      record: {
        id: "kara-stoneguard-2024-1",
        buildSlotId: "srd-5.2.1-2024-fighter-champion-1",
        subclassId: "champion",
        level: 1
      }
    });
  });

  it("refuses missing and out-of-range level packages", () => {
    expect(generateDndPregenLevel(blueprint, 0)).toEqual({
      ok: false,
      level: 0,
      issues: ["Pregen level must be an integer from 1 through 20."]
    });
    expect(generateDndPregenLevel(blueprint, 2)).toEqual({
      ok: false,
      level: 2,
      issues: ["kara-stoneguard-2024 has no reviewed package for level 2."]
    });
  });

  it("returns an explicit result for every supported level", () => {
    const results = generateDndPregenSeries(blueprint);
    expect(results).toHaveLength(20);
    expect(results.filter((result) => result.ok)).toHaveLength(1);
    expect(results.filter((result) => !result.ok)).toHaveLength(19);
  });

  it("rejects a level package that fails the shared readiness gate", () => {
    const invalid = {
      ...blueprint,
      levels: { 1: { ...blueprint.levels[1]!, attacks: [] } }
    };
    const result = generateDndPregenLevel(invalid, 1);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.issues.some((issue) => issue.includes("combat"))).toBe(true);
  });
});
