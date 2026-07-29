import type { AdventureCard } from "../types/adventurePack";

export const hearthglowPlayerCards: AdventureCard[] = [
  { id: "PC-001", kind: "character", title: "Bob Bramble", badge: "Human Barbarian 3", playerText: "Front-line protector who fears forgotten promises more than monsters.", quickStats: ["AC 14", "HP 35", "Initiative +2"], initiative: { bonus: 2, dexterity: 14, strength: 17, constitution: 16, intelligence: 8, wisdom: 12, charisma: 10 } },
  { id: "PC-002", kind: "character", title: "Wren Vale", badge: "Halfling Bard 3", playerText: "Support and social problem solver who knows the hymn's first two verses.", quickStats: ["AC 14", "HP 24", "Initiative +3"], initiative: { bonus: 3, dexterity: 16, strength: 8, constitution: 12, intelligence: 12, wisdom: 10, charisma: 17 } },
  { id: "PC-003", kind: "character", title: "Pip Thimble", badge: "Gnome Rogue 3", playerText: "A sharp-eyed courier who saw Mira trying not to cry.", quickStats: ["AC 15", "HP 24", "Initiative +4"], initiative: { bonus: 4, dexterity: 18, strength: 8, constitution: 12, intelligence: 14, wisdom: 13, charisma: 10 } },
  { id: "PC-004", kind: "character", title: "Marigold Ash", badge: "Dwarf Cleric 3", playerText: "A healer who believes grief is proof that love existed.", quickStats: ["AC 17", "HP 30", "Initiative +0"], initiative: { bonus: 0, dexterity: 10, strength: 14, constitution: 16, intelligence: 10, wisdom: 17, charisma: 12 } },
  { id: "ITEM-001", kind: "treasure", roomNumber: 6, title: "Pocket Chime of Clear Thought", badge: "Rare · Attunement", playerText: "Spend 1 of 3 charges to reroll a failed Intelligence, Wisdom, or Charisma save.", dmText: "Regains 1d3 charges at dawn." },
  { id: "ITEM-002", kind: "treasure", title: "Hearthglow Festival Lantern", badge: "Common", playerText: "Glows when someone sincerely says another creature's name." },
  { id: "ITEM-003", kind: "treasure", roomNumber: 5, title: "Moon-Sugar Tonic", badge: "Consumable", playerText: "Bonus action: regain 1d6+2 HP and end one effect preventing reactions." },
  { id: "ITEM-004", kind: "treasure", title: "Bellfounder's Apron", badge: "Uncommon", playerText: "Advantage with smith's tools and resistance to environmental thunder damage." }
];
