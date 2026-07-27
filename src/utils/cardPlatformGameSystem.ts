import type {
  DndGameSystemId,
  GameSystemId
} from "../types/cardPlatform";
import type { RulesetId } from "../types/ruleCards";

export const gameSystemIdForRuleset = (
  ruleset: RulesetId
): DndGameSystemId => (
  ruleset === "srd-5.1-2014" ? "dnd-2014" : "dnd-2024"
);

export const rulesetForGameSystemId = (
  gameSystemId: GameSystemId
): RulesetId | undefined => {
  if (gameSystemId === "dnd-2014") return "srd-5.1-2014";
  if (gameSystemId === "dnd-2024") return "srd-5.2.1-2024";
  return undefined;
};
