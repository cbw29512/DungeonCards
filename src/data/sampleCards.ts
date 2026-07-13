import type { DiceCard } from "../types/cards";

export const sampleCards: DiceCard[] = [
  {
    id: "barb-greataxe-attack",
    name: "Greataxe Attack",
    category: "attack",
    formula: "1d20+8",
    description: "Example melee attack roll for a barbarian with 20 Strength and a +3 proficiency bonus.",
    imageEmoji: "🪓",
    critOn: 20,
    failOn: 1,
    isFavorite: true
  },
  {
    id: "barb-greataxe-damage",
    name: "Greataxe Damage",
    category: "damage",
    formula: "1d12+5",
    description: "Greataxe damage with 20 Strength. The greataxe uses a d12 damage die.",
    imageEmoji: "💥",
    isFavorite: true
  },
  {
    id: "barb-rage-greataxe",
    name: "Rage Greataxe",
    category: "damage",
    formula: "1d12+7",
    description: "Example greataxe damage with 20 Strength and a +2 Rage damage bonus.",
    imageEmoji: "🔥",
    isFavorite: true
  },
  {
    id: "fireball-level-5",
    name: "Fireball Level 5",
    category: "spell",
    formula: "10d6",
    description: "Fireball cast with a 5th-level spell slot for 10d6 fire damage.",
    imageEmoji: "☄️",
    isFavorite: true
  },
  {
    id: "initiative",
    name: "Initiative",
    category: "skill",
    formula: "1d20+2",
    description: "Example initiative roll with a +2 Dexterity modifier. Natural 20 and 1 are not automatic outcomes.",
    imageEmoji: "⚔️",
    isFavorite: true
  }
];
