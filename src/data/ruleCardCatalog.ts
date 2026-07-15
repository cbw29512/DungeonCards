import type { RuleCard } from "../types/ruleCards";
import { bagOfBeansRuleCards } from "./bagOfBeansRuleCards";
import { bagOfTricksRuleCards } from "./bagOfTricksRuleCards";
import { coreRollCards } from "./coreRollCards";
import { magicItemRuleCards } from "./magicItemRuleCards";
import { resistanceItemRuleCards } from "./resistanceItemRuleCards";
import { savingThrowCards } from "./savingThrowCards";
import { skillCheckCards } from "./skillCheckCards";
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

const individualCoreCards = [
  ...savingThrowCards,
  ...skillCheckCards
];

export const playerRuleCards: RuleCard[] = [
  ...coreRollCards,
  ...individualCoreCards,
  ...weaponRuleCards,
  ...splitSpellCards(baseSpellCards)
];

export const dmRuleCards: RuleCard[] = [
  ...coreRollCards.slice(1),
  ...individualCoreCards,
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
