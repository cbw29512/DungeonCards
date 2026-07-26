import { describe, expect, it } from "vitest";
import type { PregenCharacter } from "../types/pregens";
import {
  abilityModifier,
  filterPregenCharacters,
  isReadyToPlay,
  proficiencyBonusForLevel,
  validatePregenCharacter
} from "./pregenCatalog";

const validCharacter: PregenCharacter = {
  id: "dnd-2024-fighter-champion-1",
  blueprintId: "dnd-2024-fighter-champion",
  name: "Sample Guardian",
  edition: "dnd-2024",
  level: 1,
  classId: "fighter",
  className: "Fighter",
  subclassId: "champion",
  subclassName: "Champion",
  speciesId: "human",
  speciesName: "Human",
  backgroundId: "soldier",
  backgroundName: "Soldier",
  sourceScope: "srd",
  reviewStatus: "verified",
  role: "defender",
  complexity: "beginner",
  tags: ["melee"],
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
  savingThrows: ["Strength", "Constitution"],
  skills: ["Athletics", "Perception"],
  senses: ["Passive Perception 12"],
  languages: ["Common"],
  proficiencies: ["All armor", "Shields", "Simple and martial weapons"],
  attacks: [{ id: "longsword", name: "Longsword", attackBonus: 5, range: "5 ft.", damage: "1d8 + 3 slashing" }],
  resources: [{ id: "second-wind", name: "Second Wind", maximum: 1, recovery: "short-rest" }],
  features: ["Fighting Style", "Second Wind"],
  actions: ["Attack", "Dash", "Disengage", "Dodge", "Help", "Hide", "Ready", "Search"],
  bonusActions: ["Second Wind"],
  reactions: ["Opportunity Attack"],
  equipment: ["Longsword", "Shield", "Chain Mail"],
  personality: ["Protects the group"],
  tactics: ["Stay between enemies and vulnerable allies."],
  sourceRefs: [{ title: "SRD 5.2.1", url: "https://www.dndbeyond.com/srd", license: "CC-BY-4.0", edition: "dnd-2024" }],
  reviewedAt: "2026-07-26"
};

const allFilters = {
  edition: "all",
  classId: "all",
  subclassId: "all",
  level: "all",
  role: "all",
  complexity: "all",
  sourceScope: "all"
} as const;

describe("pregen catalog rules", () => {
  it("calculates ability modifiers and proficiency bonuses", () => {
    expect(abilityModifier(8)).toBe(-1);
    expect(abilityModifier(16)).toBe(3);
    expect(proficiencyBonusForLevel(1)).toBe(2);
    expect(proficiencyBonusForLevel(20)).toBe(6);
  });

  it("rejects invalid levels instead of inventing progression", () => {
    expect(() => proficiencyBonusForLevel(0)).toThrow(RangeError);
    expect(() => proficiencyBonusForLevel(21)).toThrow(RangeError);
  });

  it("requires complete edition-consistent verified records", () => {
    expect(validatePregenCharacter(validCharacter)).toEqual([]);
    expect(isReadyToPlay(validCharacter)).toBe(true);

    const mixedEdition = {
      ...validCharacter,
      sourceRefs: [{ ...validCharacter.sourceRefs[0], edition: "dnd-2014" as const }]
    };
    expect(validatePregenCharacter(mixedEdition)).toContain("Source references cannot mix editions.");
    expect(isReadyToPlay(mixedEdition)).toBe(false);
  });

  it("hides draft records from the public picker", () => {
    const draft = { ...validCharacter, id: "draft", reviewStatus: "draft" as const };
    expect(filterPregenCharacters([validCharacter, draft], allFilters)).toEqual([validCharacter]);
  });
});
