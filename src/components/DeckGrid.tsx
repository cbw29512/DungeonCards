import { useState } from "react";
import { sampleCards } from "../data/sampleCards";
import type { DeckState, DiceCard as DiceCardType } from "../types/cards";
import { rollDiceFormula } from "../utils/rollDice";
import { DiceCard } from "./DiceCard";

const initialDeckState: DeckState = {
  flippedCardIds: [],
  rollResults: {}
};

export const DeckGrid = () => {
  const [deckState, setDeckState] = useState<DeckState>(initialDeckState);

  const handleFlip = (card: DiceCardType) => {
    try {
      const result = rollDiceFormula(card.formula);

      setDeckState((currentState) => {
        const alreadyFlipped = currentState.flippedCardIds.includes(card.id);
        const nextFlippedIds = alreadyFlipped
          ? currentState.flippedCardIds
          : [...currentState.flippedCardIds, card.id];

        return {
          flippedCardIds: nextFlippedIds,
          rollResults: {
            ...currentState.rollResults,
            [card.id]: result
          }
        };
      });
    } catch (error) {
      console.error("Card flip failed", { cardId: card.id, error });
    }
  };

  return (
    <section className="deck-section" aria-labelledby="player-deck-title">
      <div className="section-heading">
        <p>Player Deck</p>
        <h2 id="player-deck-title">Flip the card. Get the result.</h2>
      </div>

      <div className="deck-grid">
        {sampleCards.map((card) => (
          <DiceCard
            card={card}
            isFlipped={deckState.flippedCardIds.includes(card.id)}
            key={card.id}
            onFlip={handleFlip}
            result={deckState.rollResults[card.id]}
          />
        ))}
      </div>
    </section>
  );
};
