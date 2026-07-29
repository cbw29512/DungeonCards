import type { AdventureCard } from "../types/adventurePack";

export const hearthglowEvents: AdventureCard[] = [
  {
    id: "EVENT-01", kind: "event", roomNumber: 2, title: "A Forgotten Face",
    badge: "Inn event 1", playerText: "A guest has forgotten their spouse's face and quietly asks the party for help.",
    dmText: "Comforting them reveals that kind words briefly quiet the truth bell."
  },
  {
    id: "EVENT-02", kind: "event", roomNumber: 2, title: "Jam for Gremlins",
    badge: "Inn event 2", playerText: "Two Bellglass Gremlins crawl from the pantry carrying teaspoons like spears.",
    dmText: "They surrender immediately if offered jam. Otherwise use MON-002."
  },
  {
    id: "EVENT-03", kind: "event", roomNumber: 2, title: "The Unremembered Toast",
    badge: "Inn event 3", playerText: "A birthday toast repeats itself every thirty seconds, always stopping before the guest of honor's name.",
    dmText: "Completing the toast starts the optional side quest The Unremembered Toast."
  },
  {
    id: "EVENT-04", kind: "event", roomNumber: 2, title: "Portrait Moth",
    badge: "Inn event 4", playerText: "A Memory Moth lands on a character's portrait and begins drinking the painted smile.",
    dmText: "Share a happy memory or make a DC 12 Wisdom save. Failure removes reactions until the next turn."
  },
  {
    id: "EVENT-05", kind: "event", roomNumber: 2, title: "The Person Who Remembers",
    badge: "Inn event 5", playerText: "A courier arrives with a parcel addressed to “the person who still remembers.”",
    dmText: "The parcel belongs at Copper Kettle General Goods and leads directly to Room 4."
  },
  {
    id: "EVENT-06", kind: "event", roomNumber: 2, title: "A Voice in the Fire",
    badge: "Inn event 6", playerText: "The fireplace crackles in Mira's voice: “Kindness first.”",
    dmText: "This is an accidental magical recording, not live communication."
  },
  {
    id: "EVENT-07", kind: "event", roomNumber: 2, title: "The Cake-Hungry Hat",
    badge: "Inn event 7", playerText: "Three patrons accuse one another of stealing the same hat. The hat suddenly growls.",
    dmText: "It is a tiny Mimic-like animated object that wants cake, not blood."
  },
  {
    id: "EVENT-08", kind: "event", roomNumber: 2, title: "The Doors Lock",
    badge: "Inn event 8", playerText: "The inn doors slam shut as a loop of bell rope drops from the rafters.",
    dmText: "Place and reveal TRAP-002, the Falling Bell-Rope Snare."
  },
  {
    id: "EVENT-09", kind: "event", roomNumber: 2, title: "The Forbidden Tunnel",
    badge: "Inn event 9", playerText: "Brindle remembers a service tunnel beneath the cellar leading toward the foundry district.",
    dmText: "This creates a safe shortcut to Room 6."
  },
  {
    id: "EVENT-10", kind: "event", roomNumber: 2, title: "The Truth Bell Cracks",
    badge: "Inn event 10", playerText: "The truth bell cracks and releases a wave of silver light.",
    dmText: "Everyone may reroll one failed social or investigation check made in the inn."
  }
];
