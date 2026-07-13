import type { RuleCard } from "../types/ruleCards";
import { magicItemRuleCards } from "./magicItemRuleCards";
import { spellAreaRuleCards } from "./spellAreaRuleCards";
import { spellFocusedRuleCards } from "./spellFocusedRuleCards";
import { spellRuleCards } from "./spellRuleCards";
import { trapRuleCards } from "./trapRuleCards";
import { weaponRuleCards } from "./weaponRuleCards";

export const playerRuleCards: RuleCard[] = [
  ...weaponRuleCards,
  ...spellRuleCards,
  ...spellAreaRuleCards,
  ...spellFocusedRuleCards
];

export const dmRuleCards: RuleCard[] = [
  ...trapRuleCards,
  ...magicItemRuleCards
];

export const ruleCardCatalog: RuleCard[] = [
  ...playerRuleCards,
  ...dmRuleCards
];