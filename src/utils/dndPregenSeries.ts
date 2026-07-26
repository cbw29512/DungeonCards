import type { DndCharacterRecord } from "../types/dndCharacter";
import type {
  DndPregenLevel,
  DndPregenSeriesBlueprint
} from "../types/dndPregenSeries";
import { validateDndCharacterRecord } from "./dndCharacterValidation";

export const dndPregenLevels: DndPregenLevel[] = [
  1, 2, 3, 4, 5,
  6, 7, 8, 9, 10,
  11, 12, 13, 14, 15,
  16, 17, 18, 19, 20
];

export type DndPregenSeriesResult =
  | { ok: true; record: DndCharacterRecord }
  | { ok: false; level: number; issues: string[] };

const isDndPregenLevel = (level: number): level is DndPregenLevel => (
  Number.isInteger(level) && dndPregenLevels.includes(level as DndPregenLevel)
);

export const generateDndPregenLevel = (
  blueprint: DndPregenSeriesBlueprint,
  level: number
): DndPregenSeriesResult => {
  try {
    if (!isDndPregenLevel(level)) {
      return { ok: false, level, issues: ["Pregen level must be an integer from 1 through 20."] };
    }

    const levelPackage = blueprint.levels[level];
    if (!levelPackage) {
      return { ok: false, level, issues: [`${blueprint.id} has no reviewed package for level ${level}.`] };
    }

    const record: DndCharacterRecord = {
      id: `${blueprint.id}-${level}`,
      buildSlotId: `${blueprint.ruleset}-${blueprint.classId}-${blueprint.subclassId}-${level}`,
      ruleset: blueprint.ruleset,
      name: blueprint.name,
      classId: blueprint.classId,
      className: blueprint.className,
      subclassId: blueprint.subclassId,
      subclassName: blueprint.subclassName,
      subclassUnlockLevel: blueprint.subclassUnlockLevel,
      level,
      species: blueprint.species,
      background: blueprint.background,
      sources: blueprint.sources.map((source) => ({ ...source })),
      ...levelPackage
    };

    const validation = validateDndCharacterRecord(record);
    return validation.ready
      ? { ok: true, record }
      : { ok: false, level, issues: validation.issues.map((issue) => `${issue.category}: ${issue.message}`) };
  } catch (error) {
    console.error("Unexpected D&D pregen series generation failure", {
      blueprintId: blueprint.id,
      level,
      error
    });
    return { ok: false, level, issues: ["Pregen generation failed unexpectedly."] };
  }
};

export const generateDndPregenSeries = (
  blueprint: DndPregenSeriesBlueprint
): DndPregenSeriesResult[] => dndPregenLevels.map((level) => (
  generateDndPregenLevel(blueprint, level)
));
