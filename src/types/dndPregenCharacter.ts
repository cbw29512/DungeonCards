import type { DndPregenClassId } from "../data/dndPregenCatalog";
import type { RulesetId } from "./ruleCards";

export type DndAbilityId =
  | "strength"
  | "dexterity"
  | "constitution"
  | "intelligence"
  | "wisdom"
  | "charisma";

export type DndAbilityScores = Record<DndAbilityId, number>;
export type DndPregenSourceScope = "public-srd" | "original" | "owned-private";
export type DndPregenReviewStatus = "draft" | "rules-reviewed" | "playtested" | "verified";
export type DndPregenComplexity = "beginner" | "standard" | "advanced";
export type DndPregenRole =
  | "controller"
  | "defender"
  | "face"
  | "generalist"
  | "scout"
  | "striker"
  | "support";

export type DndPregenSourceRef = {
  title: string;
  url: string;
  license: string;
  ruleset: RulesetId;
};

export type DndPregenAttack = {
  id: string;
  name: string;
  range: string;
  damage: string;
  attackBonus?: number;
  saveDc?: number;
  notes?: string;
};

export type DndPregenResource = {
  id: string;
  name: string;
  maximum: number;
  recovery: "turn" | "short-rest" | "long-rest" | "manual";
  notes?: string;
};

export type DndPregenSpellcasting = {
  ability: DndAbilityId;
  attackBonus: number;
  saveDc: number;
  slots: Partial<Record<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9, number>>;
  cantrips: string[];
  preparedOrKnown: string[];
  notes?: string;
};

export type DndPregenCharacterRecord = {
  id: string;
  slotId: string;
  name: string;
  ruleset: RulesetId;
  level: number;
  classId: DndPregenClassId;
  className: string;
  subclassId: string;
  subclassName: string;
  speciesId: string;
  speciesName: string;
  backgroundId: string;
  backgroundName: string;
  sourceScope: DndPregenSourceScope;
  reviewStatus: DndPregenReviewStatus;
  role: DndPregenRole;
  complexity: DndPregenComplexity;
  tags: string[];
  abilityScores: DndAbilityScores;
  proficiencyBonus: number;
  armorClass: number;
  initiative: number;
  speed: number;
  maxHitPoints: number;
  hitDice: string;
  savingThrows: string[];
  skills: string[];
  senses: string[];
  languages: string[];
  proficiencies: string[];
  attacks: DndPregenAttack[];
  resources: DndPregenResource[];
  features: string[];
  actions: string[];
  bonusActions: string[];
  reactions: string[];
  spellcasting?: DndPregenSpellcasting;
  equipment: string[];
  currency: string[];
  personality: string[];
  tactics: string[];
  sourceRefs: DndPregenSourceRef[];
  reviewedAt?: string;
};
