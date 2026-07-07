import { useState } from "react";
import { DeckGrid } from "./components/DeckGrid";
import { dmCards } from "./data/dmCards";
import { sampleCards } from "./data/sampleCards";
import "./styles.css";

type AppPage = "home" | "player" | "dm";

export const App = () => {
  const [activePage, setActivePage] = useState<AppPage>("home");

  return (
    <main>
      <nav className="top-nav" aria-label="Primary navigation">
        <strong>Dungeon Cards</strong>
        <div>
          <button type="button" onClick={() => setActivePage("home")}>Home</button>
          <button type="button" onClick={() => setActivePage("player")}>Player Deck</button>
          <button type="button" onClick={() => setActivePage("dm")}>DM Deck</button>
        </div>
      </nav>

      {activePage === "home" && (
        <section className="hero compact-hero">
          <div className="hero__content">
            <p className="hero__eyebrow">Dungeon Cards MVP</p>
            <h1>Flip a card. Get the roll. Keep playing.</h1>
            <p>
              Pick your table role and jump straight into the cards. The first screen is built for fast use at the table.
            </p>
            <div className="role-card-grid">
              <button className="role-card" type="button" onClick={() => setActivePage("player")}>
                <span>🧙</span>
                <strong>Player Deck</strong>
                <small>Attacks, spells, saves, skills, favorites, and future homebrew actions.</small>
              </button>
              <button className="role-card" type="button" onClick={() => setActivePage("dm")}>
                <span>🎲</span>
                <strong>DM Deck</strong>
                <small>Traps, mimics, treasure, ambushes, puzzles, and encounter tools.</small>
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
          description="Flip attacks, damage, saves, spells, and favorite homebrew cards without scrolling through a character sheet."
        />
      )}

      {activePage === "dm" && (
        <DeckGrid
          cards={dmCards}
          eyebrow="DM Deck"
          title="Fast encounter tools for the table."
          description="Prototype DM cards for traps, mimic chests, ambushes, and treasure. These become CR-based pages next."
        />
      )}
    </main>
  );
};
