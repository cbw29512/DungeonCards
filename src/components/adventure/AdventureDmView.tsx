import { useState } from "react";
import type {
  AdventureBoardSlot as Slot,
  AdventurePack,
  AdventureRuntimeState
} from "../../types/adventurePack";
import { AdventureBoardSlot } from "./AdventureBoardSlot";
import { AdventureCardLibrary } from "./AdventureCardLibrary";

type Props = {
  pack: AdventurePack;
  state: AdventureRuntimeState;
  onPlace(cardId: string): void;
  onRemove(cardId: string): void;
  onRoom(roomId: string): void;
  onReveal(cardId: string): void;
};

const boardOrder: Slot[] = ["room", "npc", "monster", "trap", "treasure", "clue"];

export const AdventureDmView = ({
  onPlace,
  onRemove,
  onReveal,
  onRoom,
  pack,
  state
}: Props) => {
  const [librarySlot, setLibrarySlot] = useState<Slot>();
  const room = pack.rooms.find((candidate) => candidate.id === state.roomId) ?? pack.rooms[0];
  const placedIds = state.placedCardIdsByRoom[state.roomId] ?? [];
  const placedCards = placedIds
    .map((id) => pack.cards.find((card) => card.id === id))
    .filter((card) => card !== undefined);

  const addCard = (cardId: string) => {
    onPlace(cardId);
    setLibrarySlot(undefined);
  };

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
        <header className="adventure-board__heading">
          <div><p>Room {room?.number}</p><h2>{room?.title}</h2></div>
          <span>The DM sees both card faces. Players receive only revealed player faces.</span>
        </header>
        {boardOrder.map((slot) => (
          <AdventureBoardSlot
            cards={placedCards.filter((card) => card.kind === slot)}
            key={slot}
            onAdd={setLibrarySlot}
            onRemove={onRemove}
            onReveal={onReveal}
            revealedIds={state.revealedCardIds}
            slot={slot}
          />
        ))}
      </section>
      {librarySlot && (
        <AdventureCardLibrary
          cards={pack.cards}
          onAdd={addCard}
          onClose={() => setLibrarySlot(undefined)}
          placedIds={placedIds}
          slot={librarySlot}
        />
      )}
    </div>
  );
};
