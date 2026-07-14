import type { RuleCard } from "../types/ruleCards";
import { bagOfBeansRuleCards } from "./bagOfBeansRuleCards";
import { bagOfTricksRuleCards } from "./bagOfTricksRuleCards";
import { coreRollCards } from "./coreRollCards";
import { magicItemRuleCards } from "./magicItemRuleCards";
import { resistanceItemRuleCards } from "./resistanceItemRuleCards";
import { spellAreaRuleCards } from "./spellAreaRuleCards";
import { spellCantripRuleCards } from "./spellCantripRuleCards";
import { spellFocusedRuleCards } from "./spellFocusedRuleCards";
import { spellRuleCards } from "./spellRuleCards";
import { splitSpellCards } from "./splitSpellCards";
import { trapRuleCards } from "./trapRuleCards";
import { weaponRuleCards } from "./weaponRuleCards";

const baseSpellCards = [
  ...spellRuleCards,
  ...spellAreaRuleCards,
  ...spellFocusedRuleCards,
  ...spellCantripRuleCards
];

export const playerRuleCards: RuleCard[] = [
  ...coreRollCards,
  ...weaponRuleCards,
  ...splitSpellCards(baseSpellCards)
];

export const dmRuleCards: RuleCard[] = [
  ...coreRollCards.slice(1),
  ...trapRuleCards,
  ...magicItemRuleCards,
  ...resistanceItemRuleCards,
  ...bagOfTricksRuleCards,
  ...bagOfBeansRuleCards
];

export const ruleCardCatalog: RuleCard[] = [
  ...playerRuleCards,
  ...dmRuleCards.filter((card) => !playerRuleCards.some((player) => player.id === card.id))
];