import type { RuleCard, RuleRollMode } from "../types/ruleCards";
import {
  cantripDamage,
  sameSpell,
  spellAttack,
  spellVariant
} from "./spellCardFactory";

const eldritchBlastModes: RuleRollMode[] = [
  spellAttack("Attack each beam"),
  { id: "per-beam", label: "One beam", kind: "damage", formula: "1d10" },
  cantripDamage(10, "all-beams", "All beams hit")
];

export const spellCantripRuleCards: RuleCard[] = [
  {
    id: "chill-touch",
    name: "Chill Touch",
    kind: "spell",
    imageEmoji: "💀",
    variants: {
      "srd-5.1-2014": spellVariant(
        "srd-5.1-2014",
        "Chill Touch",
        "Cantrip • Action • 120 ft. • Ranged spell attack",
        "1d8 Necrotic and no healing until your next turn; an Undead target also has Disadvantage on attacks against you.",
        [spellAttack(), cantripDamage(8)]
      ),
      "srd-5.2.1-2024": spellVariant(
        "srd-5.2.1-2024",
        "Chill Touch",
        "Cantrip • Action • Touch • Melee spell attack",
        "1d10 Necrotic and no healing until the end of your next turn.",
        [spellAttack(), cantripDamage(10)]
      )
    }
  },
  {
    id: "poison-spray",
    name: "Poison Spray",
    kind: "spell",
    imageEmoji: "☠️",
    variants: {
      "srd-5.1-2014": spellVariant(
        "srd-5.1-2014",
        "Poison Spray",
        "Cantrip • Action • 10 ft. • Constitution save",
        "1d12 Poison on a failed save. Damage scales at levels 5, 11, and 17.",
        [cantripDamage(12)]
      ),
      "srd-5.2.1-2024": spellVariant(
        "srd-5.2.1-2024",
        "Poison Spray",
        "Cantrip • Action • 30 ft. • Ranged spell attack",
        "1d12 Poison on a hit. Damage scales at levels 5, 11, and 17.",
        [spellAttack(), cantripDamage(12)]
      )
    }
  },
  {
    id: "ray-of-frost",
    name: "Ray of Frost",
    kind: "spell",
    imageEmoji: "🧊",
    variants: sameSpell(
      "Ray of Frost",
      "Cantrip • Action • 60 ft. • Ranged spell attack",
      "1d8 Cold and reduce the target's Speed by 10 feet until the start of your next turn.",
      [spellAttack(), cantripDamage(8)]
    )
  },
  {
    id: "sacred-flame",
    name: "Sacred Flame",
    kind: "spell",
    imageEmoji: "🕯️",
    variants: sameSpell(
      "Sacred Flame",
      "Cantrip • Action • 60 ft. • Dexterity save",
      "1d8 Radiant on a failed save; cover does not grant its usual benefit to this save.",
      [cantripDamage(8)]
    )
  },
  {
    id: "eldritch-blast",
    name: "Eldritch Blast",
    kind: "spell",
    imageEmoji: "🟣",
    variants: sameSpell(
      "Eldritch Blast",
      "Cantrip • Action • 120 ft. • Separate ranged spell attacks",
      "One 1d10 Force beam; gain a second beam at level 5, third at 11, and fourth at 17. Roll each attack separately.",
      eldritchBlastModes
    )
  }
];