import type { DndPregenClassId } from "../data/dndPregenCatalog";
import type { DndCharacterRecord, DndCharacterSource } from "./dndCharacter";
import type { RulesetId } from "./ruleCards";

export type DndBuildRole =
  | "controller"
  | "defender"
  | "face"
  | "healer"
  | "scout"
  | "striker"
  | "support"
  | "versatile";

export type DndBuildComplexity = "beginner" | "standard" | "advanced";
export type DndMagicItemRarity = "common" | "uncommon" | "rare" | "very-rare" | "legendary";
export type DndMagicItemCategory = "armor" | "potion" | "ring" | "rod" | "scroll" | "staff" | "wand" | "weapon" | "wondrous-item";

export type DndAdvancementChoice = {
  id: string;
  gainedAtLevel: number;
  kind: "ability-score" | "feat" | "class-option" | "subclass-option";
  name: string;
  source: DndCharacterSource;
  prerequisiteNote?: string;
  abilityChanges?: Partial<Record<"str" | "dex" | "con" | "int" | "wis" | "cha", number>>;
  synergyNote: string;
};

export type DndMagicItemSelection = {
  id: string;
  name: string;
  rarity: DndMagicItemRarity;
  category: DndMagicItemCategory;
  source: DndCharacterSource;
  minimumLevel: number;
  requiresAttunement: boolean;
  attunedByDefault: boolean;
  attunementPrerequisite?: string;
  consumable: boolean;
  maximumCharges?: number;
  recharge?: string;
  effectSummary: string;
  synergyNote: string;
};

export type DndOptimizedBuildProfile = {
  id: string;
  buildSlotId: string;
  ruleset: RulesetId;
  classId: DndPregenClassId;
  subclassId: string;
  level: number;
  role: DndBuildRole;
  complexity: DndBuildComplexity;
  buildGoal: string;
  optimizationNotes: string[];
  tactics: string[];
  advancementChoices: DndAdvancementChoice[];
  magicItems: DndMagicItemSelection[];
  character: DndCharacterRecord;
  sheetVersion: 2;
  reviewStatus: "draft" | "rules-reviewed" | "playtested" | "verified";
  reviewedAt?: string;
};

export type DndSavedCharacterState = {
  id: string;
  ownerId: string;
  baseBuildId: string;
  displayName: string;
  ruleset: RulesetId;
  level: number;
  currentHitPoints: number;
  temporaryHitPoints: number;
  inspiration: boolean;
  deathSaveSuccesses: number;
  deathSaveFailures: number;
  resourceState: Record<string, number>;
  spellSlotState: Partial<Record<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9, number>>;
  itemChargeState: Record<string, number>;
  attunedItemIds: string[];
  customNotes: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
};
