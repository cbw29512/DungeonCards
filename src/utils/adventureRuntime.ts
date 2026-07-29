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
  usedTurnResources: []
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
): AdventureRuntimeState => ({ ...state, claimedCharacterId: cardId });

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
