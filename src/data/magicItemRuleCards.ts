import type { FormulaChoice, RuleCard } from "../types/ruleCards";
import {
  sentientAlignmentTable,
  sentientCommunicationTable,
  sentientPurposeTable,
  sentientSensesTable
} from "./sentientItemTables";
import { wandOfWonderTable } from "./wandOfWonderTable";

const materialChoices: FormulaChoice[] = [
  {
    id: "city",
    label: "City • 75%",
    formula: "1d100",
    table: [
      { min: 1, max: 75, result: "Appropriate raw materials are available." },
      { min: 76, max: 100, result: "Materials unavailable; wait at least 7 days before checking again." }
    ]
  },
  {
    id: "settlement",
    label: "Other settlement • 25%",
    formula: "1d100",
    table: [
      { min: 1, max: 25, result: "Appropriate raw materials are available." },
      { min: 26, max: 100, result: "Materials unavailable; wait at least 7 days before checking again." }
    ]
  }
];

const sentientModes = [
  { id: "ability", label: "Ability score", kind: "table" as const, formula: "4d6kh3" },
  { id: "alignment", label: "Alignment", kind: "table" as const, formula: "1d100", choices: [
    { id: "alignment", label: "Alignment", formula: "1d100", table: sentientAlignmentTable }
  ] },
  { id: "communication", label: "Communication", kind: "table" as const, formula: "1d10", choices: [
    { id: "communication", label: "Communication", formula: "1d10", table: sentientCommunicationTable }
  ] },
  { id: "senses", label: "Senses", kind: "table" as const, formula: "1d4", choices: [
    { id: "senses", label: "Senses", formula: "1d4", table: sentientSensesTable }
  ] },
  { id: "purpose", label: "Purpose", kind: "table" as const, formula: "1d10", choices: [
    { id: "purpose", label: "Purpose", formula: "1d10", table: sentientPurposeTable }
  ] }
];

export const magicItemRuleCards: RuleCard[] = [
  {
    id: "sentient-item",
    name: "Sentient Item",
    kind: "magic-item",
    imageEmoji: "🗡️",
    variants: {
      "srd-5.2.1-2024": {
        ruleset: "srd-5.2.1-2024",
        source: "srd",
        sourceReference: "SRD 5.2.1 • Sentient Magic Items",
        summary: "Generate abilities, alignment, communication, senses, and purpose.",
        detail: "Roll Ability Score three times for Intelligence, Wisdom, and Charisma.",
        tags: ["magic-item", "dm", "random"],
        modes: sentientModes
      }
    }
  },
  {
    id: "magic-item-materials",
    name: "Crafting Materials",
    kind: "magic-item",
    imageEmoji: "⚒️",
    variants: {
      "srd-5.2.1-2024": {
        ruleset: "srd-5.2.1-2024",
        source: "srd",
        sourceReference: "SRD 5.2.1 • Crafting Magic Items: Raw Materials",
        summary: "Check availability in a city or another settlement.",
        detail: "City availability is 75%; other settlements are 25%.",
        tags: ["magic-item", "dm", "crafting"],
        modes: [{ id: "availability", label: "Availability", kind: "table", formula: "1d100", choices: materialChoices }]
      }
    }
  },
  {
    id: "wand-of-wonder",
    name: "Wand of Wonder",
    kind: "magic-item",
    imageEmoji: "🪄",
    variants: {
      "srd-5.2.1-2024": {
        ruleset: "srd-5.2.1-2024",
        source: "srd",
        sourceReference: "SRD 5.2.1 • Wand of Wonder",
        summary: "Spend 1 charge and roll the full 1d100 effect table.",
        detail: "The wand has 7 charges; spells use save DC 15.",
        tags: ["magic-item", "dm", "random"],
        modes: [{ id: "effect", label: "Wonder effect", kind: "table", formula: "1d100", choices: [
          { id: "effect", label: "Roll effect", formula: "1d100", table: wandOfWonderTable }
        ] }]
      }
    }
  },
  {
    id: "wand-charge-checks",
    name: "Wand Charges",
    kind: "magic-item",
    imageEmoji: "🔋",
    variants: {
      "srd-5.2.1-2024": {
        ruleset: "srd-5.2.1-2024",
        source: "srd",
        sourceReference: "SRD 5.2.1 • Wands with Charges",
        summary: "Recharge a wand or check destruction after its last charge.",
        detail: "Applies to Wand of Fireballs, Lightning Bolts, Magic Missiles, and similar entries.",
        tags: ["magic-item", "dm", "charges"],
        modes: [
          { id: "recharge", label: "Recharge", kind: "healing", formula: "1d6+1" },
          { id: "last-charge", label: "Last charge", kind: "table", formula: "1d20", choices: [
            { id: "last-charge", label: "Destruction check", formula: "1d20", table: [
              { min: 1, max: 1, result: "The wand crumbles and is destroyed." },
              { min: 2, max: 20, result: "The wand remains intact." }
            ] }
          ] }
        ]
      }
    }
  }
];