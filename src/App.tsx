import { useState } from "react";
import { DeckGrid } from "./components/DeckGrid";
import { HomebrewBuilder } from "./components/HomebrewBuilder";
import { dmCards } from "./data/dmCards";
import { sampleCards } from "./data/sampleCards";
import { useHomebrewCards } from "./hooks/useHomebrewCards";
import "./styles/base.css";
import "./styles/cards.css";
import "./styles/history.css";
import "./styles/homebrew.css";
import "./styles/accessibility.css";

type AppPage = "home" | "player" | "dm" | "homebrew";

export const App = () => {
  const [activePage, setActivePage] = useState<AppPage>("home");
  const {
    cards: homebrewCards,
    storageError,
    createCard,
    deleteCard
  } = useHomebrewCards();

  return (
    <main>
      <nav className="top-nav" aria-label="Primary navigation">
        <strong>Dungeon Cards</strong>
        <div>
          <button aria-pressed={activePage === "home"} type="button" onClick={() => setActivePage("home")}>Home</button>
          <button aria-pressed={activePage === "player"} type="button" onClick={() => setActivePage("player")}>Player Deck</button>
          <button aria-pressed={activePage === "dm"} type="button" onClick={() => setActivePage("dm")}>DM Deck</button>
          <button aria-pressed={activePage === "homebrew"} type="button" onClick={() => setActivePage("homebrew")}>Homebrew</button>
        </div>
      </nav>

      {activePage === "home" && (
        <section className="hero compact-hero">
          <div className="hero__content">
            <p className="hero__eyebrow">Dungeon Cards MVP</p>
            <h1>Flip a card. Get the roll. Keep playing.</h1>
            <p>
              Pick your table role or build the exact action card your character needs.
            </p>
            <div className="role-card-grid">
              <button className="role-card" type="button" onClick={() => setActivePage("player")}>
                <span>🧙</span>
                <strong>Player Deck</strong>
                <small>Attacks, spells, saves, skills, and frequently used actions.</small>
              </button>
              <button className="role-card" type="button" onClick={() => setActivePage("dm")}>
                <span>🎲</span>
                <strong>DM Deck</strong>
                <small>Traps, treasure, ambushes, prompts, and encounter tools.</small>
              </button>
              <button className="role-card" type="button" onClick={() => setActivePage("homebrew")}>
                <span>🛠️</span>
                <strong>Homebrew</strong>
                <small>Create, save, roll, and remove custom cards in this browser.</small>
              </button>
            </div>
          </div>
        </section>
      )}

      {activePage === "player" && (
        <DeckGrid
          cards={sampleCards}
          eyebrow="Player Deck"
          title="Your most-used actions, ready immediately."
          description="Flip attacks, damage, spells, initiative, and favorite actions without searching a character sheet."
        />
      )}

      {activePage === "dm" && (
        <DeckGrid
          cards={dmCards}
          eyebrow="DM Deck"
          title="Fast encounter tools for the table."
          description="Configurable prototype prompts for traps, chests, ambushes, and treasure."
        />
      )}

      {activePage === "homebrew" && (
        <>
          <HomebrewBuilder onCreate={createCard} storageError={storageError} />
          {homebrewCards.length > 0 ? (
            <DeckGrid
              cards={homebrewCards}
              eyebrow="Homebrew Deck"
              title="Your custom cards are ready to roll."
              description="These cards are stored locally in this browser and survive a page refresh."
              onDeleteCard={deleteCard}
            />
          ) : (
            <p className="homebrew-empty">
              No homebrew cards yet. Build your first card above and it will appear here.
            </p>
          )}
        </>
      )}
    </main>
  );
};
