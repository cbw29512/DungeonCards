import type { DndPregenCharacterRecord } from "../types/dndPregenCharacter";
import type {
  DndPregenBlueprint,
  DndPregenLevel
} from "../types/dndPregenBlueprint";
import { validateDndPregenCharacter } from "./dndPregenCharacter";

export const dndPregenLevels: DndPregenLevel[] = [
  1, 2, 3, 4, 5,
  6, 7, 8, 9, 10,
  11, 12, 13, 14, 15,
  16, 17, 18, 19, 20
];

export type DndPregenGenerationResult =
  | { ok: true; record: DndPregenCharacterRecord }
  | { ok: false; level: number; issues: string[] };

const isDndPregenLevel = (level: number): level is DndPregenLevel => (
  Number.isInteger(level) && dndPregenLevels.includes(level as DndPregenLevel)
);

export const generateDndPregenCharacter = (
  blueprint: DndPregenBlueprint,
  level: number
): DndPregenGenerationResult => {
  try {
    if (!isDndPregenLevel(level)) {
      return { ok: false, level, issues: ["Pregen level must be an integer from 1 through 20."] };
    }

    const levelPackage = blueprint.levels[level];
    if (!levelPackage) {
      return { ok: false, level, issues: [`${blueprint.id} has no reviewed package for level ${level}.`] };
    }

    const record: DndPregenCharacterRecord = {
      id: `${blueprint.id}-${level}`,
      slotId: `${blueprint.ruleset}-${blueprint.classId}-${blueprint.subclassId}-${level}`,
      name: blueprint.name,
      ruleset: blueprint.ruleset,
      level,
      classId: blueprint.classId,
      className: blueprint.className,
      subclassId: blueprint.subclassId,
      subclassName: blueprint.subclassName,
      speciesId: blueprint.speciesId,
      speciesName: blueprint.speciesName,
      backgroundId: blueprint.backgroundId,
      backgroundName: blueprint.backgroundName,
      sourceScope: blueprint.sourceScope,
      role: blueprint.role,
      complexity: blueprint.complexity,
      tags: [...blueprint.tags],
      personality: [...blueprint.personality],
      tactics: [...blueprint.tactics],
      sourceRefs: blueprint.sourceRefs.map((source) => ({ ...source })),
      ...levelPackage
    };

    const issues = validateDndPregenCharacter(record);
    return issues.length === 0
      ? { ok: true, record }
      : { ok: false, level, issues };
  } catch (error) {
    console.error("Unexpected pregen generation failure", {
      blueprintId: blueprint.id,
      level,
      error
    });
    return { ok: false, level, issues: ["Pregen generation failed unexpectedly."] };
  }
};

export const generateDndPregenSeries = (
  blueprint: DndPregenBlueprint
): DndPregenGenerationResult[] => dndPregenLevels.map((level) => (
  generateDndPregenCharacter(blueprint, level)
));
