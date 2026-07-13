import type {
  RuleCard,
  RuleCardVariant,
  RuleRollKind,
  RuleRollMode,
  RulesetId
} from "../types/ruleCards";

const abilities = ["Strength", "Dexterity", "Constitution", "Intelligence", "Wisdom", "Charisma"];

const sourceReference = (ruleset: RulesetId, topic: string): string =>
  `${ruleset === "srd-5.1-2014" ? "SRD 5.1" : "SRD 5.2.1"} • ${topic}`;

const d20Modes = (kind: RuleRollKind, labelSuffix: string): RuleRollMode[] =>
  abilities.map((ability) => ({
    id: ability.toLowerCase(),
    label: `${ability} ${labelSuffix}`,
    kind,
    formula: "1d20",
    allowsAdvantage: true,
    naturalRollRule: "none",
    modifierControl: {
      label: `${ability} modifier`,
      defaultValue: 0,
      minimum: -10,
      maximum: 30
    }
  }));

const variant = (
  ruleset: RulesetId,
  topic: string,
  summary: string,
  detail: string,
  modes: RuleRollMode[]
): RuleCardVariant => ({
  ruleset,
  source: "srd",
  sourceReference: sourceReference(ruleset, topic),
  summary,
  detail,
  tags: ["core-roll", topic.toLowerCase().replaceAll(" ", "-")],
  modes
});

const bothRulesets = (
  topic: string,
  summary: string,
  detail: string,
  modes: RuleRollMode[]
) => ({
  "srd-5.1-2014": variant("srd-5.1-2014", topic, summary, detail, modes),
  "srd-5.2.1-2024": variant("srd-5.2.1-2024", topic, summary, detail, modes)
});

const attackModes: RuleRollMode[] = [
  {
    id: "weapon-attack",
    label: "Weapon Attack",
    kind: "attack",
    formula: "1d20+5",
    allowsAdvantage: true,
    naturalRollRule: "attack",
    modifierControl: { label: "Attack bonus", defaultValue: 5, minimum: -5, maximum: 30 }
  },
  {
    id: "spell-attack",
    label: "Spell Attack",
    kind: "attack",
    formula: "1d20+5",
    allowsAdvantage: true,
    naturalRollRule: "attack",
    modifierControl: { label: "Spell attack", defaultValue: 5, minimum: -5, maximum: 30 }
  }
];

export const coreRollCards: RuleCard[] = [
  {
    id: "core-attack-roll",
    name: "Attack Roll",
    kind: "attack",
    imageEmoji: "🎯",
    variants: bothRulesets(
      "Attack Rolls",
      "Roll 1d20, add the attack bonus, and compare the total with Armor Class.",
      "Natural 20 and natural 1 outcomes apply only to attack rolls. Damage is rolled on a separate card unless Quick Roll is used.",
      attackModes
    )
  },
  {
    id: "core-saving-throw",
    name: "Saving Throw",
    kind: "saving-throw",
    imageEmoji: "🛡️",
    variants: bothRulesets(
      "Saving Throws",
      "Choose the required ability, add the creature's saving throw modifier, and compare with the DC.",
      "A natural 20 or natural 1 is not automatically a success or failure on a saving throw unless a specific rule says otherwise.",
      d20Modes("save", "Save")
    )
  },
  {
    id: "core-ability-check",
    name: "Ability Check",
    kind: "ability-check",
    imageEmoji: "🧭",
    variants: bothRulesets(
      "Ability Checks",
      "Choose the ability and enter the full check modifier, including proficiency or Expertise when applicable.",
      "A natural 20 or natural 1 is not automatically a success or failure on an ability check unless a specific rule says otherwise.",
      d20Modes("check", "Check")
    )
  }
];