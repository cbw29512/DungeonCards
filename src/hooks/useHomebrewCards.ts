import { useRef, useState } from "react";
import type { DiceCard, HomebrewCardDraft } from "../types/cards";
import { createClientId } from "../utils/createId";
import { loadHomebrewCards, saveHomebrewCards } from "../utils/homebrewStorage";
import { validateDiceFormula } from "../utils/rollDice";

type InitialHomebrewState = {
  cards: DiceCard[];
  error: string | null;
};

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : "An unexpected homebrew card error occurred.";

const loadInitialState = (): InitialHomebrewState => {
  if (typeof window === "undefined") {
    return { cards: [], error: null };
  }

  try {
    return {
      cards: loadHomebrewCards(window.localStorage),
      error: null
    };
  } catch (error) {
    console.error("Initializing homebrew state failed", { error });
    return {
      cards: [],
      error: getErrorMessage(error)
    };
  }
};

export const useHomebrewCards = () => {
  const [initialState] = useState<InitialHomebrewState>(loadInitialState);
  const [cards, setCards] = useState<DiceCard[]>(initialState.cards);
  const cardsRef = useRef<DiceCard[]>(initialState.cards);
  const [storageError, setStorageError] = useState<string | null>(initialState.error);

  const persistCards = (nextCards: DiceCard[]): boolean => {
    try {
      saveHomebrewCards(window.localStorage, nextCards);
      cardsRef.current = nextCards;
      setCards(nextCards);
      setStorageError(null);
      return true;
    } catch (error) {
      console.error("Persisting homebrew state failed", { error });
      setStorageError(getErrorMessage(error));
      return false;
    }
  };

  const createCard = (draft: HomebrewCardDraft): boolean => {
    try {
      validateDiceFormula(draft.formula);
      const card: DiceCard = {
        ...draft,
        id: createClientId("homebrew"),
        category: "homebrew"
      };

      return persistCards([card, ...cardsRef.current]);
    } catch (error) {
      console.error("Creating a homebrew card failed", { draft, error });
      setStorageError(getErrorMessage(error));
      return false;
    }
  };

  const deleteCard = (cardId: string): boolean => {
    try {
      return persistCards(cardsRef.current.filter((card) => card.id !== cardId));
    } catch (error) {
      console.error("Deleting a homebrew card failed", { cardId, error });
      setStorageError(getErrorMessage(error));
      return false;
    }
  };

  return {
    cards,
    storageError,
    createCard,
    deleteCard
  };
};