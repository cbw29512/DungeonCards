import type { DiceCard } from "../types/cards";

export const dmCards: DiceCard[] = [
  {
    id: "trap-damage-example",
    name: "Trap Damage Example",
    category: "dm",
    formula: "6d6",
    description: "Generic trap damage example. Replace the formula with the damage specified by the trap you are running.",
    imageEmoji: "🪤",
    isFavorite: true
  },
  {
    id: "chest-outcome-prompt",
    name: "Chest Outcome Prompt",
    category: "dm",
    formula: "1d20",
    description: "Homebrew d20 prompt for a custom chest table. This is not an official Mimic stat block or encounter rule.",
    imageEmoji: "📦",
    isFavorite: true
  },
  {
    id: "ambush-check-example",
    name: "Ambush Check Example",
    category: "dm",
    formula: "1d20+4",
    description: "Generic example check. Replace the modifier and interpretation with the creature or encounter rules in use.",
    imageEmoji: "👁️",
    isFavorite: true
  },
  {
    id: "treasure-value-prompt",
    name: "Treasure Value Prompt",
    category: "dm",
    formula: "4d6+20",
    description: "Homebrew treasure prompt for quick inspiration. This is not an official 5e treasure table.",
    imageEmoji: "💎",
    isFavorite: true
  }
];
