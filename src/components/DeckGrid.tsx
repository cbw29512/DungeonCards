import { useEffect, useRef, useState } from "react";
import type { DeckState, DiceCard as DiceCardType, RollHistoryEntry } from "../types/cards";
import { createClientId } from "../utils/createId";
import { rollDiceFormula } from "../utils/rollDice";
import { DiceCard } from "./DiceCard";
import { RollHistory } from "./RollHistory";

const CARD_RESET_DELAY_MS = 3500;
const MAX_HISTORY_ITEMS = 25;

const initialDeckState: DeckState = {
  activeFlippedCardId: null,
  rollResults: {},
  rollHistory: []
};

type DeckGridProps = {
  cards: DiceCardType[];
  eyebrow: string;
  title: string;
  description: string;
  onDeleteCard?: (cardId: string) => boolean;
};

const buildHistoryEntry = (
  card: DiceCardType,
  result: RollHistoryEntry["result"]
): RollHistoryEntry => ({
  id: createClientId("roll"),
  cardId: card.id,
  cardName: card.name,
  category: card.category,
  formula: card.formula,
  result,
  rolledAt: new Date().toISOString()
});

export const DeckGrid = ({ cards, eyebrow, title, description, onDeleteCard }: DeckGridProps) => {
  const [deckState, setDeckState] = useState<DeckState>(initialDeckState);
  const resetTimerRef = useRef<number | null>(null);
  const sectionTitleId = `${eyebrow.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-title`;

  const clearResetTimer = () => {
    if (resetTimerRef.current !== null) {
      window.clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => clearResetTimer();
  }, []);

  const scheduleCardReset = () => {
    clearResetTimer();
    resetTimerRef.current = window.setTimeout(() => {
      setDeckState((currentState) => ({
        ...currentState,
        activeFlippedCardId: null
      }));
    }, CARD_RESET_DELAY_MS);
  };

  const handleFlip = (card: DiceCardType) => {
    try {
      const result = rollDiceFormula(card.formula, {
        critOn: card.critOn,
        failOn: card.failOn
      });
      const historyEntry = buildHistoryEntry(card, result);

      setDeckState((currentState) => ({
        activeFlippedCardId: card.id,
        rollResults: {
          ...currentState.rollResults,
          [card.id]: result
        },
        rollHistory: [historyEntry, ...currentState.rollHistory].slice(0, MAX_HISTORY_ITEMS)
      }));
      scheduleCardReset();
    } catch (error) {
      console.error("Card flip failed", { cardId: card.id, error });
    }
  };

  const handleDelete = (cardId: string) => {
    try {
      const deleted = onDeleteCard?.(cardId);

      if (deleted === false) {
        console.error("Card deletion was not persisted", { cardId });
      }
    } catch (error) {
      console.error("Card deletion failed", { cardId, error });
    }
  };

  return (
    <section className="deck-section" aria-labelledby={sectionTitleId}>
      <div className="section-heading">
        <p>{eyebrow}</p>
        <h2 id={sectionTitleId}>{title}</h2>
        <span>{description}</span>
      </div>

      <div className="deck-layout">
        <div className="deck-grid">
          {cards.map((card) => (
            <div className="deck-card-item" key={card.id}>
              <DiceCard
                card={card}
                isFlipped={deckState.activeFlippedCardId === card.id}
                onFlip={handleFlip}
                result={deckState.rollResults[card.id]}
              />
              {onDeleteCard && (
                <button
                  className="delete-card-button"
                  onClick={() => handleDelete(card.id)}
                  type="button"
                >
                  Delete {card.name}
                </button>
              )}
            </div>
          ))}
        </div>

        <RollHistory entries={deckState.rollHistory} />
      </div>
    </section>
  );
};