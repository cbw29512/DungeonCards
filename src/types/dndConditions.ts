import type { RulesetId } from "./ruleCards";

export type DndConditionRecord = {
  id: string;
  edition: RulesetId;
  name: string;
  summary: string;
  effects: string[];
  sourceReference: string;
  sourceUrl: string;
};

export type DndExhaustionState = {
  edition: RulesetId;
  level: number;
  isDead: boolean;
  d20Penalty: number;
  speedPenaltyFeet: number;
  effects: string[];
};
