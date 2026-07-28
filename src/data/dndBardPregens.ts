import type { DndCharacterRecord } from "../types/dndCharacter";
import type { RulesetId } from "../types/ruleCards";
import { dndBardPregens2014 } from "./dndBardPregens2014";
import { dndBardPregens2024 } from "./dndBardPregens2024";

export const dndBardPregenRecords: DndCharacterRecord[] = [
  ...dndBardPregens2014,
  ...dndBardPregens2024
];

export const getDndBardPregenRecord = (
  ruleset: RulesetId,
  level: number
): DndCharacterRecord | undefined => dndBardPregenRecords.find((record) => (
  record.ruleset === ruleset && record.level === level
));
