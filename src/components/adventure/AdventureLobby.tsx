import { useState } from "react";
import type { AdventureCard, AdventureRuntimeState } from "../../types/adventurePack";

type Props = {
  cards: AdventureCard[];
  state: AdventureRuntimeState;
  onJoin(name: string): void;
  onSelect(playerId: string): void;
};

export const AdventureLobby = ({ cards, onJoin, onSelect, state }: Props) => {
  const [name, setName] = useState("");
  const titleFor = (id?: string) => cards.find((card) => card.id === id)?.title ?? "Choosing character";

  return (
    <section className="adventure-lobby">
      <header>
        <div><p>Table code</p><strong>{state.sessionCode}</strong></div>
        <span>Players join, then claim one available character.</span>
      </header>
      <form onSubmit={(event) => {
        event.preventDefault();
        onJoin(name);
        setName("");
      }}>
        <label htmlFor="adventure-player-name">Player name</label>
        <input id="adventure-player-name" value={name} onChange={(event) => setName(event.target.value)} />
        <button type="submit">Join table</button>
      </form>
      {state.players.length > 0 && (
        <div className="adventure-player-seats">
          {state.players.map((player) => (
            <button
              aria-pressed={player.id === state.activePlayerId}
              key={player.id}
              onClick={() => onSelect(player.id)}
              type="button"
            >
              <strong>{player.name}</strong><span>{titleFor(player.characterId)}</span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
};
