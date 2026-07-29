import type {
  AdventurePack,
  AdventureRuntimeState,
  AdventureView
} from "../types/adventurePack";

export const createAdventureState = (pack: AdventurePack): AdventureRuntimeState => ({
  view: "dm",
  roomId: pack.rooms[0]?.id ?? "",
  revealedCardIds: [],
  backpackCardIds: [],
  initiative: [],
  round: 0,
  activeTurn: 0,
  openingTurnCount: 0,
  placedCardIdsByRoom: Object.fromEntries(
    pack.rooms.map((room) => [room.id, [...room.cardIds]])
  ),
  usedTurnResources: [],
  sessionCode: "HEARTH",
  players: []
});

export const setAdventureView = (
  state: AdventureRuntimeState,
  view: AdventureView
): AdventureRuntimeState => ({ ...state, view });

export const selectAdventureRoom = (
  state: AdventureRuntimeState,
  roomId: string,
  pack: AdventurePack
): AdventureRuntimeState => {
  try {
    if (!pack.rooms.some((room) => room.id === roomId)) {
      throw new Error(`Unknown adventure room: ${roomId}`);
    }
    return { ...state, roomId, revealedCardIds: [] };
  } catch (error) {
    console.error("Unable to select adventure room.", error);
    return state;
  }
};

export const toggleRevealedCard = (
  state: AdventureRuntimeState,
  cardId: string,
  pack: AdventurePack
): AdventureRuntimeState => {
  try {
    if (!pack.cards.some((card) => card.id === cardId)) {
      throw new Error(`Unknown adventure card: ${cardId}`);
    }
    const exists = state.revealedCardIds.includes(cardId);
    return {
      ...state,
      revealedCardIds: exists
        ? state.revealedCardIds.filter((id) => id !== cardId)
        : [...state.revealedCardIds, cardId]
    };
  } catch (error) {
    console.error("Unable to reveal adventure card.", error);
    return state;
  }
};

export const claimCharacter = (
  state: AdventureRuntimeState,
  cardId: string
): AdventureRuntimeState => {
  try {
    if (!state.activePlayerId) throw new Error("Join the table before claiming a character.");
    if (state.players.some((player) => player.id !== state.activePlayerId && player.characterId === cardId)) {
      throw new Error("That character is already claimed.");
    }
    return {
      ...state,
      claimedCharacterId: cardId,
      players: state.players.map((player) => (
        player.id === state.activePlayerId ? { ...player, characterId: cardId } : player
      ))
    };
  } catch (error) {
    console.error("Unable to claim adventure character.", error);
    return state;
  }
};

export const joinAdventure = (
  state: AdventureRuntimeState,
  name: string
): AdventureRuntimeState => {
  try {
    const cleanName = name.trim();
    if (!cleanName) throw new Error("A player name is required.");
    const id = `player-${Date.now()}-${state.players.length}`;
    return {
      ...state,
      activePlayerId: id,
      claimedCharacterId: undefined,
      players: [...state.players, { id, name: cleanName }]
    };
  } catch (error) {
    console.error("Unable to join adventure.", error);
    return state;
  }
};

export const selectAdventurePlayer = (
  state: AdventureRuntimeState,
  playerId: string
): AdventureRuntimeState => {
  const player = state.players.find((candidate) => candidate.id === playerId);
  return player
    ? { ...state, activePlayerId: playerId, claimedCharacterId: player.characterId }
    : state;
};

export const addTreasure = (
  state: AdventureRuntimeState,
  cardId: string
): AdventureRuntimeState => (
  state.backpackCardIds.includes(cardId)
    ? state
    : { ...state, backpackCardIds: [...state.backpackCardIds, cardId] }
);

export const placeAdventureCard = (
  state: AdventureRuntimeState,
  cardId: string,
  pack: AdventurePack
): AdventureRuntimeState => {
  try {
    if (!pack.cards.some((card) => card.id === cardId)) {
      throw new Error(`Unknown adventure card: ${cardId}`);
    }
    const placed = state.placedCardIdsByRoom[state.roomId] ?? [];
    if (placed.includes(cardId)) return state;
    return {
      ...state,
      placedCardIdsByRoom: {
        ...state.placedCardIdsByRoom,
        [state.roomId]: [...placed, cardId]
      }
    };
  } catch (error) {
    console.error("Unable to place adventure card.", error);
    return state;
  }
};

export const removeAdventureCard = (
  state: AdventureRuntimeState,
  cardId: string
): AdventureRuntimeState => ({
  ...state,
  revealedCardIds: state.revealedCardIds.filter((id) => id !== cardId),
  placedCardIdsByRoom: {
    ...state.placedCardIdsByRoom,
    [state.roomId]: (state.placedCardIdsByRoom[state.roomId] ?? [])
      .filter((id) => id !== cardId)
  }
});
