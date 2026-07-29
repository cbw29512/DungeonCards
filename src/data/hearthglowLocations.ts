import type { AdventureCard, AdventureRoom } from "../types/adventurePack";

export const hearthglowRooms: AdventureRoom[] = [
  { id: "square", number: 1, title: "Lanternhome Square", cardIds: ["LOC-005", "NPC-001"] },
  { id: "inn", number: 2, title: "Heartbreak Inn", cardIds: ["LOC-001", "NPC-002", "TRAP-002"] },
  { id: "chapel", number: 3, title: "Chapel of the Last Lantern", cardIds: ["LOC-002", "NPC-003", "CLUE-003"] },
  { id: "goods", number: 4, title: "Copper Kettle General Goods", cardIds: ["LOC-003", "CLUE-004", "MON-001"] },
  { id: "magic", number: 5, title: "Moon and Mortar Magic Shop", cardIds: ["LOC-004", "CLUE-001", "ITEM-003"] },
  { id: "foundry", number: 6, title: "Old Bellfoundry", cardIds: ["LOC-006", "TRAP-001", "MON-003", "BOSS-001", "ITEM-001"] }
];

export const hearthglowLocationCards: AdventureCard[] = [
  {
    id: "LOC-005", kind: "room", roomNumber: 1, title: "Lanternhome Square",
    playerText: "Festival ribbons cross a bright city square, but the First Chime rings backward. A baker drops a tray and asks why everyone is celebrating.",
    dmText: "Mira Quill vanished after repairing the bell. Give the party the invitation and make the danger immediate."
  },
  {
    id: "NPC-001", kind: "npc", roomNumber: 1, title: "Mayor Tamsin Vale",
    badge: "Quest giver", playerText: "A worried mayor grips a silver invitation whose guest of honor has disappeared.",
    dmText: "She knows Mira repaired the bell and visited the magic shop. She does not know about the Warden."
  },
  {
    id: "LOC-001", kind: "room", roomNumber: 2, title: "Heartbreak Inn",
    playerText: "Warm firelight, sugared cake, and quiet music fill the inn. A tiny truth bell on the counter rings whenever someone says a name they truly remember.",
    dmText: "Roll or choose one of ten inn events. Brindle saw Mira carrying silver tools toward the foundry district."
  },
  {
    id: "NPC-002", kind: "npc", roomNumber: 2, title: "Brindle Hearth",
    badge: "Innkeeper", playerText: "The innkeeper remembers every guest's favorite drink—but not the face of her own sister.",
    dmText: "Kindness earns the foundry shortcut. Pressure makes Brindle defensive but never blocks the clue."
  },
  {
    id: "LOC-002", kind: "room", roomNumber: 3, title: "Chapel of the Last Lantern",
    playerText: "Hundreds of named lanterns hang from the rafters. At the altar, the third line of an old four-line hymn has vanished.",
    dmText: "The missing countertone is: “No heart is held by joy alone; we carry grief together.” Progress never requires a roll."
  },
  {
    id: "NPC-003", kind: "npc", roomNumber: 3, title: "Sister Elowen",
    badge: "Rare NPC", playerText: "An amber-robed priest repaints fading names as quickly as the letters disappear.",
    dmText: "She explains that the bell was made to help people carry grief together, not erase it."
  },
  {
    id: "LOC-003", kind: "room", roomNumber: 4, title: "Copper Kettle General Goods",
    playerText: "Six hundred necessities crowd the narrow shop. One shelf label is blank, and a handcart of silver polish waits for a customer nobody remembers.",
    dmText: "The order was Mira's. The receipt, cart tracks, or neighboring vendors point to the bellfoundry."
  },
  {
    id: "LOC-004", kind: "room", roomNumber: 5, title: "Moon and Mortar Magic Shop",
    playerText: "Bottled clouds drift between shelves. A note beneath a crystal reads: “I thought the bell was lonely. I may have taught it to hunger.”",
    dmText: "Reveal that the Warden is an accidental protector. Three sincere memories at the clapper remove Resonant Shell."
  },
  {
    id: "LOC-006", kind: "room", roomNumber: 6, title: "Old Bellfoundry",
    playerText: "The foundry crouches beneath the city wall. Below, hundreds of stolen voices remember birthdays, farewells, first kisses, apologies, and names.",
    dmText: "Reveal the glyph first. The finale supports combat, ritual, negotiation, or a mixed resolution."
  }
];
