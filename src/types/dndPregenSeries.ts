import type { DndPregenClassId } from "../data/dndPregenCatalog";
import type { DndCharacterRecord, DndCharacterSource } from "./dndCharacter";
import type { RulesetId } from "./ruleCards";

export type DndPregenLevel =
  | 1 | 2 | 3 | 4 | 5
  | 6 | 7 | 8 | 9 | 10
  | 11 | 12 | 13 | 14 | 15
  | 16 | 17 | 18 | 19 | 20;

type LevelPackageKeys =
  | "abilityScores"
  | "hitDie"
  | "maximumHitPoints"
  | "armorClass"
  | "speedFeet"
  | "savingThrowProficiencies"
  | "skillProficiencies"
  | "languages"
  | "toolProficiencies"
  | "senses"
  | "attacks"
  | "resources"
  | "spellcastingExpected"
  | "spellcasting"
  | "classFeatures"
  | "subclassFeatures"
  | "advancementChoices"
  | "equipment"
  | "currencyGp"
  | "notes"
  | "printableSummaryReady";

export type DndPregenLevelPackage = Pick<DndCharacterRecord, LevelPackageKeys>;

export type DndPregenSeriesBlueprint = {
  id: string;
  name: string;
  ruleset: RulesetId;
  classId: DndPregenClassId;
  className: string;
  subclassId: string;
  subclassName: string;
  subclassUnlockLevel: number;
  species: string;
  background: string;
  sources: DndCharacterSource[];
  levels: Partial<Record<DndPregenLevel, DndPregenLevelPackage>>;
};
