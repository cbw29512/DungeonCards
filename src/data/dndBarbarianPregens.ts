import type { DndCharacterRecord } from "../types/dndCharacter";
import type { RulesetId } from "../types/ruleCards";
import { dndBarbarian2014Pregens } from "./dndBarbarian2014Pregens";
import { dndBarbarian2024Pregens } from "./dndBarbarian2024Pregens";

export const dndBarbarianPregenRecords: DndCharacterRecord[] = [
  ...dndBarbarian2014Pregens,
  ...dndBarbarian2024Pregens
];

export const getDndBarbarianPregenRecord = (
  ruleset: RulesetId,
  level: number
): DndCharacterRecord | undefined => dndBarbarianPregenRecords.find((record) => (
  record.ruleset === ruleset && record.level === level
));
