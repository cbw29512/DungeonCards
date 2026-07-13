import type { RuleCard } from "../types/ruleCards";
import { bagOfTricksRuleCards } from "./bagOfTricksRuleCards";
import { magicItemRuleCards } from "./magicItemRuleCards";
import { resistanceItemRuleCards } from "./resistanceItemRuleCards";
import { spellAreaRuleCards } from "./spellAreaRuleCards";
import { spellCantripRuleCards } from "./spellCantripRuleCards";
import { spellFocusedRuleCards } from "./spellFocusedRuleCards";
import { spellRuleCards } from "./spellRuleCards";
import { trapRuleCards } from "./trapRuleCards";
import { weaponRuleCards } from "./weaponRuleCards";

export const playerRuleCards: RuleCard[] = [
  ...weaponRuleCards,
  ...spellRuleCards,
  ...spellAreaRuleCards,
  ...spellFocusedRuleCards,
  ...spellCantripRuleCards
];

export const dmRuleCards: RuleCard[] = [
  ...trapRuleCards,
  ...magicItemRuleCards,
  ...resistanceItemRuleCards,
  ...bagOfTricksRuleCards
];

export const ruleCardCatalog: RuleCard[] = [
  ...playerRuleCards,
  ...dmRuleCards
];