export type AdventureCardKind =
  | "room"
  | "npc"
  | "monster"
  | "trap"
  | "treasure"
  | "clue"
  | "event"
  | "recovery"
  | "character";

export type AdventureCard = {
  id: string;
  kind: AdventureCardKind;
  title: string;
  roomNumber?: number;
  playerText: string;
  dmText?: string;
  badge?: string;
  quickStats?: string[];
  initiative?: {
    bonus: number;
    dexterity: number;
    strength: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
};

export type AdventureRoom = {
  id: string;
  number: number;
  title: string;
  cardIds: string[];
};

export type AdventurePack = {
  id: string;
  schemaVersion: 1;
  title: string;
  subtitle: string;
  level: number;
  duration: string;
  cards: AdventureCard[];
  rooms: AdventureRoom[];
};

export type AdventureView = "dm" | "player";
export type AdventureBoardSlot = "room" | "npc" | "monster" | "trap" | "treasure" | "clue";
export type AdventureTurnResource = "movement" | "action" | "bonus" | "free" | "reaction";

export type AdventureRuntimeState = {
  view: AdventureView;
  roomId: string;
  revealedCardIds: string[];
  claimedCharacterId?: string;
  backpackCardIds: string[];
  initiative: AdventureInitiativeEntry[];
  round: number;
  activeTurn: number;
  openingTurnCount: number;
  placedCardIdsByRoom: Record<string, string[]>;
  usedTurnResources: AdventureTurnResource[];
  activeEventCardId?: string;
  sessionCode: string;
  players: AdventurePlayerSeat[];
  activePlayerId?: string;
};

export type AdventurePlayerSeat = {
  id: string;
  name: string;
  characterId?: string;
};

export type AdventureInitiativeEntry = {
  entryId: string;
  cardId: string;
  title: string;
  roll: number;
  total: number;
  openingTurn: boolean;
};
