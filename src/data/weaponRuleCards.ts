import type {
  RuleCard,
  RuleCardVariant,
  RulesetId
} from "../types/ruleCards";

const attackMode = {
  id: "attack",
  label: "Attack",
  kind: "attack" as const,
  formula: "1d20+5",
  allowsAdvantage: true,
  naturalRollRule: "attack" as const,
  modifierControl: { label: "Attack bonus", defaultValue: 5, minimum: -5, maximum: 20 }
};

const damageModes = (
  normal: string,
  critical: string,
  choices?: Array<{ id: string; label: string; formula: string }>,
  criticalChoices?: Array<{ id: string; label: string; formula: string }>
) => [
  {
    id: "damage",
    label: "Damage",
    kind: "damage" as const,
    formula: normal,
    modifierControl: { label: "Damage bonus", defaultValue: 3, minimum: -5, maximum: 20 },
    choices
  },
  {
    id: "critical",
    label: "Critical",
    kind: "damage" as const,
    formula: critical,
    modifierControl: { label: "Damage bonus", defaultValue: 3, minimum: -5, maximum: 20 },
    choices: criticalChoices
  }
];

const variant = (
  ruleset: RulesetId,
  summary: string,
  detail: string,
  normal: string,
  critical: string,
  choices?: Array<{ id: string; label: string; formula: string }>,
  criticalChoices?: Array<{ id: string; label: string; formula: string }>
): RuleCardVariant => ({
  ruleset,
  source: "srd",
  sourceReference: ruleset === "srd-5.1-2014"
    ? "SRD 5.1 • Equipment: Weapons"
    : "SRD 5.2.1 • Equipment: Weapons",
  summary,
  detail,
  tags: ["weapon"],
  modes: [attackMode, ...damageModes(normal, critical, choices, criticalChoices)]
});

const both = (
  oldSummary: string,
  newSummary: string,
  detail: string,
  normal: string,
  critical: string,
  choices?: Array<{ id: string; label: string; formula: string }>,
  criticalChoices?: Array<{ id: string; label: string; formula: string }>
) => ({
  "srd-5.1-2014": variant("srd-5.1-2014", oldSummary, detail, normal, critical, choices, criticalChoices),
  "srd-5.2.1-2024": variant("srd-5.2.1-2024", newSummary, detail, normal, critical, choices, criticalChoices)
});

export const weaponRuleCards: RuleCard[] = [
  {
    id: "greataxe",
    name: "Greataxe",
    kind: "weapon",
    imageEmoji: "🪓",
    variants: both(
      "1d12 Slashing • Heavy • Two-Handed",
      "1d12 Slashing • Heavy • Two-Handed • Cleave",
      "Critical doubles the weapon damage dice; add the modifier once.",
      "1d12+3",
      "2d12+3"
    )
  },
  {
    id: "longsword",
    name: "Longsword",
    kind: "weapon",
    imageEmoji: "⚔️",
    variants: both(
      "1d8 Slashing • Versatile 1d10",
      "1d8 Slashing • Versatile 1d10 • Sap",
      "Choose one-handed or two-handed damage on the card.",
      "1d8+3",
      "2d8+3",
      [
        { id: "one", label: "One hand", formula: "1d8+3" },
        { id: "two", label: "Two hands", formula: "1d10+3" }
      ],
      [
        { id: "one", label: "One hand", formula: "2d8+3" },
        { id: "two", label: "Two hands", formula: "2d10+3" }
      ]
    )
  },
  {
    id: "dagger",
    name: "Dagger",
    kind: "weapon",
    imageEmoji: "🗡️",
    variants: both(
      "1d4 Piercing • Finesse • Light • Thrown 20/60",
      "1d4 Piercing • Finesse • Light • Thrown 20/60 • Nick",
      "Use the on-card modifier for Strength or Dexterity.",
      "1d4+3",
      "2d4+3"
    )
  },
  {
    id: "longbow",
    name: "Longbow",
    kind: "weapon",
    imageEmoji: "🏹",
    variants: both(
      "1d8 Piercing • Ammunition 150/600 • Heavy • Two-Handed",
      "1d8 Piercing • Ammunition 150/600 • Heavy • Two-Handed • Slow",
      "The attack bonus and damage modifier are adjustable on the card.",
      "1d8+3",
      "2d8+3"
    )
  }
];