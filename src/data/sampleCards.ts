import type { DiceCard } from "../types/cards";

export const sampleCards: DiceCard[] = [
  {
    id: "barb-greatclub-attack",
    name: "Greatclub Attack",
    category: "attack",
    formula: "1d20+8",
    description: "Attack roll for a barbarian using a greatclub.",
    imageEmoji: "🪓",
    critOn: 20,
    failOn: 1,
    isFavorite: true
  },
  {
    id: "barb-greatclub-damage",
    name: "Greatclub Damage",
    category: "damage",
    formula: "1d12+5",
    description: "Greatclub damage with 20 Strength.",
    imageEmoji: "💥",
    isFavorite: true
  },
  {
    id: "barb-rage-greatclub",
    name: "Rage Greatclub",
    category: "damage",
    formula: "1d12+7",
    description: "Greatclub damage with 20 Strength and Rage bonus.",
    imageEmoji: "🔥",
    isFavorite: true
  },
  {
    id: "fireball-level-5",
    name: "Fireball Level 5",
    category: "spell",
    formula: "10d6",
    description: "Upcast Fireball at 5th level for 10d6 fire damage.",
    imageEmoji: "☄️",
    isFavorite: true
  },
  {
    id: "initiative",
    name: "Initiative",
    category: "skill",
    formula: "1d20+2",
    description: "A quick initiative card for combat start.",
    imageEmoji: "⚔️",
    critOn: 20,
    failOn: 1,
    isFavorite: true
  }
];
