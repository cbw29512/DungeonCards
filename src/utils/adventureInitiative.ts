import type {
  AdventureCard,
  AdventureInitiativeEntry,
  AdventurePack,
  AdventureRuntimeState
} from "../types/adventurePack";

const abilityOrder = [
  "dexterity", "strength", "constitution", "intelligence", "wisdom", "charisma"
] as const;

const compareCards = (left: AdventureCard, right: AdventureCard): number => {
  for (const ability of abilityOrder) {
    const difference = (right.initiative?.[ability] ?? 0) - (left.initiative?.[ability] ?? 0);
    if (difference !== 0) return difference;
  }
  return left.title.localeCompare(right.title);
};

export const rollRoomInitiative = (
  pack: AdventurePack,
  state: AdventureRuntimeState,
  d20: () => number = () => Math.floor(Math.random() * 20) + 1
): AdventureRuntimeState => {
  try {
    const room = pack.rooms.find((candidate) => candidate.id === state.roomId);
    const roomIds = new Set(room?.cardIds ?? []);
    const participants = pack.cards.filter((card) => (
      card.initiative && (card.id === state.claimedCharacterId || roomIds.has(card.id))
    ));
    const rolls = new Map<string, number>();
    participants.forEach((card) => rolls.set(card.id, d20()));
    const sorted = [...participants].sort((left, right) => {
      const leftRoll = rolls.get(left.id) ?? 0;
      const rightRoll = rolls.get(right.id) ?? 0;
      const openingDifference = Number(rightRoll === 20) - Number(leftRoll === 20);
      if (openingDifference !== 0) return openingDifference;
      const totalDifference = (rightRoll + (right.initiative?.bonus ?? 0))
        - (leftRoll + (left.initiative?.bonus ?? 0));
      return totalDifference || compareCards(left, right);
    });
    const initiative: AdventureInitiativeEntry[] = sorted.map((card) => {
      const roll = rolls.get(card.id) ?? 0;
      return {
        cardId: card.id,
        title: card.title,
        roll,
        total: roll + (card.initiative?.bonus ?? 0),
        openingTurn: roll === 20
      };
    });
    return { ...state, initiative, round: initiative.length ? 1 : 0, activeTurn: 0 };
  } catch (error) {
    console.error("Unable to roll adventure initiative.", error);
    return state;
  }
};

export const advanceAdventureTurn = (state: AdventureRuntimeState): AdventureRuntimeState => {
  if (!state.initiative.length) return state;
  const next = state.activeTurn + 1;
  return next < state.initiative.length
    ? { ...state, activeTurn: next }
    : { ...state, activeTurn: 0, round: state.round + 1 };
};
