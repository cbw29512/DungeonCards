import type { RuleCard, RuleTableEntry } from "../types/ruleCards";

const resistanceTable: RuleTableEntry[] = [
  { min: 1, max: 1, result: "Acid" },
  { min: 2, max: 2, result: "Cold" },
  { min: 3, max: 3, result: "Fire" },
  { min: 4, max: 4, result: "Force" },
  { min: 5, max: 5, result: "Lightning" },
  { min: 6, max: 6, result: "Necrotic" },
  { min: 7, max: 7, result: "Poison" },
  { min: 8, max: 8, result: "Psychic" },
  { min: 9, max: 9, result: "Radiant" },
  { min: 10, max: 10, result: "Thunder" }
];

const mode = {
  id: "damage-type",
  label: "Damage type",
  kind: "table" as const,
  formula: "1d10",
  choices: [{
    id: "damage-type",
    label: "Roll damage type",
    formula: "1d10",
    table: resistanceTable
  }]
};

export const resistanceItemRuleCards: RuleCard[] = [{
  id: "armor-of-resistance",
  name: "Armor of Resistance",
  kind: "magic-item",
  imageEmoji: "🛡️",
  variants: {
    "srd-5.1-2014": {
      ruleset: "srd-5.1-2014",
      source: "srd",
      sourceReference: "SRD 5.1 • Armor of Resistance",
      summary: "Rare armor • Attunement • Random resistance type",
      detail: "The GM chooses a damage type or rolls 1d10 on the card.",
      tags: ["magic-item", "dm", "random", "armor"],
      modes: [mode]
    },
    "srd-5.2.1-2024": {
      ruleset: "srd-5.2.1-2024",
      source: "srd",
      sourceReference: "SRD 5.2.1 • Armor of Resistance",
      summary: "Rare armor • Attunement • Random resistance type",
      detail: "The GM chooses a damage type or rolls 1d10 on the card.",
      tags: ["magic-item", "dm", "random", "armor"],
      modes: [mode]
    }
  }
}];