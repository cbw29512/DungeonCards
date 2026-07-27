import type {
  DndMagicItemRarity,
  DndOptimizedBuildProfile
} from "../types/dndCharacterVault";
import { validateDndCharacterRecord } from "./dndCharacterValidation";

export type DndMagicItemBudget = Record<DndMagicItemRarity, number>;

const emptyBudget = (): DndMagicItemBudget => ({
  common: 0,
  uncommon: 0,
  rare: 0,
  "very-rare": 0,
  legendary: 0
});

/**
 * 2024 follows the official Starting Equipment at Higher Levels guide.
 * 2014 uses the same conservative Vault preset, clearly labeled as an
 * original compatibility policy rather than an official 2014 table.
 */
export const dndMagicItemBudgetForLevel = (level: number): DndMagicItemBudget => {
  if (!Number.isInteger(level) || level < 1 || level > 20) {
    throw new RangeError("Character level must be an integer from 1 through 20.");
  }
  if (level === 1) return emptyBudget();
  if (level <= 4) return { ...emptyBudget(), common: 1 };
  if (level <= 10) return { ...emptyBudget(), common: 1, uncommon: 1 };
  if (level <= 16) return { ...emptyBudget(), common: 2, uncommon: 3, rare: 1 };
  return { ...emptyBudget(), common: 2, uncommon: 4, rare: 3, "very-rare": 1 };
};

const countItemsByRarity = (profile: DndOptimizedBuildProfile): DndMagicItemBudget => {
  const counts = emptyBudget();
  for (const item of profile.magicItems) counts[item.rarity] += 1;
  return counts;
};

const expectedBuildSlotId = (profile: DndOptimizedBuildProfile): string => (
  `${profile.ruleset}-${profile.classId}-${profile.subclassId}-${profile.level}`
);

export const validateDndOptimizedBuild = (profile: DndOptimizedBuildProfile): string[] => {
  const issues: string[] = [];

  try {
    const characterValidation = validateDndCharacterRecord(profile.character);
    issues.push(...characterValidation.issues.map((issue) => `Base character ${issue.category}: ${issue.message}`));

    if (profile.sheetVersion !== 2) issues.push("Character Vault records must use sheet version 2.");
    if (profile.buildSlotId !== expectedBuildSlotId(profile)) issues.push("Build slot identity does not match edition, class, subclass, and level.");
    if (profile.character.buildSlotId !== profile.buildSlotId) issues.push("Character record and optimized profile reference different build slots.");
    if (profile.character.level !== profile.level) issues.push("Character record and optimized profile use different levels.");
    if (!profile.buildGoal.trim()) issues.push("Build goal is required.");
    if (profile.optimizationNotes.length === 0) issues.push("Optimization notes are required.");
    if (profile.tactics.length === 0) issues.push("At least one ready-to-play tactic is required.");

    const choiceIds = new Set<string>();
    for (const choice of profile.advancementChoices) {
      if (!choice.id.trim() || !choice.name.trim()) issues.push("Every advancement choice needs an ID and name.");
      if (choiceIds.has(choice.id)) issues.push(`Duplicate advancement choice ID: ${choice.id}`);
      choiceIds.add(choice.id);
      if (choice.gainedAtLevel < 1 || choice.gainedAtLevel > profile.level) issues.push(`${choice.name} is assigned at an invalid level.`);
      if (!choice.synergyNote.trim()) issues.push(`${choice.name} needs an optimization explanation.`);
      if (!choice.source.label.trim() || !choice.source.url.startsWith("https://")) issues.push(`${choice.name} needs a valid HTTPS source.`);
    }

    const budget = dndMagicItemBudgetForLevel(profile.level);
    const actual = countItemsByRarity(profile);
    for (const rarity of Object.keys(budget) as DndMagicItemRarity[]) {
      if (actual[rarity] !== budget[rarity]) issues.push(`Magic-item budget mismatch for ${rarity}: expected ${budget[rarity]}, received ${actual[rarity]}.`);
    }

    const itemIds = new Set<string>();
    const attunedNames = new Set<string>();
    let attunedCount = 0;
    for (const item of profile.magicItems) {
      if (itemIds.has(item.id)) issues.push(`Duplicate magic-item ID: ${item.id}`);
      itemIds.add(item.id);
      if (item.minimumLevel > profile.level) issues.push(`${item.name} requires a higher character level.`);
      if (item.attunedByDefault && !item.requiresAttunement) issues.push(`${item.name} cannot be attuned because it does not require attunement.`);
      if (item.attunedByDefault) {
        attunedCount += 1;
        if (attunedNames.has(item.name)) issues.push(`A character cannot attune to multiple copies of ${item.name}.`);
        attunedNames.add(item.name);
      }
      if (item.maximumCharges !== undefined && (!Number.isInteger(item.maximumCharges) || item.maximumCharges < 1)) issues.push(`${item.name} has an invalid charge maximum.`);
      if (!item.effectSummary.trim() || !item.synergyNote.trim()) issues.push(`${item.name} needs effect and synergy summaries.`);
      if (!item.source.label.trim() || !item.source.url.startsWith("https://")) issues.push(`${item.name} needs a valid HTTPS source.`);
    }
    if (attunedCount > 3) issues.push("A character cannot be attuned to more than three magic items.");
    if (profile.reviewStatus === "verified" && !profile.reviewedAt) issues.push("Verified Vault builds require a review date.");
  } catch (error) {
    console.error("Unexpected Character Vault validation failure", { profileId: profile.id, error });
    issues.push("Character Vault validation failed unexpectedly.");
  }

  return issues;
};

export const isDndCharacterVaultReady = (profile: DndOptimizedBuildProfile): boolean => (
  profile.reviewStatus === "verified" && validateDndOptimizedBuild(profile).length === 0
);
