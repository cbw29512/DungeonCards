import type {
  DndAbilityId,
  DndPregenCharacterRecord
} from "../types/dndPregenCharacter";

const abilityIds: DndAbilityId[] = [
  "strength",
  "dexterity",
  "constitution",
  "intelligence",
  "wisdom",
  "charisma"
];

export const dndAbilityModifier = (score: number): number => Math.floor((score - 10) / 2);

export const dndProficiencyBonusForLevel = (level: number): number => {
  if (!Number.isInteger(level) || level < 1 || level > 20) {
    throw new RangeError("D&D character level must be an integer from 1 through 20.");
  }
  return Math.ceil(level / 4) + 1;
};

export const expectedDndPregenSlotId = (record: DndPregenCharacterRecord): string => (
  `${record.ruleset}-${record.classId}-${record.subclassId}-${record.level}`
);

const validateSourceUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:";
  } catch (error) {
    console.error("Invalid pregen source URL", { url, error });
    return false;
  }
};

export const validateDndPregenCharacter = (record: DndPregenCharacterRecord): string[] => {
  const issues: string[] = [];

  try {
    if (!record.id.trim()) issues.push("Character id is required.");
    if (!record.name.trim()) issues.push("Character name is required.");
    if (record.slotId !== expectedDndPregenSlotId(record)) {
      issues.push("Character slot id does not match ruleset, class, subclass, and level.");
    }

    if (!Number.isInteger(record.level) || record.level < 1 || record.level > 20) {
      issues.push("Level must be an integer from 1 through 20.");
    } else if (record.proficiencyBonus !== dndProficiencyBonusForLevel(record.level)) {
      issues.push("Proficiency bonus does not match the character level.");
    }

    for (const ability of abilityIds) {
      const score = record.abilityScores[ability];
      if (!Number.isInteger(score) || score < 1 || score > 30) {
        issues.push(`${ability} must be an integer from 1 through 30.`);
      }
    }

    if (!Number.isInteger(record.armorClass) || record.armorClass < 1) issues.push("Armor Class must be a positive integer.");
    if (!Number.isInteger(record.maxHitPoints) || record.maxHitPoints < 1) issues.push("Maximum Hit Points must be a positive integer.");
    if (!Number.isInteger(record.speed) || record.speed < 0) issues.push("Speed must be a nonnegative integer.");
    if (!Number.isInteger(record.initiative)) issues.push("Initiative must be an integer.");
    if (!record.classId || !record.className.trim()) issues.push("Class identity is required.");
    if (!record.subclassId.trim() || !record.subclassName.trim()) issues.push("Subclass identity is required.");
    if (!record.speciesId.trim() || !record.speciesName.trim()) issues.push("Species identity is required.");
    if (!record.backgroundId.trim() || !record.backgroundName.trim()) issues.push("Background identity is required.");

    if (record.sourceRefs.length === 0) issues.push("At least one source reference is required.");
    if (record.sourceRefs.some((source) => source.ruleset !== record.ruleset)) {
      issues.push("Source references cannot mix rules editions.");
    }
    if (record.sourceRefs.some((source) => !validateSourceUrl(source.url))) {
      issues.push("Every source reference must use a valid HTTPS URL.");
    }

    if (record.attacks.length === 0 && record.actions.length === 0) issues.push("At least one attack or action is required.");
    if (record.equipment.length === 0) issues.push("Equipment is required.");
    if (record.tactics.length === 0) issues.push("Table tactics are required.");

    if (record.spellcasting) {
      const ability = dndAbilityModifier(record.abilityScores[record.spellcasting.ability]);
      const expectedAttack = ability + record.proficiencyBonus;
      const expectedDc = 8 + expectedAttack;
      if (record.spellcasting.attackBonus !== expectedAttack) issues.push("Spell attack bonus does not match the standard formula.");
      if (record.spellcasting.saveDc !== expectedDc) issues.push("Spell save DC does not match the standard formula.");
    }

    if (record.reviewStatus === "verified" && !record.reviewedAt) {
      issues.push("Verified characters require a review date.");
    }
  } catch (error) {
    console.error("Unexpected pregen validation failure", { recordId: record.id, error });
    issues.push("Character validation failed unexpectedly.");
  }

  return issues;
};

export const isDndPregenReadyToPlay = (record: DndPregenCharacterRecord): boolean => (
  record.reviewStatus === "verified" && validateDndPregenCharacter(record).length === 0
);
