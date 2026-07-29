import type { AdventurePack, AdventureRuntimeState } from "../../types/adventurePack";
import { AdventureCardTile } from "./AdventureCardTile";

type Props = {
  pack: AdventurePack;
  state: AdventureRuntimeState;
  onRoom(roomId: string): void;
  onReveal(cardId: string): void;
  onTreasure(cardId: string): void;
};

export const AdventureDmView = ({
  onReveal,
  onRoom,
  onTreasure,
  pack,
  state
}: Props) => {
  const room = pack.rooms.find((candidate) => candidate.id === state.roomId) ?? pack.rooms[0];
  const cards = room
    ? room.cardIds.map((id) => pack.cards.find((card) => card.id === id)).filter((card) => card !== undefined)
    : [];

  return (
    <div className="adventure-dm">
      <aside className="adventure-room-list">
        <h2>Build the dungeon</h2>
        {pack.rooms.map((candidate) => (
          <button
            aria-pressed={candidate.id === room?.id}
            key={candidate.id}
            onClick={() => onRoom(candidate.id)}
            type="button"
          >
            <span>Room {candidate.number}</span>
            <strong>{candidate.title}</strong>
          </button>
        ))}
      </aside>
      <section className="adventure-board">
        <header>
          <p>Room {room?.number}</p>
          <h2>{room?.title}</h2>
          <span>Select cards to reveal them on every player screen.</span>
        </header>
        <div className="adventure-card-row">
          {cards.map((card) => (
            <AdventureCardTile
              card={card}
              dmView
              key={card.id}
              onAction={() => card.kind === "treasure" ? onTreasure(card.id) : onReveal(card.id)}
              actionLabel={card.kind === "treasure" ? "Approve treasure" : undefined}
              revealed={state.revealedCardIds.includes(card.id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
