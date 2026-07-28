import type { DndCharacterRecord } from "../types/dndCharacter";
import type { RulesetId } from "../types/ruleCards";
import { dndRoguePregens2014 } from "./dndRoguePregens2014";
import { dndRoguePregens2024 } from "./dndRoguePregens2024";

export const dndRoguePregenRecords: DndCharacterRecord[] = [
  ...dndRoguePregens2014,
  ...dndRoguePregens2024
];

export const getDndRoguePregenRecord = (
  ruleset: RulesetId,
  level: number
): DndCharacterRecord | undefined => dndRoguePregenRecords.find((record) => (
  record.ruleset === ruleset && record.level === level
));
