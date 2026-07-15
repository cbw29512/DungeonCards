import type { RuleCard, RuleCardVariant, RulesetId } from "../types/ruleCards";

const skills = [
  ["Acrobatics", "Dexterity", "🤸"],
  ["Animal Handling", "Wisdom", "🐎"],
  ["Arcana", "Intelligence", "✨"],
  ["Athletics", "Strength", "🏋️"],
  ["Deception", "Charisma", "🎭"],
  ["History", "Intelligence", "📜"],
  ["Insight", "Wisdom", "🧠"],
  ["Intimidation", "Charisma", "🗯️"],
  ["Investigation", "Intelligence", "🔎"],
  ["Medicine", "Wisdom", "🩺"],
  ["Nature", "Intelligence", "🌿"],
  ["Perception", "Wisdom", "👁️"],
  ["Performance", "Charisma", "🎭"],
  ["Persuasion", "Charisma", "🤝"],
  ["Religion", "Intelligence", "⛪"],
  ["Sleight of Hand", "Dexterity", "🖐️"],
  ["Stealth", "Dexterity", "🥷"],
  ["Survival", "Wisdom", "🧭"]
] as const;

const slug = (value: string) => value.toLowerCase().replaceAll(" ", "-");

const variant = (
  ruleset: RulesetId,
  skill: string,
  ability: string
): RuleCardVariant => ({
  ruleset,
  source: "srd",
  sourceReference: `${ruleset === "srd-5.1-2014" ? "SRD 5.1" : "SRD 5.2.1"} • Ability Checks and Skills`,
  summary: `Roll a ${skill} check using the complete ${ability}-based modifier shown on the character sheet.`,
  detail: "The DM sets the DC. A natural 20 or natural 1 is not automatically a success or failure unless a specific rule says otherwise.",
  tags: ["core-roll", "skill", slug(skill), slug(ability)],
  modes: [{
    id: slug(skill),
    label: `${skill} Check`,
    kind: "check",
    formula: "1d20",
    allowsAdvantage: true,
    naturalRollRule: "none",
    modifierControl: {
      label: `${skill} modifier`,
      defaultValue: 0,
      minimum: -10,
      maximum: 30
    }
  }]
});

export const skillCheckCards: RuleCard[] = skills.map(([skill, ability, imageEmoji]) => ({
  id: `skill-${slug(skill)}`,
  name: skill,
  kind: "ability-check",
  imageEmoji,
  variants: {
    "srd-5.1-2014": variant("srd-5.1-2014", skill, ability),
    "srd-5.2.1-2024": variant("srd-5.2.1-2024", skill, ability)
  }
}));
