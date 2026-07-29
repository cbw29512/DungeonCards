import type {
  AdventureBoardSlot as Slot,
  AdventureCard
} from "../../types/adventurePack";
import { AdventureCardTile } from "./AdventureCardTile";

type Props = {
  cards: AdventureCard[];
  slot: Slot;
  onAdd(slot: Slot): void;
  onRemove(cardId: string): void;
  onReveal(cardId: string): void;
  revealedIds: string[];
};

const slotLabels: Record<Slot, string> = {
  room: "Room",
  npc: "NPCs",
  monster: "Monsters",
  trap: "Traps and hazards",
  treasure: "Treasure",
  clue: "Clues and handouts"
};

export const AdventureBoardSlot = ({
  cards,
  onAdd,
  onRemove,
  onReveal,
  revealedIds,
  slot
}: Props) => (
  <section className={`adventure-slot adventure-slot--${slot}`}>
    <header>
      <div>
        <span>Board slot</span>
        <h3>{slotLabels[slot]}</h3>
      </div>
      <button aria-label={`Add ${slot} card`} onClick={() => onAdd(slot)} type="button">＋</button>
    </header>
    <div className="adventure-card-row">
      {cards.length ? cards.map((card) => (
        <div className="adventure-card-stack" key={card.id}>
          <AdventureCardTile
            card={card}
            dmView
            onAction={() => onReveal(card.id)}
            revealed={revealedIds.includes(card.id)}
          />
          <button className="adventure-remove" onClick={() => onRemove(card.id)} type="button">
            Remove from room
          </button>
        </div>
      )) : (
        <button className="adventure-empty-slot" onClick={() => onAdd(slot)} type="button">
          <strong>＋ Add {slot}</strong>
          <span>Choose from the card library</span>
        </button>
      )}
    </div>
  </section>
);
