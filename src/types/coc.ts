export type CocRollMode = "normal" | "bonus" | "penalty";

export type CocDifficulty = "regular" | "hard" | "extreme";

export type CocSuccessLevel =
  | "critical"
  | "extreme"
  | "hard"
  | "regular"
  | "failure"
  | "fumble";

export type CocPercentileResult = {
  roll: number;
  unitDie: number;
  tensDice: number[];
  candidates: number[];
  skillValue: number;
  difficulty: CocDifficulty;
  successLevel: CocSuccessLevel;
  meetsDifficulty: boolean;
};

export type CocWeaponPreview = {
  id: string;
  name: string;
  category: string;
  skillName: string;
  defaultSkill: number;
  damageFormula: string;
  capacity: number;
  malfunction: number;
  range: string;
  attacksPerRound: string;
  impaling: boolean;
  notes: string;
};

export type CocSpellPreview = {
  id: string;
  name: string;
  castingTime: string;
  magicPointCost: number;
  sanityCostFormula: string;
  castingSkillName: string;
  defaultCastingSkill: number;
  range: string;
  duration: string;
  summary: string;
  failure: string;
};

export type CocCreatureAttackPreview = {
  id: string;
  name: string;
  skill: number;
  damageFormula: string;
  notes: string;
};

export type CocCreaturePreview = {
  id: string;
  name: string;
  classification: string;
  keeperTag: string;
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
