export type CocRollMode =
  | "normal"
  | "bonus"
  | "double-bonus"
  | "penalty"
  | "double-penalty";

export type CocDifficulty = "regular" | "hard" | "extreme";

export type CocSuccessLevel =
  | "critical"
  | "extreme"
  | "hard"
  | "regular"
  | "failure"
  | "fumble";

export type CocRuleVerificationStatus =
  | "prototype"
  | "needs-review"
  | "verified"
  | "disputed";

export type CocRuleSourceRecord = {
  id: string;
  system: "call-of-cthulhu";
  edition: "7e";
  ruleName: string;
  sourceTitle: string;
  sourceUrl: string;
  chapterOrSection: string;
  page?: number;
  revisionNote?: string;
  implementationSummary: string;
  status: CocRuleVerificationStatus;
  primaryReviewer?: string;
  independentReviewer?: string;
  verifiedAt?: string;
  notes: string[];
};

export type CocQuickReferenceCard = {
  id: string;
  stamp: string;
  title: string;
  text: string;
  sourceId: string;
};

export type CocPercentileResult = {
  roll: number;
  unitDie: number;
  tensDice: number[];
  candidates: number[];
  skillValue: number;
  difficulty: CocDifficulty;
  mode: CocRollMode;
  successLevel: CocSuccessLevel;
  meetsDifficulty: boolean;
};

export type CocWeaponKind = "melee" | "thrown" | "handgun" | "long-gun" | "shotgun";
export type CocWeaponEra = "1920s" | "modern" | "universal";
export type CocWeaponAvailability = "common" | "restricted" | "special";

export type CocWeaponRecord = {
  id: string;
  name: string;
  category: string;
  kind: CocWeaponKind;
  eras: CocWeaponEra[];
  availability: CocWeaponAvailability;
  hands: 1 | 2;
  skillName: string;
  defaultSkill: number;
  damageFormula: string;
  usesDamageBonus: boolean;
  capacity: number;
  malfunction?: number;
  range: string;
  attacksPerRound: string;
  reload: string;
  impaling: boolean;
  notes: string;
};

/** @deprecated Prefer CocWeaponRecord for new public catalog content. */
export type CocWeaponPreview = CocWeaponRecord;

export type CocRitualKind =
  | "ward"
  | "divination"
  | "binding"
  | "transformation"
  | "passage"
  | "affliction";

export type CocRitualRisk = "low" | "moderate" | "severe" | "catastrophic";

export type CocRitualRecord = {
  id: string;
  name: string;
  kind: CocRitualKind;
  risk: CocRitualRisk;
  contexts: string[];
  castingTime: string;
  magicPointCost: number;
  sanityCostFormula: string;
  castingSkillName: string;
  defaultCastingSkill: number;
  difficulty: CocDifficulty;
  range: string;
  durationFormula: string;
  durationUnit: "rounds" | "minutes" | "hours" | "days";
  requirements: string[];
  summary: string;
  effect: string;
  failure: string;
};

/** @deprecated Prefer CocRitualRecord for new public catalog content. */
export type CocSpellPreview = CocRitualRecord;

export type CocCreatureAttackPreview = {
  id: string;
  name: string;
  skill: number;
  damageFormula: string;
  notes: string;
};

export type CocCreatureKind = "human" | "animal" | "unnatural" | "entity";
export type CocCreatureThreatLevel = "low" | "moderate" | "severe" | "catastrophic";

export type CocCreatureRecord = {
  id: string;
  name: string;
  classification: string;
  keeperTag: string;
  kind: CocCreatureKind;
  threat: CocCreatureThreatLevel;
  environments: string[];
  characteristics: Record<"STR" | "CON" | "SIZ" | "DEX" | "INT" | "POW", number>;
  hitPoints: number;
  magicPoints: number;
  move: number;
  build: number;
  damageBonus: string;
  armor: number;
  dodge: number;
  sanityLossFormula: string;
  description: string;
  traits: string[];
  attacks: CocCreatureAttackPreview[];
};

/** @deprecated Prefer CocCreatureRecord for new public catalog content. */
export type CocCreaturePreview = CocCreatureRecord;
