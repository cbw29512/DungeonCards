import type { RuleCard } from "../types/ruleCards";
import { sameSpell, slotDamage } from "./spellCardFactory";

export const spellAreaRuleCards: RuleCard[] = [
  {
    id: "burning-hands",
    name: "Burning Hands",
    kind: "spell",
    imageEmoji: "🔥",
    variants: sameSpell(
      "Burning Hands",
      "Level 1 • Action • Self • 15-ft. cone • Dexterity save",
      "3d6 Fire; half on a successful save. Add 1d6 per slot above level 1.",
      [slotDamage("3d6", 1, 1, 6)]
    )
  },
  {
    id: "thunderwave",
    name: "Thunderwave",
    kind: "spell",
    imageEmoji: "🌩️",
    variants: sameSpell(
      "Thunderwave",
      "Level 1 • Action • Self • 15-ft. cube • Constitution save",
      "2d8 Thunder and push 10 feet on a failed save. Add 1d8 per higher slot.",
      [slotDamage("2d8", 1, 1, 8)]
    )
  },
  {
    id: "shatter",
    name: "Shatter",
    kind: "spell",
    imageEmoji: "💥",
    variants: sameSpell(
      "Shatter",
      "Level 2 • Action • 60 ft. • 10-ft. radius • Constitution save",
      "3d8 Thunder; half on a successful save. Add 1d8 per slot above level 2.",
      [slotDamage("3d8", 2, 1, 8)]
    )
  },
  {
    id: "lightning-bolt",
    name: "Lightning Bolt",
    kind: "spell",
    imageEmoji: "⚡",
    variants: sameSpell(
      "Lightning Bolt",
      "Level 3 • Action • Self • 100-by-5-ft. line • Dexterity save",
      "8d6 Lightning; half on a successful save. Add 1d6 per slot above level 3.",
      [slotDamage("8d6", 3, 1, 6)]
    )
  },
  {
    id: "cone-of-cold",
    name: "Cone of Cold",
    kind: "spell",
    imageEmoji: "❄️",
    variants: sameSpell(
      "Cone of Cold",
      "Level 5 • Action • Self • 60-ft. cone • Constitution save",
      "8d8 Cold; half on a successful save. Add 1d8 per slot above level 5.",
      [slotDamage("8d8", 5, 1, 8)]
    )
  },
  {
    id: "call-lightning",
    name: "Call Lightning",
    kind: "spell",
    imageEmoji: "⛈️",
    variants: sameSpell(
      "Call Lightning",
      "Level 3 • Action • 120 ft. • Concentration • Dexterity save",
      "Call another bolt on later turns. A preexisting outdoor storm adds 1d10 damage.",
      [
        slotDamage("3d10", 3, 1, 10, undefined, "normal", "Normal bolt"),
        slotDamage("4d10", 3, 1, 10, undefined, "storm", "Storm bolt")
      ]
    )
  }
];