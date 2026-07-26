import { describe, expect, it } from "vitest";
import type { DndPregenCharacterRecord } from "../types/dndPregenCharacter";
import {
  dndAbilityModifier,
  dndProficiencyBonusForLevel,
  isDndPregenReadyToPlay,
  validateDndPregenCharacter
} from "./dndPregenCharacter";

const validRecord: DndPregenCharacterRecord = {
  id: "sample-guardian-2024-1",
  slotId: "srd-5.2.1-2024-fighter-champion-1",
  name: "Sample Guardian",
  ruleset: "srd-5.2.1-2024",
  level: 1,
  classId: "fighter",
  className: "Fighter",
  subclassId: "champion",
  subclassName: "Champion",
  speciesId: "human",
  speciesName: "Human",
  backgroundId: "soldier",
  backgroundName: "Soldier",
  sourceScope: "public-srd",
  reviewStatus: "verified",
  role: "defender",
  complexity: "beginner",
  tags: ["melee", "shield"],
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
  personality: ["Protects vulnerable allies."],
  tactics: ["Stand between enemies and vulnerable allies."],
  sourceRefs: [{
    title: "SRD 5.2.1",
    url: "https://www.dndbeyond.com/srd",
    license: "CC-BY-4.0",
    ruleset: "srd-5.2.1-2024"
  }],
  reviewedAt: "2026-07-26"
};

describe("D&D ready-to-play pregen validation", () => {
  it("derives standard ability and proficiency values", () => {
    expect(dndAbilityModifier(8)).toBe(-1);
    expect(dndAbilityModifier(16)).toBe(3);
    expect(dndProficiencyBonusForLevel(1)).toBe(2);
    expect(dndProficiencyBonusForLevel(20)).toBe(6);
  });

  it("rejects levels outside the supported range", () => {
    expect(() => dndProficiencyBonusForLevel(0)).toThrow(RangeError);
    expect(() => dndProficiencyBonusForLevel(21)).toThrow(RangeError);
  });

  it("accepts a complete verified record", () => {
    expect(validateDndPregenCharacter(validRecord)).toEqual([]);
    expect(isDndPregenReadyToPlay(validRecord)).toBe(true);
  });

  it("rejects mismatched slot identity and edition sources", () => {
    const invalid = {
      ...validRecord,
      slotId: "srd-5.2.1-2024-fighter-other-subclass-1",
      sourceRefs: [{ ...validRecord.sourceRefs[0], ruleset: "srd-5.1-2014" as const }]
    };
    expect(validateDndPregenCharacter(invalid)).toEqual(expect.arrayContaining([
      "Character slot id does not match ruleset, class, subclass, and level.",
      "Source references cannot mix rules editions."
    ]));
    expect(isDndPregenReadyToPlay(invalid)).toBe(false);
  });

  it("keeps complete drafts out of the ready catalog", () => {
    const draft = { ...validRecord, reviewStatus: "draft" as const, reviewedAt: undefined };
    expect(validateDndPregenCharacter(draft)).toEqual([]);
    expect(isDndPregenReadyToPlay(draft)).toBe(false);
  });
});
