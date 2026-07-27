import type { GameSystemId } from "../types/cardPlatform";
import type { DiceCard as DiceCardType } from "../types/cards";
import { useDiceDeckState } from "../hooks/useDiceDeckState";
import { DiceCard } from "./DiceCard";
import { RollHistory } from "./RollHistory";

type DeckGridProps = {
  cards: DiceCardType[];
  deckId: string;
  gameSystemId: GameSystemId;
  eyebrow: string;
  title: string;
  description: string;
  onDeleteCard?: (cardId: string) => boolean;
};

export const DeckGrid = ({
  cards,
  deckId,
  gameSystemId,
  eyebrow,
  title,
  description,
  onDeleteCard
}: DeckGridProps) => {
  const deck = useDiceDeckState(cards, gameSystemId, deckId);
  const sectionTitleId = `${eyebrow.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-title`;

  const handleDelete = (cardId: string) => {
    try {
      const deleted = onDeleteCard?.(cardId);
      if (deleted === false) {
        console.error("Card deletion was not persisted", { cardId });
        return;
      }
      deck.removeCardState(cardId);
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
        {deck.storageError && <p className="workspace-error" role="alert">{deck.storageError}</p>}
      </div>

      <div className="deck-layout">
        <div className="deck-grid">
          {cards.map((card) => {
            const favorite = deck.favoriteCardIds.includes(card.id);
            return (
              <div className="deck-card-item" key={card.id}>
                <DiceCard
                  card={card}
                  isFlipped={deck.activeFlippedCardId === card.id}
                  onFlip={deck.rollCard}
                  result={deck.rollResults[card.id]}
                />
                <div className="deck-card-actions">
                  <button
                    aria-pressed={favorite}
                    className="favorite-card-button"
                    onClick={() => deck.toggleFavorite(card.id)}
                    type="button"
                  >
                    {favorite ? "★ Favorited" : "☆ Favorite"} {card.name}
                  </button>
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
              </div>
            );
          })}
        </div>

        <RollHistory entries={deck.rollHistory} onClear={() => deck.clearHistory()} />
      </div>
    </section>
  );
};
