import type {
  AdventureBoardSlot,
  AdventureCard
} from "../../types/adventurePack";
import { AdventureCardTile } from "./AdventureCardTile";

type Props = {
  cards: AdventureCard[];
  slot: AdventureBoardSlot;
  placedIds: string[];
  onAdd(cardId: string): void;
  onClose(): void;
};

export const AdventureCardLibrary = ({
  cards,
  onAdd,
  onClose,
  placedIds,
  slot
}: Props) => {
  const available = cards.filter((card) => card.kind === slot && !placedIds.includes(card.id));

  return (
    <aside className="adventure-library" aria-label={`${slot} card library`}>
      <header>
        <div>
          <p>Adventure card library</p>
          <h2>Choose a {slot} card</h2>
        </div>
        <button type="button" onClick={onClose}>Close</button>
      </header>
      <div className="adventure-card-row">
        {available.length ? available.map((card) => (
          <AdventureCardTile
            actionLabel={`Add ${card.title}`}
            card={card}
            dmView
            key={card.id}
            onAction={() => onAdd(card.id)}
          />
        )) : <p className="adventure-empty">Every available {slot} card is already on this board.</p>}
      </div>
    </aside>
  );
};
