import type {
  DndCharacterRecord,
  DndCharacterValidation,
  DndCharacterValidationCategory,
  DndCharacterValidationIssue
} from "../types/dndCharacter";
import { dndAbilityIds } from "./dndCharacterMath";

const addIssue = (
  issues: DndCharacterValidationIssue[],
  category: DndCharacterValidationCategory,
  condition: boolean,
  message: string
) => {
  if (condition) issues.push({ category, message });
};

const unique = <T,>(values: T[]): T[] => [...new Set(values)];

export const expectedDndCharacterBuildSlotId = (record: DndCharacterRecord): string => (
  `${record.ruleset}-${record.classId}-${record.subclassId}-${record.level}`
);

export const validateDndCharacterRecord = (record: DndCharacterRecord): DndCharacterValidation => {
  const issues: DndCharacterValidationIssue[] = [];

  addIssue(issues, "identity", !record.name.trim(), "Character name is missing.");
  addIssue(issues, "identity", !record.species.trim(), "Species is missing.");
  addIssue(issues, "identity", !record.background.trim(), "Background is missing.");
  addIssue(issues, "identity", record.level < 1 || record.level > 20, "Character level must be between 1 and 20.");
  addIssue(issues, "identity", !record.className.trim() || !record.subclassId.trim() || !record.subclassName.trim(), "Class or subclass path is missing.");
  addIssue(issues, "identity", record.subclassUnlockLevel < 1 || record.subclassUnlockLevel > 20, "Subclass unlock level is invalid.");
  addIssue(issues, "identity", record.buildSlotId !== expectedDndCharacterBuildSlotId(record), "Build slot does not match edition, class, subclass, and level.");

  for (const ability of dndAbilityIds) {
    const score = record.abilityScores[ability];
    addIssue(issues, "abilities", !Number.isInteger(score) || score < 1 || score > 30, `${ability.toUpperCase()} must be an integer from 1 to 30.`);
  }

  addIssue(issues, "defenses", !Number.isInteger(record.maximumHitPoints) || record.maximumHitPoints < 1, "Maximum Hit Points must be at least 1.");
  addIssue(issues, "defenses", !Number.isInteger(record.armorClass) || record.armorClass < 1, "Armor Class must be at least 1.");
  addIssue(issues, "defenses", !Number.isInteger(record.speedFeet) || record.speedFeet < 0, "Speed must be a nonnegative whole number.");

  addIssue(
    issues,
    "proficiencies",
    record.savingThrowProficiencies.length < 2 || record.savingThrowProficiencies.length > dndAbilityIds.length,
    "A character needs at least two and no more than six saving throw proficiencies."
  );
  addIssue(issues, "proficiencies", new Set(record.savingThrowProficiencies).size !== record.savingThrowProficiencies.length, "Saving throw proficiencies must be unique.");
  addIssue(issues, "proficiencies", record.skillProficiencies.length === 0, "At least one skill proficiency is required.");
  addIssue(issues, "proficiencies", record.languages.length === 0, "At least one language is required.");

  addIssue(issues, "combat", record.attacks.length === 0, "At least one executable attack or combat action is required.");
  addIssue(issues, "combat", record.attacks.some((attack) => !attack.id || !attack.name.trim() || !attack.damageFormula.trim() || !attack.damageType.trim() || !attack.rangeOrReach.trim()), "Every attack needs an ID, name, damage formula, damage type, and range or reach.");

  addIssue(issues, "resources", record.classFeatures.length === 0, "Class features for this level are missing.");
  addIssue(issues, "resources", record.resources.some((resource) => {
    const invalidMaximum = resource.maximum !== "unlimited" && (!Number.isInteger(resource.maximum) || resource.maximum < 1);
    return !resource.id || !resource.name.trim() || invalidMaximum;
  }), "Every tracked resource needs an ID, name, and a positive or unlimited maximum.");

  addIssue(issues, "spellcasting", record.spellcastingExpected && record.spellcasting.kind === "none", "This class and level require a complete spellcasting profile.");
  if (record.spellcasting.kind !== "none") {
    const castingScore = record.abilityScores[record.spellcasting.ability];
    addIssue(issues, "spellcasting", castingScore < 1, "Spellcasting ability is invalid.");
    addIssue(issues, "spellcasting", record.spellcasting.cantrips.length === 0 && record.spellcasting.spells.length === 0, "A spellcaster needs at least one cantrip or spell.");
    addIssue(issues, "spellcasting", Object.values(record.spellcasting.slotsByLevel).some((slots) => slots !== undefined && (!Number.isInteger(slots) || slots < 0)), "Spell-slot counts must be nonnegative whole numbers.");
  }

  addIssue(issues, "advancement", record.level >= 4 && record.advancementChoices.length === 0, "Level-earned advancement choices are missing.");
  addIssue(issues, "advancement", record.classFeatures.length === 0, "Class progression has not been applied.");
  addIssue(issues, "advancement", record.level >= record.subclassUnlockLevel && record.subclassFeatures.length === 0, "Subclass features for this level are missing.");
  addIssue(issues, "equipment", record.equipment.length === 0, "Starting or level-appropriate equipment is missing.");
  addIssue(issues, "equipment", !Number.isFinite(record.currencyGp) || record.currencyGp < 0, "Currency must be a nonnegative number.");
  addIssue(issues, "sources", record.sources.length === 0, "At least one source reference is required.");
  addIssue(issues, "sources", record.sources.some((source) => !source.label.trim() || !source.url.trim()), "Every source needs a label and URL.");
  addIssue(issues, "print", !record.printableSummaryReady, "Printable quick-play output has not passed review.");

  const categories: DndCharacterValidationCategory[] = ["identity", "abilities", "defenses", "proficiencies", "combat", "resources", "spellcasting", "advancement", "equipment", "sources", "print"];
  const missingCategories = unique(issues.map((issue) => issue.category));
  return {
    ready: issues.length === 0,
    issues,
    completedCategories: categories.filter((category) => !missingCategories.includes(category)),
    missingCategories
  };
};
