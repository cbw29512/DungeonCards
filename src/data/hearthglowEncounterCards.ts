import type { AdventureCard } from "../types/adventurePack";

export const hearthglowEncounterCards: AdventureCard[] = [
  {
    id: "TRAP-002", kind: "trap", roomNumber: 2, title: "Falling Bell-Rope Snare",
    badge: "DC 12 Dexterity", playerText: "A loop of festival rope drops from the rafters with a sharp wooden snap.",
    dmText: "Failure: restrained and 1d6 bludgeoning. Escape DC 12. A cake offering makes the animated rope loosen.",
    quickStats: ["Detect DC 12", "Save DC 12", "Damage 1d6"]
  },
  {
    id: "TRAP-001", kind: "trap", roomNumber: 6, title: "Backward Chime Glyph",
    badge: "DC 13 Wisdom", playerText: "Written labels reverse as a deep bell-note plays backward.",
    dmText: "Failure: 2d6 psychic and no reactions until end of next turn. A sincere memory bypasses it.",
    quickStats: ["Detect DC 13", "Save DC 13", "Damage 2d6"]
  },
  {
    id: "MON-001", kind: "monster", roomNumber: 4, title: "Memory Moth Swarm",
    badge: "CR 1", playerText: "Pale moths orbit the silver polish, each wing reflecting a half-remembered smile.",
    dmText: "Disperses for a freely shared happy memory, bright magical light, or sweet food.",
    quickStats: ["AC 12", "HP 24", "Fly 40 ft.", "Nibble +4 · 2d4 psychic"],
    initiative: { bonus: 2, dexterity: 15, strength: 4, constitution: 12, intelligence: 5, wisdom: 12, charisma: 8 }
  },
  {
    id: "MON-002", kind: "monster", title: "Bellglass Gremlin",
    badge: "CR 1/2", playerText: "A silver-eyed gremlin raises a sharpened spoon and protects a sack of stolen keepsakes.",
    dmText: "Surrenders for jam, shiny buttons, or a sincere festival invitation.",
    quickStats: ["AC 13", "HP 16", "Spoon +5 · 1d6+3", "Saucer +5 · 1d4+3"],
    initiative: { bonus: 3, dexterity: 16, strength: 8, constitution: 12, intelligence: 10, wisdom: 10, charisma: 12 }
  },
  {
    id: "MON-003", kind: "monster", roomNumber: 6, title: "Animated Clapper",
    badge: "CR 1", playerText: "A heavy silver clapper tears free and swings through the air under its own power.",
    dmText: "Use Pealing Blow when two or more characters stand together.",
    quickStats: ["AC 15", "HP 22", "Strike +4 · 1d8+2", "Peal DC 12 · 2d6"],
    initiative: { bonus: 1, dexterity: 12, strength: 14, constitution: 14, intelligence: 3, wisdom: 10, charisma: 5 }
  },
  {
    id: "BOSS-001", kind: "monster", roomNumber: 6, title: "Hollow Chime Warden",
    badge: "Boss · CR 3", playerText: "A tall figure unfolds from empty sound, its hollow silver chest ringing with other people's laughter.",
    dmText: "Never attacks an unconscious hero. At 20 HP it asks why anyone would choose to remember pain.",
    quickStats: ["AC 15", "HP 68", "Fist +5 · 1d8+3 + 1d4", "Burst DC 13 · 3d6", "Harvest DC 13"],
    initiative: { bonus: 1, dexterity: 12, strength: 16, constitution: 16, intelligence: 11, wisdom: 14, charisma: 16 }
  },
  {
    id: "CLUE-001", kind: "clue", roomNumber: 5, title: "Mira's Repair Notes",
    playerText: "The spell was told to “fill every hollow place with joy.”", dmText: "The Warden followed the instruction literally."
  },
  {
    id: "CLUE-003", kind: "clue", roomNumber: 3, title: "The Missing Third Verse",
    playerText: "No heart is held by joy alone; we carry grief together.", dmText: "Speaking this sincerely enables the countertone."
  },
  {
    id: "CLUE-004", kind: "clue", roomNumber: 4, title: "Foundry Service Receipt",
    playerText: "Silver repair supplies were ordered for the abandoned bellfoundry.", dmText: "This is a direct route to Room 6."
  }
];
