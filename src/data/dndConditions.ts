import type { RulesetId } from "../types/ruleCards";
import { dndConditions2014 } from "./dndConditions2014";
import { dndConditions2024 } from "./dndConditions2024";

export const dndConditionsByRuleset = {
  "srd-5.1-2014": dndConditions2014,
  "srd-5.2.1-2024": dndConditions2024
} satisfies Record<RulesetId, typeof dndConditions2014>;

export const getDndConditions = (ruleset: RulesetId) => dndConditionsByRuleset[ruleset];
