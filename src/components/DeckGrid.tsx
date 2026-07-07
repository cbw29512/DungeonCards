import { useRef, useState } from "react";
import type { DeckState, DiceCard as DiceCardType, RollHistoryEntry } from "../types/cards";
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
};

const buildHistoryEntry = (card: DiceCardType, result: RollHistoryEntry["result"]): RollHistoryEntry => {
  return {
    id: `${card.id}-${Date.now()}`,
    cardId: card.id,
    cardName: card.name,
    category: card.category,
    formula: card.formula,
    result,
    rolledAt: new Date().toISOString()
  };
};

export const DeckGrid = ({ cards, eyebrow, title, description }: DeckGridProps) => {
  const [deckState, setDeckState] = useState<DeckState>(initialDeckState);
  const resetTimerRef = useRef<number | null>(null);

  const clearResetTimer = () => {
    if (resetTimerRef.current !== null) {
      window.clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
  };

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
      const result = rollDiceFormula(card.formula);
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

  return (
    <section className="deck-section" aria-labelledby="deck-title">
      <div className="section-heading">
        <p>{eyebrow}</p>
        <h2 id="deck-title">{title}</h2>
        <span>{description}</span>
      </div>

      <div className="deck-layout">
        <div className="deck-grid">
          {cards.map((card) => (
            <DiceCard
              card={card}
              isFlipped={deckState.activeFlippedCardId === card.id}
              key={card.id}
              onFlip={handleFlip}
              result={deckState.rollResults[card.id]}
            />
          ))}
        </div>

        <RollHistory entries={deckState.rollHistory} />
      </div>
    </section>
  );
};
