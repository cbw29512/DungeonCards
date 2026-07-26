import { describe, expect, it } from "vitest";
import { dndFighterPregenRecords } from "../data/dndFighterPregens";
import type {
  DndMagicItemSelection,
  DndOptimizedBuildProfile
} from "../types/dndCharacterVault";
import {
  dndMagicItemBudgetForLevel,
  isDndCharacterVaultReady,
  validateDndOptimizedBuild
} from "./dndCharacterVaultValidation";

const source = {
  label: "SRD 5.2.1",
  url: "https://www.dndbeyond.com/srd",
  scope: "public-srd" as const
};

const magicItem = (
  id: string,
  name: string,
  rarity: DndMagicItemSelection["rarity"],
  attunedByDefault = false
): DndMagicItemSelection => ({
  id,
  name,
  rarity,
  category: "wondrous-item",
  source,
  minimumLevel: 1,
  requiresAttunement: attunedByDefault,
  attunedByDefault,
  consumable: false,
  effectSummary: `${name} provides a tested character benefit.`,
  synergyNote: `${name} supports the build's defender role.`
});

const fighter = dndFighterPregenRecords.find((record) => (
  record.ruleset === "srd-5.2.1-2024" && record.level === 5
));

if (!fighter) throw new Error("Expected a level 5 2024 Fighter pregen fixture.");

const validProfile: DndOptimizedBuildProfile = {
  id: "rowan-ironmark-vault-5",
  buildSlotId: fighter.buildSlotId,
  ruleset: fighter.ruleset,
  classId: fighter.classId,
  subclassId: fighter.subclassId,
  level: fighter.level,
  role: "defender",
  complexity: "beginner",
  buildGoal: "Hold the front line and protect less durable allies.",
  optimizationNotes: ["Prioritize Strength, Constitution, and reliable Armor Class."],
  tactics: ["Open beside a vulnerable ally and pressure the most dangerous melee target."],
  advancementChoices: [{
    id: "fighter-level-4-strength",
    gainedAtLevel: 4,
    kind: "ability-score",
    name: "Strength +2",
    source,
    abilityChanges: { str: 2 },
    synergyNote: "Improves attack accuracy, damage, and Strength checks."
  }],
  magicItems: [
    magicItem("common-heirloom", "Guardian's Heirloom", "common"),
    magicItem("uncommon-ward", "Warding Emblem", "uncommon", true)
  ],
  character: fighter,
  sheetVersion: 2,
  reviewStatus: "verified",
  reviewedAt: "2026-07-26"
};

describe("Character Vault validation", () => {
  it("uses the higher-level starting magic-item budgets", () => {
    expect(dndMagicItemBudgetForLevel(1)).toEqual({ common: 0, uncommon: 0, rare: 0, "very-rare": 0, legendary: 0 });
    expect(dndMagicItemBudgetForLevel(4)).toEqual({ common: 1, uncommon: 0, rare: 0, "very-rare": 0, legendary: 0 });
    expect(dndMagicItemBudgetForLevel(10)).toEqual({ common: 1, uncommon: 1, rare: 0, "very-rare": 0, legendary: 0 });
    expect(dndMagicItemBudgetForLevel(16)).toEqual({ common: 2, uncommon: 3, rare: 1, "very-rare": 0, legendary: 0 });
    expect(dndMagicItemBudgetForLevel(20)).toEqual({ common: 2, uncommon: 4, rare: 3, "very-rare": 1, legendary: 0 });
  });

  it("accepts a complete verified optimized build", () => {
    expect(validateDndOptimizedBuild(validProfile)).toEqual([]);
    expect(isDndCharacterVaultReady(validProfile)).toBe(true);
  });

  it("rejects budget, attunement, and level violations", () => {
    const invalid: DndOptimizedBuildProfile = {
      ...validProfile,
      magicItems: [
        ...validProfile.magicItems,
        { ...magicItem("extra-one", "Extra Ward", "uncommon", true), minimumLevel: 8 },
        magicItem("extra-two", "Second Ward", "uncommon", true),
        magicItem("extra-three", "Third Ward", "uncommon", true)
      ]
    };
    const issues = validateDndOptimizedBuild(invalid);
    expect(issues.some((issue) => issue.includes("budget mismatch"))).toBe(true);
    expect(issues).toContain("Extra Ward requires a higher character level.");
    expect(issues).toContain("A character cannot be attuned to more than three magic items.");
  });

  it("keeps drafts out of the public Vault", () => {
    const draft = { ...validProfile, reviewStatus: "draft" as const, reviewedAt: undefined };
    expect(validateDndOptimizedBuild(draft)).toEqual([]);
    expect(isDndCharacterVaultReady(draft)).toBe(false);
  });
});
