import { useState } from "react";
import { hearthglowPack } from "../data/hearthglowPack";
import {
  addTreasure,
  claimCharacter,
  createAdventureState,
  selectAdventureRoom,
  setAdventureView,
  toggleRevealedCard
} from "../utils/adventureRuntime";
import { AdventureDmView } from "./adventure/AdventureDmView";
import { AdventureInitiative } from "./adventure/AdventureInitiative";
import { AdventurePlayerView } from "./adventure/AdventurePlayerView";
import { advanceAdventureTurn, rollRoomInitiative } from "../utils/adventureInitiative";

export const AdventurePackWorkspace = () => {
  const [state, setState] = useState(() => createAdventureState(hearthglowPack));

  const safelyUpdate = (label: string, update: () => void) => {
    try {
      update();
    } catch (error) {
      console.error(`Unable to ${label}.`, error);
    }
  };

  return (
    <section className="adventure-workspace">
      <header className="adventure-hero">
        <div>
          <p>Official starter adventure · Level {hearthglowPack.level}</p>
          <h1>{hearthglowPack.title}</h1>
          <span>{hearthglowPack.subtitle} · {hearthglowPack.duration}</span>
        </div>
        <div className="adventure-view-toggle" aria-label="Adventure view">
          <button aria-pressed={state.view === "dm"} onClick={() => setState(setAdventureView(state, "dm"))} type="button">DM view</button>
          <button aria-pressed={state.view === "player"} onClick={() => setState(setAdventureView(state, "player"))} type="button">Player view</button>
          <button type="button" onClick={() => window.print()}>Print pack</button>
        </div>
      </header>
      <AdventureInitiative
        state={state}
        onRoll={() => safelyUpdate("roll initiative", () => setState((current) => rollRoomInitiative(hearthglowPack, current)))}
        onNext={() => safelyUpdate("advance turn", () => setState((current) => advanceAdventureTurn(current)))}
      />
      {state.view === "dm" ? (
        <AdventureDmView
          pack={hearthglowPack}
          state={state}
          onRoom={(id) => safelyUpdate("select room", () => setState((current) => selectAdventureRoom(current, id, hearthglowPack)))}
          onReveal={(id) => safelyUpdate("reveal card", () => setState((current) => toggleRevealedCard(current, id, hearthglowPack)))}
          onTreasure={(id) => safelyUpdate("approve treasure", () => setState((current) => addTreasure(current, id)))}
        />
      ) : (
        <AdventurePlayerView
          cards={hearthglowPack.cards}
          state={state}
          onClaim={(id) => safelyUpdate("claim character", () => setState((current) => claimCharacter(current, id)))}
        />
      )}
    </section>
  );
};
