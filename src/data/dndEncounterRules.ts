import type { RulesetId } from "../types/ruleCards";

export type DndEncounterRuleSource = {
  ruleset: RulesetId;
  initiativeUrl: string;
  concentrationUrl: string;
  initiativeReference: string;
  concentrationReference: string;
  surpriseSummary: string;
  reactionSummary: string;
  concentrationSummary: string;
};

export const dndEncounterRules: Record<RulesetId, DndEncounterRuleSource> = {
  "srd-5.1-2014": {
    ruleset: "srd-5.1-2014",
    initiativeUrl: "https://www.dndbeyond.com/sources/dnd/basic-rules-2014/combat",
    concentrationUrl: "https://www.dndbeyond.com/sources/dnd/basic-rules-2014/spellcasting",
    initiativeReference: "Basic Rules 2014 · Combat: Initiative, Surprise, Reactions",
    concentrationReference: "Basic Rules 2014 · Spellcasting: Concentration",
    surpriseSummary: "A surprised creature can’t move or take an action on its first turn and can’t take a Reaction until that turn ends. Losing the ability to take actions also prevents a Bonus Action.",
    reactionSummary: "After taking a Reaction, the creature can’t take another until the start of its next turn.",
    concentrationSummary: "Damage requires a Constitution save with DC 10 or half the damage taken, whichever is higher. Each separate source of damage causes a separate save. Starting another concentration effect, becoming incapacitated, or dying ends concentration."
  },
  "srd-5.2.1-2024": {
    ruleset: "srd-5.2.1-2024",
    initiativeUrl: "https://www.dndbeyond.com/sources/dnd/br-2024/playing-the-game",
    concentrationUrl: "https://www.dndbeyond.com/sources/dnd/br-2024/rules-glossary",
    initiativeReference: "Free Rules 2024 · Playing the Game: Initiative and Reactions",
    concentrationReference: "Free Rules 2024 · Rules Glossary: Concentration",
    surpriseSummary: "A creature surprised when Initiative is rolled has Disadvantage on that roll. Surprise does not lock its first turn.",
    reactionSummary: "After taking a Reaction, the creature can’t take another until the start of its next turn.",
    concentrationSummary: "Damage requires a Constitution save with DC 10 or half the damage taken, whichever is higher, to a maximum DC of 30. Starting another concentration effect, becoming incapacitated, or dying ends concentration."
  }
};
