import type {
  FormulaChoice,
  RuleCard,
  RuleTableEntry
} from "../types/ruleCards";

const table = (creatures: string[]): RuleTableEntry[] =>
  creatures.map((result, index) => ({ min: index + 1, max: index + 1, result }));

const bagChoices: FormulaChoice[] = [
  {
    id: "gray",
    label: "Gray bag",
    formula: "1d8",
    table: table([
      "Weasel", "Giant Rat", "Badger", "Boar",
      "Panther", "Giant Badger", "Dire Wolf", "Giant Elk"
    ])
  },
  {
    id: "rust",
    label: "Rust bag",
    formula: "1d8",
    table: table([
      "Rat", "Owl", "Mastiff", "Goat",
      "Giant Goat", "Giant Boar", "Lion", "Brown Bear"
    ])
  },
  {
    id: "tan",
    label: "Tan bag",
    formula: "1d8",
    table: table([
      "Jackal", "Ape", "Baboon", "Axe Beak",
      "Black Bear", "Giant Weasel", "Giant Hyena", "Tiger"
    ])
  }
];

const summonMode = {
  id: "summon",
  label: "Pull fuzzy object",
  kind: "table" as const,
  formula: "1d8",
  choices: bagChoices
};

export const bagOfTricksRuleCards: RuleCard[] = [{
  id: "bag-of-tricks",
  name: "Bag of Tricks",
  kind: "magic-item",
  imageEmoji: "👜",
  variants: {
    "srd-5.1-2014": {
      ruleset: "srd-5.1-2014",
      source: "srd",
      sourceReference: "SRD 5.1 • Bag of Tricks",
      summary: "Uncommon • Gray, Rust, or Tan • Three uses per dawn",
      detail: "Use an action and throw the object up to 20 feet. The friendly creature acts on your turn.",
      tags: ["magic-item", "dm", "random", "summon"],
      modes: [summonMode]
    },
    "srd-5.2.1-2024": {
      ruleset: "srd-5.2.1-2024",
      source: "srd",
      sourceReference: "SRD 5.2.1 • Bag of Tricks",
      summary: "Uncommon • Gray, Rust, or Tan • Three uses per dawn",
      detail: "Take a Magic action and throw the object up to 20 feet. The Friendly creature acts immediately after you.",
      tags: ["magic-item", "dm", "random", "summon"],
      modes: [summonMode]
    }
  }
}];