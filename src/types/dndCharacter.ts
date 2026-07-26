import type { DndPregenClassId } from "../data/dndPregenCatalog";
import type { RulesetId } from "./ruleCards";

export type DndAbilityId = "str" | "dex" | "con" | "int" | "wis" | "cha";

export type DndAbilityScores = Record<DndAbilityId, number>;

export type DndCharacterSource = {
  label: string;
  url: string;
  scope: "public-srd" | "original" | "user-owned";
};

export type DndCharacterAttack = {
  id: string;
  name: string;
  attackAbility: DndAbilityId;
  proficient: boolean;
  damageFormula: string;
  damageType: string;
  rangeOrReach: string;
  notes?: string;
};

export type DndCharacterResource = {
  id: string;
  name: string;
  maximum: number;
  refresh: "turn" | "short-rest" | "long-rest" | "manual";
  notes?: string;
};

export type DndCharacterSpellcasting =
  | { kind: "none" }
  | {
      kind: "prepared" | "known";
      ability: DndAbilityId;
      cantrips: string[];
      spells: string[];
      slotsByLevel: Partial<Record<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9, number>>;
      notes?: string;
    };

export type DndCharacterRecord = {
  id: string;
  buildSlotId: string;
  ruleset: RulesetId;
  name: string;
  classId: DndPregenClassId;
  className: string;
  subclassId: string;
  subclassName: string;
  subclassUnlockLevel: number;
  level: number;
  species: string;
  background: string;
  abilityScores: DndAbilityScores;
  hitDie: 6 | 8 | 10 | 12;
  maximumHitPoints: number;
  armorClass: number;
  speedFeet: number;
  savingThrowProficiencies: DndAbilityId[];
  skillProficiencies: string[];
  languages: string[];
  toolProficiencies: string[];
  senses: string[];
  attacks: DndCharacterAttack[];
  resources: DndCharacterResource[];
  spellcastingExpected: boolean;
  spellcasting: DndCharacterSpellcasting;
  classFeatures: string[];
  subclassFeatures: string[];
  advancementChoices: string[];
  equipment: string[];
  currencyGp: number;
  notes: string[];
  sources: DndCharacterSource[];
  printableSummaryReady: boolean;
};

export type DndCharacterValidationCategory =
  | "identity"
  | "abilities"
  | "defenses"
  | "proficiencies"
  | "combat"
  | "resources"
  | "spellcasting"
  | "advancement"
  | "equipment"
  | "sources"
  | "print";

export type DndCharacterValidationIssue = {
  category: DndCharacterValidationCategory;
  message: string;
};

export type DndCharacterValidation = {
  ready: boolean;
  issues: DndCharacterValidationIssue[];
  completedCategories: DndCharacterValidationCategory[];
  missingCategories: DndCharacterValidationCategory[];
};
