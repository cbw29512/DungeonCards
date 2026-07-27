import { useState } from "react";
import type { DndGameSystemId } from "../types/cardPlatform";
import { PrivateCardLibraryWorkspace } from "./cardPlatform/PrivateCardLibraryWorkspace";

export const DndPrivateCardLibrary = () => {
  const [gameSystemId, setGameSystemId] = useState<DndGameSystemId>("dnd-2024");
  return (
    <section className="dnd-private-library">
      <header className="dnd-private-library__edition">
        <div>
          <small>Exact-edition boundary</small>
          <h2>Choose the D&D library before importing.</h2>
          <p>2014 and 2024 archives, cards, decks, and runtime state are saved independently.</p>
        </div>
        <div role="group" aria-label="D&D private library edition">
          <button aria-pressed={gameSystemId === "dnd-2014"} onClick={() => setGameSystemId("dnd-2014")} type="button">D&D 2014</button>
          <button aria-pressed={gameSystemId === "dnd-2024"} onClick={() => setGameSystemId("dnd-2024")} type="button">D&D 2024</button>
        </div>
      </header>
      <PrivateCardLibraryWorkspace gameSystemId={gameSystemId} />
    </section>
  );
};
