import type { DndCharacterRecord } from "../types/dndCharacter";
import type { RulesetId } from "../types/ruleCards";
import { dndRangerPregens2014 } from "./dndRangerPregens2014";
import { dndRangerPregens2024 } from "./dndRangerPregens2024";

export const dndRangerPregenRecords: DndCharacterRecord[] = [
  ...dndRangerPregens2014,
  ...dndRangerPregens2024
];

export const getDndRangerPregenRecord = (
  ruleset: RulesetId,
  level: number
): DndCharacterRecord | undefined => dndRangerPregenRecords.find((record) => (
  record.ruleset === ruleset && record.level === level
));
