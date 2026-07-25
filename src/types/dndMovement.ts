import type { RulesetId } from "./ruleCards";

export type DndMovementProcedure = {
  id: string;
  edition: RulesetId;
  category: string;
  title: string;
  summary: string;
  steps: string[];
  sourceReference: string;
  sourceUrl: string;
};

export type MovementMode = "walk" | "crawl" | "climb" | "swim";

export type DndJumpResult = {
  runningLongJump: number;
  standingLongJump: number;
  runningHighJump: number;
  standingHighJump: number;
};

export type CoverDegree = "none" | "half" | "three-quarters" | "total";

export type CoverBenefit = {
  armorClassBonus: number;
  dexteritySaveBonus: number;
  canBeTargetedDirectly: boolean;
  summary: string;
};
