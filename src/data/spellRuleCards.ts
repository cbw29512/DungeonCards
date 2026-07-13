import type {
  RuleCard,
  RuleCardVariant,
  RuleRollMode,
  RulesetId
} from "../types/ruleCards";

const source = (ruleset: RulesetId, spell: string): string =>
  `${ruleset === "srd-5.1-2014" ? "SRD 5.1" : "SRD 5.2.1"} • ${spell}`;

const variant = (
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

const attack = (): RuleRollMode => ({
  id: "attack",
  label: "Attack",
  kind: "attack",
  formula: "1d20+5",
  allowsAdvantage: true,
  naturalRollRule: "attack",
  modifierControl: { label: "Spell attack", defaultValue: 5, minimum: -5, maximum: 20 }
});

const slotDamage = (
  formula: string,
  baseLevel: number,
  dicePerLevel: number,
  dieSides: number,
  modifierPerLevel?: number
): RuleRollMode => ({
  id: "effect",
  label: "Effect",
  kind: "damage",
  formula,
  scaling: { kind: "slot-dice", baseLevel, maxLevel: 9, dicePerLevel, dieSides, modifierPerLevel }
});

const healing = (
  formula: string,
  dicePerLevel: number,
  dieSides: number
): RuleRollMode => ({
  ...slotDamage(formula, 1, dicePerLevel, dieSides),
  kind: "healing",
  modifierControl: { label: "Spell modifier", defaultValue: 3, minimum: -5, maximum: 20 }
});

const same = (spell: string, summary: string, detail: string, modes: RuleRollMode[]) => ({
  "srd-5.1-2014": variant("srd-5.1-2014", spell, summary, detail, modes),
  "srd-5.2.1-2024": variant("srd-5.2.1-2024", spell, summary, detail, modes)
});

export const spellRuleCards: RuleCard[] = [
  {
    id: "fireball",
    name: "Fireball",
    kind: "spell",
    imageEmoji: "☄️",
    variants: same(
      "Fireball",
      "Level 3 • 150 ft. • Dexterity save • 20-ft. radius",
      "8d6 Fire; half on a successful save. Add 1d6 per slot above level 3.",
      [slotDamage("8d6", 3, 1, 6)]
    )
  },
  {
    id: "cure-wounds",
    name: "Cure Wounds",
    kind: "spell",
    imageEmoji: "✨",
    variants: {
      "srd-5.1-2014": variant(
        "srd-5.1-2014", "Cure Wounds", "Level 1 • Action • Touch",
        "1d8 + spell modifier; add 1d8 per slot above level 1.", [healing("1d8+3", 1, 8)]
      ),
      "srd-5.2.1-2024": variant(
        "srd-5.2.1-2024", "Cure Wounds", "Level 1 • Action • Touch",
        "2d8 + spell modifier; add 2d8 per slot above level 1.", [healing("2d8+3", 2, 8)]
      )
    }
  },
  {
    id: "healing-word",
    name: "Healing Word",
    kind: "spell",
    imageEmoji: "💬",
    variants: {
      "srd-5.1-2014": variant(
        "srd-5.1-2014", "Healing Word", "Level 1 • Bonus Action • 60 ft.",
        "1d4 + spell modifier; add 1d4 per slot above level 1.", [healing("1d4+3", 1, 4)]
      ),
      "srd-5.2.1-2024": variant(
        "srd-5.2.1-2024", "Healing Word", "Level 1 • Bonus Action • 60 ft.",
        "2d4 + spell modifier; add 2d4 per slot above level 1.", [healing("2d4+3", 2, 4)]
      )
    }
  },
  {
    id: "fire-bolt",
    name: "Fire Bolt",
    kind: "spell",
    imageEmoji: "🔥",
    variants: same(
      "Fire Bolt", "Cantrip • Action • 120 ft. • Ranged spell attack",
      "Damage scales at character levels 5, 11, and 17.",
      [attack(), {
        id: "effect", label: "Damage", kind: "damage", formula: "1d10",
        scaling: { kind: "character-formula", tiers: [
          { level: 1, formula: "1d10" }, { level: 5, formula: "2d10" },
          { level: 11, formula: "3d10" }, { level: 17, formula: "4d10" }
        ] }
      }]
    )
  },
  {
    id: "magic-missile",
    name: "Magic Missile",
    kind: "spell",
    imageEmoji: "🌠",
    variants: same(
      "Magic Missile", "Level 1 • Action • 120 ft. • Automatic hits",
      "Three darts; each deals 1d4 + 1 Force. Add one dart per higher slot.",
      [slotDamage("3d4+3", 1, 1, 4, 1)]
    )
  },
  {
    id: "scorching-ray",
    name: "Scorching Ray",
    kind: "spell",
    imageEmoji: "🔆",
    variants: same(
      "Scorching Ray", "Level 2 • Action • 120 ft. • Separate attacks",
      "Three rays for 2d6 each. The damage roll totals all rays that hit one target.",
      [attack(), slotDamage("6d6", 2, 2, 6)]
    )
  }
];