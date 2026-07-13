import type {
  RuleCardVariant,
  RuleRollMode,
  RulesetId
} from "../types/ruleCards";

const source = (ruleset: RulesetId, spell: string): string =>
  `${ruleset === "srd-5.1-2014" ? "SRD 5.1" : "SRD 5.2.1"} • ${spell}`;

export const spellVariant = (
  ruleset: RulesetId,
  spell: string,
  summary: string,
  detail: string,
  modes: RuleRollMode[]
): RuleCardVariant => ({
  ruleset,
  source: "srd",
  sourceReference: source(ruleset, spell),
  summary,
  detail,
  tags: ["spell"],
  modes
});

export const sameSpell = (
  spell: string,
  summary: string,
  detail: string,
  modes: RuleRollMode[]
) => ({
  "srd-5.1-2014": spellVariant("srd-5.1-2014", spell, summary, detail, modes),
  "srd-5.2.1-2024": spellVariant("srd-5.2.1-2024", spell, summary, detail, modes)
});

export const spellAttack = (): RuleRollMode => ({
  id: "attack",
  label: "Attack",
  kind: "attack",
  formula: "1d20+5",
  allowsAdvantage: true,
  naturalRollRule: "attack",
  modifierControl: { label: "Spell attack", defaultValue: 5, minimum: -5, maximum: 20 }
});

export const slotDamage = (
  formula: string,
  baseLevel: number,
  dicePerLevel: number,
  dieSides: number,
  modifierPerLevel?: number,
  id = "effect",
  label = "Effect"
): RuleRollMode => ({
  id,
  label,
  kind: "damage",
  formula,
  scaling: { kind: "slot-dice", baseLevel, maxLevel: 9, dicePerLevel, dieSides, modifierPerLevel }
});

export const slotHealing = (
  formula: string,
  dicePerLevel: number,
  dieSides: number
): RuleRollMode => ({
  ...slotDamage(formula, 1, dicePerLevel, dieSides),
  kind: "healing",
  modifierControl: { label: "Spell modifier", defaultValue: 3, minimum: -5, maximum: 20 }
});