import type { DndCharacterRecord } from "../types/dndCharacter";
import type { RulesetId } from "../types/ruleCards";
import { dndBarbarianPregenRecords } from "./dndBarbarianPregens";
import { dndFighterPregenRecords } from "./dndFighterPregens";

export const dndReadyPregenRecords: DndCharacterRecord[] = [
  ...dndBarbarianPregenRecords,
  ...dndFighterPregenRecords
];

export const getDndReadyPregenRecord = (
  ruleset: RulesetId,
  classId: string,
  level: number
): DndCharacterRecord | undefined => dndReadyPregenRecords.find((record) => (
  record.ruleset === ruleset && record.classId === classId && record.level === level
));

export const countDndReadyPregens = (ruleset: RulesetId): number =>
  dndReadyPregenRecords.filter((record) => record.ruleset === ruleset).length;
