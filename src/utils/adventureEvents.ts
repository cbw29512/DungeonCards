import type { AdventurePack, AdventureRuntimeState } from "../types/adventurePack";
import { secureRandomInteger } from "./randomInteger";

export const rollAdventureEvent = (
  state: AdventureRuntimeState,
  pack: AdventurePack,
  d10: () => number = () => secureRandomInteger(1, 10)
): AdventureRuntimeState => {
  try {
    const roll = d10();
    if (!Number.isInteger(roll) || roll < 1 || roll > 10) {
      throw new Error(`Event roll must be 1–10; received ${roll}.`);
    }
    const cardId = `EVENT-${String(roll).padStart(2, "0")}`;
    if (!pack.cards.some((card) => card.id === cardId && card.kind === "event")) {
      throw new Error(`Event card ${cardId} is missing from the adventure pack.`);
    }
    return { ...state, activeEventCardId: cardId };
  } catch (error) {
    console.error("Unable to roll room event.", error);
    return state;
  }
};
