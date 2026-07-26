import { describe, expect, it } from "vitest";
import type { DndPregenBlueprint } from "../types/dndPregenBlueprint";
import {
  generateDndPregenCharacter,
  generateDndPregenSeries
} from "./dndPregenGenerator";

const blueprint: DndPregenBlueprint = {
  id: "sample-guardian-2024",
  name: "Sample Guardian",
  ruleset: "srd-5.2.1-2024",
  classId: "fighter",
  className: "Fighter",
  subclassId: "champion",
  subclassName: "Champion",
  speciesId: "human",
  speciesName: "Human",
  backgroundId: "soldier",
  backgroundName: "Soldier",
  sourceScope: "public-srd",
  role: "defender",
  complexity: "beginner",
  tags: ["melee", "shield"],
  personality: ["Protects vulnerable allies."],
  tactics: ["Stand between enemies and vulnerable allies."],
  sourceRefs: [{
    title: "SRD 5.2.1",
    url: "https://www.dndbeyond.com/srd",
    license: "CC-BY-4.0",
    ruleset: "srd-5.2.1-2024"
  }],
  levels: {
    1: {
      abilityScores: {
        strength: 16,
        dexterity: 12,
        constitution: 14,
        intelligence: 8,
        wisdom: 10,
        charisma: 13
      },
      proficiencyBonus: 2,
      armorClass: 18,
      initiative: 1,
      speed: 30,
      maxHitPoints: 12,
      hitDice: "1d10",
      savingThrows: ["Strength +5", "Constitution +4"],
      skills: ["Athletics +5", "Perception +2"],
      senses: ["Passive Perception 12"],
      languages: ["Common"],
      proficiencies: ["All armor", "Shields", "Simple weapons", "Martial weapons"],
      attacks: [{
        id: "longsword",
        name: "Longsword",
        attackBonus: 5,
        range: "5 ft.",
        damage: "1d8 + 3 slashing"
      }],
      resources: [{
        id: "second-wind",
        name: "Second Wind",
        maximum: 1,
        recovery: "short-rest"
      }],
      features: ["Fighting Style", "Second Wind"],
      actions: ["Attack", "Dash", "Disengage", "Dodge", "Help", "Ready", "Search"],
      bonusActions: ["Second Wind"],
      reactions: ["Opportunity Attack"],
      equipment: ["Longsword", "Shield", "Chain Mail"],
      currency: ["0 GP"],
      reviewStatus: "verified",
      reviewedAt: "2026-07-26"
    }
  }
};

describe("D&D pregen blueprint generation", () => {
  it("creates a stable subclass-aware character record", () => {
    const first = generateDndPregenCharacter(blueprint, 1);
    const second = generateDndPregenCharacter(blueprint, 1);
    expect(first).toEqual(second);
    expect(first).toMatchObject({
      ok: true,
      record: {
        id: "sample-guardian-2024-1",
        slotId: "srd-5.2.1-2024-fighter-champion-1",
        level: 1,
        reviewStatus: "verified"
      }
    });
  });

  it("refuses missing or out-of-range level packages", () => {
    expect(generateDndPregenCharacter(blueprint, 0)).toEqual({
      ok: false,
      level: 0,
      issues: ["Pregen level must be an integer from 1 through 20."]
    });
    expect(generateDndPregenCharacter(blueprint, 2)).toEqual({
      ok: false,
      level: 2,
      issues: ["sample-guardian-2024 has no reviewed package for level 2."]
    });
  });

  it("returns one explicit result for every supported level", () => {
    const results = generateDndPregenSeries(blueprint);
    expect(results).toHaveLength(20);
    expect(results.filter((result) => result.ok)).toHaveLength(1);
    expect(results.filter((result) => !result.ok)).toHaveLength(19);
  });
});
