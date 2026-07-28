import type { DndCharacterRecord } from "../types/dndCharacter";
import type { RulesetId } from "../types/ruleCards";
import { dndPaladinPregens2014 } from "./dndPaladinPregens2014";
import { dndPaladinPregens2024 } from "./dndPaladinPregens2024";

export const dndPaladinPregenRecords: DndCharacterRecord[] = [
  ...dndPaladinPregens2014,
  ...dndPaladinPregens2024
];

export const getDndPaladinPregenRecord = (
  ruleset: RulesetId,
  level: number
): DndCharacterRecord | undefined => dndPaladinPregenRecords.find((record) => (
  record.ruleset === ruleset && record.level === level
));
