import { useState } from "react";
import { hearthglowPack } from "../data/hearthglowPack";
import {
  claimCharacter,
  createAdventureState,
  joinAdventure,
  placeAdventureCard,
  removeAdventureCard,
  selectAdventureRoom,
  selectAdventurePlayer,
  setAdventureView,
  toggleRevealedCard
} from "../utils/adventureRuntime";
import { AdventureDmView } from "./adventure/AdventureDmView";
import { AdventureInitiative } from "./adventure/AdventureInitiative";
import { AdventurePlayerView } from "./adventure/AdventurePlayerView";
import { AdventureLobby } from "./adventure/AdventureLobby";
import {
  advanceAdventureTurn,
  rollRoomInitiative,
  toggleTurnResource
} from "../utils/adventureInitiative";
import { rollAdventureEvent } from "../utils/adventureEvents";

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
        onResource={(resource) => safelyUpdate("track turn resource", () => setState((current) => toggleTurnResource(current, resource)))}
      />
      <AdventureLobby
        cards={hearthglowPack.cards}
        state={state}
        onJoin={(name) => safelyUpdate("join table", () => setState((current) => joinAdventure(current, name)))}
        onSelect={(id) => safelyUpdate("select player", () => setState((current) => selectAdventurePlayer(current, id)))}
      />
      {state.view === "dm" ? (
        <AdventureDmView
          pack={hearthglowPack}
          state={state}
          onPlace={(id) => safelyUpdate("place card", () => setState((current) => placeAdventureCard(current, id, hearthglowPack)))}
          onRemove={(id) => safelyUpdate("remove card", () => setState((current) => removeAdventureCard(current, id)))}
          onRoom={(id) => safelyUpdate("select room", () => setState((current) => selectAdventureRoom(current, id, hearthglowPack)))}
          onReveal={(id) => safelyUpdate("reveal card", () => setState((current) => toggleRevealedCard(current, id, hearthglowPack)))}
          onRollEvent={() => safelyUpdate("roll room event", () => setState((current) => rollAdventureEvent(current, hearthglowPack)))}
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
