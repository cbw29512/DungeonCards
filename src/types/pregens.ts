export type DndEdition = "dnd-2014" | "dnd-2024";
export type PregenSourceScope = "srd" | "original" | "owned";
export type PregenReviewStatus = "draft" | "rules-reviewed" | "playtested" | "verified";
export type PregenComplexity = "beginner" | "standard" | "advanced";
export type PregenRole = "defender" | "support" | "striker" | "controller" | "scout" | "face" | "generalist";
export type AbilityId = "strength" | "dexterity" | "constitution" | "intelligence" | "wisdom" | "charisma";

export type AbilityScores = Record<AbilityId, number>;

export type PregenSourceRef = {
  title: string;
  url: string;
  license: string;
  edition: DndEdition;
};

export type PregenAttack = {
  id: string;
  name: string;
  attackBonus?: number;
  saveDc?: number;
  range: string;
  damage: string;
  notes?: string;
};

export type PregenResource = {
  id: string;
  name: string;
  maximum: number;
  recovery: "turn" | "short-rest" | "long-rest" | "manual";
  notes?: string;
};

export type PregenSpellcasting = {
  ability: AbilityId;
  saveDc: number;
  attackBonus: number;
  slots: Partial<Record<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9, number>>;
  cantrips: string[];
  preparedOrKnown: string[];
  notes?: string;
};

export type PregenCharacter = {
  id: string;
  blueprintId: string;
  name: string;
  edition: DndEdition;
  level: number;
  classId: string;
  className: string;
  subclassId: string;
  subclassName: string;
  speciesId: string;
  speciesName: string;
  backgroundId: string;
  backgroundName: string;
  sourceScope: PregenSourceScope;
  reviewStatus: PregenReviewStatus;
  role: PregenRole;
  complexity: PregenComplexity;
  tags: string[];
  abilityScores: AbilityScores;
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
  attacks: PregenAttack[];
  resources: PregenResource[];
  features: string[];
  actions: string[];
  bonusActions: string[];
  reactions: string[];
  spellcasting?: PregenSpellcasting;
  equipment: string[];
  personality: string[];
  tactics: string[];
  sourceRefs: PregenSourceRef[];
  reviewedAt?: string;
};

export type PregenCatalogFilters = {
  edition: DndEdition | "all";
  classId: string | "all";
  subclassId: string | "all";
  level: number | "all";
  role: PregenRole | "all";
  complexity: PregenComplexity | "all";
  sourceScope: PregenSourceScope | "all";
};
