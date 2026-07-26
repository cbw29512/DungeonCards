import type {
  DndPregenCharacterRecord,
  DndPregenComplexity,
  DndPregenRole,
  DndPregenSourceRef,
  DndPregenSourceScope
} from "./dndPregenCharacter";
import type { DndPregenClassId } from "../data/dndPregenCatalog";
import type { RulesetId } from "./ruleCards";

export type DndPregenLevel =
  | 1 | 2 | 3 | 4 | 5
  | 6 | 7 | 8 | 9 | 10
  | 11 | 12 | 13 | 14 | 15
  | 16 | 17 | 18 | 19 | 20;

type LevelRecordKeys =
  | "abilityScores"
  | "proficiencyBonus"
  | "armorClass"
  | "initiative"
  | "speed"
  | "maxHitPoints"
  | "hitDice"
  | "savingThrows"
  | "skills"
  | "senses"
  | "languages"
  | "proficiencies"
  | "attacks"
  | "resources"
  | "features"
  | "actions"
  | "bonusActions"
  | "reactions"
  | "spellcasting"
  | "equipment"
  | "currency"
  | "reviewStatus"
  | "reviewedAt";

export type DndPregenLevelPackage = Pick<DndPregenCharacterRecord, LevelRecordKeys>;

export type DndPregenBlueprint = {
  id: string;
  name: string;
  ruleset: RulesetId;
  classId: DndPregenClassId;
  className: string;
  subclassId: string;
  subclassName: string;
  speciesId: string;
  speciesName: string;
  backgroundId: string;
  backgroundName: string;
  sourceScope: DndPregenSourceScope;
  role: DndPregenRole;
  complexity: DndPregenComplexity;
  tags: string[];
  personality: string[];
  tactics: string[];
  sourceRefs: DndPregenSourceRef[];
  levels: Partial<Record<DndPregenLevel, DndPregenLevelPackage>>;
};
