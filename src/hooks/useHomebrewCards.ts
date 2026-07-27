import { useRef, useState } from "react";
import type {
  HomebrewCardDraft,
  HomebrewDiceCard
} from "../types/cards";
import { createClientId } from "../utils/createId";
import { loadHomebrewCards, saveHomebrewCards } from "../utils/homebrewStorage";
import { validateDiceFormula } from "../utils/rollDice";

type InitialHomebrewState = {
  cards: HomebrewDiceCard[];
  error: string | null;
  migrationNotice: string | null;
};

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : "An unexpected homebrew card error occurred.";

const loadInitialState = (): InitialHomebrewState => {
  if (typeof window === "undefined") return { cards: [], error: null, migrationNotice: null };
  try {
    const loaded = loadHomebrewCards(window.localStorage);
    if (loaded.migratedLegacyCount > 0) saveHomebrewCards(window.localStorage, loaded.cards);
    return {
      cards: loaded.cards,
      error: null,
      migrationNotice: loaded.migratedLegacyCount > 0
        ? `${loaded.migratedLegacyCount.toLocaleString("en-US")} legacy homebrew card${loaded.migratedLegacyCount === 1 ? " was" : "s were"} assigned to D&D 2024. You can recreate a 2014 copy when needed.`
        : null
    };
  } catch (error) {
    console.error("Initializing homebrew state failed", { error });
    return { cards: [], error: getErrorMessage(error), migrationNotice: null };
  }
};

export const useHomebrewCards = () => {
  const [initialState] = useState<InitialHomebrewState>(loadInitialState);
  const [cards, setCards] = useState<HomebrewDiceCard[]>(initialState.cards);
  const cardsRef = useRef<HomebrewDiceCard[]>(initialState.cards);
  const [storageError, setStorageError] = useState<string | null>(initialState.error);

  const persistCards = (nextCards: HomebrewDiceCard[]): boolean => {
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
      const card: HomebrewDiceCard = {
        ...draft,
        id: createClientId("homebrew"),
        category: "homebrew",
        schemaVersion: 2
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
    migrationNotice: initialState.migrationNotice,
    createCard,
    deleteCard
  };
};
