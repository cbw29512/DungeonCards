import type { RuleCard, RuleCardVariant, RulesetId } from "../types/ruleCards";

const saves = [
  ["Strength", "💪"],
  ["Dexterity", "⚡"],
  ["Constitution", "❤️"],
  ["Intelligence", "🧠"],
  ["Wisdom", "🦉"],
  ["Charisma", "✨"]
] as const;

const slug = (value: string) => value.toLowerCase();

const variant = (ruleset: RulesetId, ability: string): RuleCardVariant => ({
  ruleset,
  source: "srd",
  sourceReference: `${ruleset === "srd-5.1-2014" ? "SRD 5.1" : "SRD 5.2.1"} • Saving Throws`,
  summary: `Roll a ${ability} saving throw and add the full save modifier shown on the creature or character sheet.`,
  detail: "Compare the result with the effect's DC. A natural 20 or natural 1 is not automatically a success or failure unless a specific rule says otherwise.",
  tags: ["core-roll", "saving-throw", slug(ability)],
  modes: [{
    id: `${slug(ability)}-save`,
    label: `${ability} Save`,
    kind: "save",
    formula: "1d20",
    allowsAdvantage: true,
    naturalRollRule: "none",
    modifierControl: {
      label: `${ability} save`,
      defaultValue: 0,
      minimum: -10,
      maximum: 30
    }
  }]
});

export const savingThrowCards: RuleCard[] = saves.map(([ability, imageEmoji]) => ({
  id: `save-${slug(ability)}`,
  name: `${ability} Saving Throw`,
  kind: "saving-throw",
  imageEmoji,
  variants: {
    "srd-5.1-2014": variant("srd-5.1-2014", ability),
    "srd-5.2.1-2024": variant("srd-5.2.1-2024", ability)
  }
}));
