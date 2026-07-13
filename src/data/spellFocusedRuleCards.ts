import type { RuleCard, RuleRollMode } from "../types/ruleCards";
import {
  sameSpell,
  slotDamage,
  spellAttack,
  spellVariant
} from "./spellCardFactory";

const blinkMode = (
  formula: string,
  successMin: number,
  successMax: number
): RuleRollMode => ({
  id: "blink-check",
  label: "End-turn check",
  kind: "table",
  formula,
  choices: [{
    id: "blink",
    label: "Blink check",
    formula,
    table: [
      { min: 1, max: successMin - 1, result: "Remain on the current plane." },
      { min: successMin, max: successMax, result: "Vanish to the Ethereal Plane until your next turn." }
    ]
  }]
});

export const spellFocusedRuleCards: RuleCard[] = [
  {
    id: "moonbeam",
    name: "Moonbeam",
    kind: "spell",
    imageEmoji: "🌙",
    variants: sameSpell(
      "Moonbeam",
      "Level 2 • Action • 120 ft. • Concentration • Constitution save",
      "2d10 Radiant; half on a successful save. Add 1d10 per slot above level 2.",
      [slotDamage("2d10", 2, 1, 10)]
    )
  },
  {
    id: "blight",
    name: "Blight",
    kind: "spell",
    imageEmoji: "🥀",
    variants: sameSpell(
      "Blight",
      "Level 4 • Action • 30 ft. • Constitution save",
      "8d8 Necrotic; half on a successful save. Add 1d8 per slot above level 4.",
      [slotDamage("8d8", 4, 1, 8)]
    )
  },
  {
    id: "guiding-bolt",
    name: "Guiding Bolt",
    kind: "spell",
    imageEmoji: "🌟",
    variants: sameSpell(
      "Guiding Bolt",
      "Level 1 • Action • 120 ft. • Ranged spell attack",
      "4d6 Radiant; the next attack against the target has Advantage. Add 1d6 per higher slot.",
      [spellAttack(), slotDamage("4d6", 1, 1, 6)]
    )
  },
  {
    id: "hellish-rebuke",
    name: "Hellish Rebuke",
    kind: "spell",
    imageEmoji: "😈",
    variants: sameSpell(
      "Hellish Rebuke",
      "Level 1 • Reaction • 60 ft. • Dexterity save",
      "2d10 Fire; half on a successful save. Add 1d10 per slot above level 1.",
      [slotDamage("2d10", 1, 1, 10)]
    )
  },
  {
    id: "blink",
    name: "Blink",
    kind: "spell",
    imageEmoji: "🫥",
    variants: {
      "srd-5.1-2014": spellVariant(
        "srd-5.1-2014",
        "Blink",
        "Level 3 • Action • Self • 1 minute • Roll at each turn's end",
        "On 11–20 on 1d20, vanish to the Ethereal Plane until your next turn.",
        [blinkMode("1d20", 11, 20)]
      ),
      "srd-5.2.1-2024": spellVariant(
        "srd-5.2.1-2024",
        "Blink",
        "Level 3 • Action • Self • 1 minute • Roll at each turn's end",
        "On 4–6 on 1d6, vanish to the Ethereal Plane until your next turn.",
        [blinkMode("1d6", 4, 6)]
      )
    }
  }
];