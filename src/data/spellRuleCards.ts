import type { RuleCard } from "../types/ruleCards";
import {
  sameSpell,
  slotDamage,
  slotHealing,
  spellAttack,
  spellVariant
} from "./spellCardFactory";

export const spellRuleCards: RuleCard[] = [
  {
    id: "fireball",
    name: "Fireball",
    kind: "spell",
    imageEmoji: "☄️",
    variants: sameSpell(
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
      "srd-5.1-2014": spellVariant(
        "srd-5.1-2014", "Cure Wounds", "Level 1 • Action • Touch",
        "1d8 + spell modifier; add 1d8 per slot above level 1.",
        [slotHealing("1d8+3", 1, 8)]
      ),
      "srd-5.2.1-2024": spellVariant(
        "srd-5.2.1-2024", "Cure Wounds", "Level 1 • Action • Touch",
        "2d8 + spell modifier; add 2d8 per slot above level 1.",
        [slotHealing("2d8+3", 2, 8)]
      )
    }
  },
  {
    id: "healing-word",
    name: "Healing Word",
    kind: "spell",
    imageEmoji: "💬",
    variants: {
      "srd-5.1-2014": spellVariant(
        "srd-5.1-2014", "Healing Word", "Level 1 • Bonus Action • 60 ft.",
        "1d4 + spell modifier; add 1d4 per slot above level 1.",
        [slotHealing("1d4+3", 1, 4)]
      ),
      "srd-5.2.1-2024": spellVariant(
        "srd-5.2.1-2024", "Healing Word", "Level 1 • Bonus Action • 60 ft.",
        "2d4 + spell modifier; add 2d4 per slot above level 1.",
        [slotHealing("2d4+3", 2, 4)]
      )
    }
  },
  {
    id: "fire-bolt",
    name: "Fire Bolt",
    kind: "spell",
    imageEmoji: "🔥",
    variants: sameSpell(
      "Fire Bolt", "Cantrip • Action • 120 ft. • Ranged spell attack",
      "Damage scales at character levels 5, 11, and 17.",
      [spellAttack(), {
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
    variants: sameSpell(
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
    variants: sameSpell(
      "Scorching Ray", "Level 2 • Action • 120 ft. • Separate attacks",
      "Three rays for 2d6 each. Add one ray per slot above level 2.",
      [spellAttack(), slotDamage("6d6", 2, 2, 6)]
    )
  }
];