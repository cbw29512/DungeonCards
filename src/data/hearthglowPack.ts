import type { AdventurePack } from "../types/adventurePack";
import { hearthglowEncounterCards } from "./hearthglowEncounterCards";
import { hearthglowLocationCards, hearthglowRooms } from "./hearthglowLocations";
import { hearthglowPlayerCards } from "./hearthglowPlayerCards";

export const hearthglowPack: AdventurePack = {
  id: "first-chime-of-hearthglow",
  schemaVersion: 1,
  title: "The First Chime of Hearthglow",
  subtitle: "A cozy card-driven city mystery",
  level: 3,
  duration: "3–4 hours",
  rooms: hearthglowRooms,
  cards: [
    ...hearthglowLocationCards,
    ...hearthglowEncounterCards,
    ...hearthglowPlayerCards
  ]
};
