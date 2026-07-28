import type { DndCharacterRecord } from "../types/dndCharacter";
import type { RulesetId } from "../types/ruleCards";
import { dndWizardPregens2014 } from "./dndWizardPregens2014";
import { dndWizardPregens2024 } from "./dndWizardPregens2024";

export const dndWizardPregenRecords: DndCharacterRecord[] = [
  ...dndWizardPregens2014,
  ...dndWizardPregens2024
];

export const getDndWizardPregenRecord = (
  ruleset: RulesetId,
  level: number
): DndCharacterRecord | undefined => dndWizardPregenRecords.find((record) => (
  record.ruleset === ruleset && record.level === level
));
