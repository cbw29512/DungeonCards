import { useEffect, useMemo, useRef, useState } from "react";
import type { GameSystemId } from "../types/cardPlatform";
import type { DiceCard, RollResult } from "../types/cards";
import type {
  DiceDeckPersistedState,
  DiceRollHistoryEntry
} from "../types/diceDeckState";
import { createClientId } from "../utils/createId";
import {
  createEmptyDiceDeckState,
  loadDiceDeckState,
  MAX_DICE_ROLL_HISTORY,
  saveDiceDeckState
} from "../utils/diceDeckStateStorage";
import { rollDiceFormula } from "../utils/rollDice";

const CARD_RESET_DELAY_MS = 3500;

const initialPersistedState = (
  gameSystemId: GameSystemId,
  deckId: string
): DiceDeckPersistedState => {
  if (typeof window === "undefined") return createEmptyDiceDeckState(gameSystemId, deckId);
  try {
    return loadDiceDeckState(window.localStorage, gameSystemId, deckId);
  } catch {
    return createEmptyDiceDeckState(gameSystemId, deckId);
  }
};

export const useDiceDeckState = (
  cards: DiceCard[],
  gameSystemId: GameSystemId,
  deckId: string
) => {
  const [persisted, setPersisted] = useState(() => initialPersistedState(gameSystemId, deckId));
  const [activeFlippedCardId, setActiveFlippedCardId] = useState<string | null>(null);
  const [rollResults, setRollResults] = useState<Record<string, RollResult>>({});
  const [storageError, setStorageError] = useState<string | null>(null);
  const resetTimerRef = useRef<number | null>(null);
  const allowedCardIds = useMemo(() => new Set(cards.map((card) => card.id)), [cards]);

  const clearResetTimer = () => {
    if (resetTimerRef.current !== null) window.clearTimeout(resetTimerRef.current);
    resetTimerRef.current = null;
  };

  const persist = (next: DiceDeckPersistedState): boolean => {
    try {
      saveDiceDeckState(window.localStorage, next);
      setPersisted(next);
      setStorageError(null);
      return true;
    } catch (error) {
      console.error("Persisting Dice deck state failed", { gameSystemId, deckId, error });
      setStorageError("Deck favorites and roll history could not be saved in this browser.");
      return false;
    }
  };

  useEffect(() => {
    clearResetTimer();
    setActiveFlippedCardId(null);
    setRollResults({});
    try {
      setPersisted(loadDiceDeckState(window.localStorage, gameSystemId, deckId));
      setStorageError(null);
    } catch (error) {
      console.error("Loading Dice deck state failed", { gameSystemId, deckId, error });
      setPersisted(createEmptyDiceDeckState(gameSystemId, deckId));
      setStorageError("Saved deck favorites and roll history could not be loaded.");
    }
    return clearResetTimer;
  }, [deckId, gameSystemId]);

  useEffect(() => {
    const favorites = persisted.favoriteCardIds.filter((cardId) => allowedCardIds.has(cardId));
    if (favorites.length === persisted.favoriteCardIds.length) return;
    persist({ ...persisted, favoriteCardIds: favorites, updatedAt: new Date().toISOString() });
  }, [allowedCardIds, persisted.favoriteCardIds]);

  const toggleFavorite = (cardId: string) => {
    if (!allowedCardIds.has(cardId)) return;
    const favorite = persisted.favoriteCardIds.includes(cardId);
    persist({
      ...persisted,
      favoriteCardIds: favorite
        ? persisted.favoriteCardIds.filter((id) => id !== cardId)
        : [...persisted.favoriteCardIds, cardId],
      updatedAt: new Date().toISOString()
    });
  };

  const rollCard = (card: DiceCard) => {
    try {
      const result = rollDiceFormula(card.formula, { critOn: card.critOn, failOn: card.failOn });
      const entry: DiceRollHistoryEntry = {
        id: createClientId("roll"), cardId: card.id, cardName: card.name,
        category: card.category, formula: card.formula, result,
        gameSystemId, rolledAt: new Date().toISOString()
      };
      setActiveFlippedCardId(card.id);
      setRollResults((current) => ({ ...current, [card.id]: result }));
      persist({
        ...persisted,
        rollHistory: [entry, ...persisted.rollHistory].slice(0, MAX_DICE_ROLL_HISTORY),
        updatedAt: new Date().toISOString()
      });
      clearResetTimer();
      resetTimerRef.current = window.setTimeout(() => setActiveFlippedCardId(null), CARD_RESET_DELAY_MS);
    } catch (error) {
      console.error("Card roll failed", { cardId: card.id, gameSystemId, error });
    }
  };

  const clearHistory = () => persist({
    ...persisted,
    rollHistory: [],
    updatedAt: new Date().toISOString()
  });

  const removeCardState = (cardId: string) => persist({
    ...persisted,
    favoriteCardIds: persisted.favoriteCardIds.filter((id) => id !== cardId),
    updatedAt: new Date().toISOString()
  });

  return {
    activeFlippedCardId,
    rollResults,
    favoriteCardIds: persisted.favoriteCardIds,
    rollHistory: persisted.rollHistory,
    storageError,
    clearHistory,
    removeCardState,
    rollCard,
    toggleFavorite
  };
};
