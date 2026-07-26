import type {
  AbilityId,
  PregenCatalogFilters,
  PregenCharacter
} from "../types/pregens";

const abilityIds: AbilityId[] = [
  "strength",
  "dexterity",
  "constitution",
  "intelligence",
  "wisdom",
  "charisma"
];

export function abilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function proficiencyBonusForLevel(level: number): number {
  if (!Number.isInteger(level) || level < 1 || level > 20) {
    throw new RangeError("Character level must be an integer from 1 through 20.");
  }
  return Math.ceil(level / 4) + 1;
}

export function validatePregenCharacter(character: PregenCharacter): string[] {
  const issues: string[] = [];

  if (!character.id.trim()) issues.push("Character id is required.");
  if (!character.blueprintId.trim()) issues.push("Blueprint id is required.");
  if (!character.name.trim()) issues.push("Character name is required.");
  if (!Number.isInteger(character.level) || character.level < 1 || character.level > 20) {
    issues.push("Level must be an integer from 1 through 20.");
  } else if (character.proficiencyBonus !== proficiencyBonusForLevel(character.level)) {
    issues.push("Proficiency bonus does not match the character level.");
  }

  for (const ability of abilityIds) {
    const score = character.abilityScores[ability];
    if (!Number.isInteger(score) || score < 1 || score > 30) {
      issues.push(`${ability} must be an integer from 1 through 30.`);
    }
  }

  if (character.maxHitPoints < 1) issues.push("Maximum Hit Points must be positive.");
  if (character.armorClass < 1) issues.push("Armor Class must be positive.");
  if (character.speed < 0) issues.push("Speed cannot be negative.");
  if (!character.classId.trim() || !character.className.trim()) issues.push("Class identity is required.");
  if (!character.subclassId.trim() || !character.subclassName.trim()) issues.push("Subclass identity is required.");
  if (!character.speciesId.trim() || !character.speciesName.trim()) issues.push("Species identity is required.");
  if (!character.backgroundId.trim() || !character.backgroundName.trim()) issues.push("Background identity is required.");
  if (character.sourceRefs.length === 0) issues.push("At least one source reference is required.");
  if (character.sourceRefs.some((source) => source.edition !== character.edition)) {
    issues.push("Source references cannot mix editions.");
  }
  if (character.attacks.length === 0 && character.actions.length === 0) {
    issues.push("At least one attack or action is required.");
  }
  if (character.equipment.length === 0) issues.push("Equipment is required.");
  if (character.tactics.length === 0) issues.push("Table tactics are required.");
  if (character.reviewStatus === "verified" && !character.reviewedAt) {
    issues.push("Verified characters require a review date.");
  }

  return issues;
}

export function isReadyToPlay(character: PregenCharacter): boolean {
  return character.reviewStatus === "verified" && validatePregenCharacter(character).length === 0;
}

export function filterPregenCharacters(
  characters: PregenCharacter[],
  filters: PregenCatalogFilters
): PregenCharacter[] {
  return characters.filter((character) =>
    isReadyToPlay(character)
    && (filters.edition === "all" || character.edition === filters.edition)
    && (filters.classId === "all" || character.classId === filters.classId)
    && (filters.subclassId === "all" || character.subclassId === filters.subclassId)
    && (filters.level === "all" || character.level === filters.level)
    && (filters.role === "all" || character.role === filters.role)
    && (filters.complexity === "all" || character.complexity === filters.complexity)
    && (filters.sourceScope === "all" || character.sourceScope === filters.sourceScope)
  );
}

export function uniquePregenValues(
  characters: PregenCharacter[],
  key: "classId" | "subclassId"
): string[] {
  return [...new Set(characters.filter(isReadyToPlay).map((character) => character[key]))].sort();
}
