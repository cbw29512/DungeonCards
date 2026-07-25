import type { RulesetId } from "../types/ruleCards";
import { dndMovement2014 } from "./dndMovement2014";
import { dndMovement2024 } from "./dndMovement2024";

export const dndMovementByRuleset = {
  "srd-5.1-2014": dndMovement2014,
  "srd-5.2.1-2024": dndMovement2024
} satisfies Record<RulesetId, typeof dndMovement2014>;

export const getDndMovementProcedures = (ruleset: RulesetId) => dndMovementByRuleset[ruleset];
