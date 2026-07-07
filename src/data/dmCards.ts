import type { DiceCard } from "../types/cards";

export const dmCards: DiceCard[] = [
  {
    id: "trap-cr-5",
    name: "Trap CR 5",
    category: "dm",
    formula: "6d6",
    description: "A medium-danger trap result for a mid-level party.",
    imageEmoji: "🪤",
    isFavorite: true
  },
  {
    id: "mimic-cr-5",
    name: "Mimic Chest CR 5",
    category: "dm",
    formula: "1d20",
    description: "Random chest outcome placeholder: treasure, empty, trap, or mimic.",
    imageEmoji: "📦",
    critOn: 20,
    failOn: 1,
    isFavorite: true
  },
  {
    id: "ambush-cr-5",
    name: "Ambush CR 5",
    category: "dm",
    formula: "1d20+4",
    description: "Quick ambush check placeholder for the DM deck.",
    imageEmoji: "👁️",
    critOn: 20,
    failOn: 1,
    isFavorite: true
  },
  {
    id: "treasure-cr-5",
    name: "Treasure CR 5",
    category: "dm",
    formula: "4d6+20",
    description: "Starter treasure value placeholder for future treasure tables.",
    imageEmoji: "💎",
    isFavorite: true
  }
];
