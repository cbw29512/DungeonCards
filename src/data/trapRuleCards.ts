import type { FormulaChoice, RuleCard } from "../types/ruleCards";

const oldTrapChoices: FormulaChoice[] = [
  { id: "1-4-setback", label: "L1–4 Setback", formula: "1d10" },
  { id: "1-4-dangerous", label: "L1–4 Dangerous", formula: "2d10" },
  { id: "1-4-deadly", label: "L1–4 Deadly", formula: "4d10" },
  { id: "5-10-setback", label: "L5–10 Setback", formula: "2d10" },
  { id: "5-10-dangerous", label: "L5–10 Dangerous", formula: "4d10" },
  { id: "5-10-deadly", label: "L5–10 Deadly", formula: "10d10" },
  { id: "11-16-setback", label: "L11–16 Setback", formula: "4d10" },
  { id: "11-16-dangerous", label: "L11–16 Dangerous", formula: "10d10" },
  { id: "11-16-deadly", label: "L11–16 Deadly", formula: "18d10" },
  { id: "17-20-setback", label: "L17–20 Setback", formula: "10d10" },
  { id: "17-20-dangerous", label: "L17–20 Dangerous", formula: "18d10" },
  { id: "17-20-deadly", label: "L17–20 Deadly", formula: "24d10" }
];

const pitChoices: FormulaChoice[] = [
  { id: "1-4", label: "Levels 1–4 • 10 ft.", formula: "1d6" },
  { id: "5-10", label: "Levels 5–10 • 30 ft.", formula: "3d6" },
  { id: "11-16", label: "Levels 11–16 • 60 ft.", formula: "6d6" },
  { id: "17-20", label: "Levels 17–20 • 120 ft.", formula: "12d6" }
];

export const trapRuleCards: RuleCard[] = [
  {
    id: "trap-severity-2014",
    name: "Trap Severity",
    kind: "trap",
    imageEmoji: "🪤",
    variants: {
      "srd-5.1-2014": {
        ruleset: "srd-5.1-2014",
        source: "srd",
        sourceReference: "SRD 5.1 • Traps: Damage Severity by Level",
        summary: "Choose party tier and setback, dangerous, or deadly severity.",
        detail: "The card rolls the damage expression from the SRD severity table.",
        tags: ["trap", "dm"],
        modes: [{ id: "damage", label: "Damage", kind: "damage", formula: "1d10", choices: oldTrapChoices }]
      }
    }
  },
  {
    id: "hidden-pit-2024",
    name: "Hidden Pit",
    kind: "trap",
    imageEmoji: "🕳️",
    variants: {
      "srd-5.2.1-2024": {
        ruleset: "srd-5.2.1-2024",
        source: "srd",
        sourceReference: "SRD 5.2.1 • Traps: Hidden Pit",
        summary: "DC 15 Investigation to detect; depth and damage scale by level.",
        detail: "Choose the target level tier directly on the card.",
        tags: ["trap", "dm"],
        modes: [{ id: "damage", label: "Fall damage", kind: "damage", formula: "1d6", choices: pitChoices }]
      }
    }
  },
  {
    id: "poisoned-darts-2024",
    name: "Poisoned Darts",
    kind: "trap",
    imageEmoji: "🎯",
    variants: {
      "srd-5.2.1-2024": {
        ruleset: "srd-5.2.1-2024",
        source: "srd",
        sourceReference: "SRD 5.2.1 • Traps: Poisoned Darts",
        summary: "DC 13 Dexterity save; 1d3 darts; Poison damage per dart.",
        detail: "Roll dart count, then roll per-dart damage at the target level.",
        tags: ["trap", "dm"],
        modes: [
          { id: "darts", label: "Dart count", kind: "table", formula: "1d3" },
          {
            id: "damage", label: "Per dart", kind: "damage", formula: "1d6",
            scaling: { kind: "character-formula", tiers: [
              { level: 1, formula: "1d6" }, { level: 5, formula: "2d6" },
              { level: 11, formula: "4d6" }, { level: 17, formula: "7d6" }
            ] }
          }
        ]
      }
    }
  }
];