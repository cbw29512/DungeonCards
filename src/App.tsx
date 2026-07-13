import { useState } from "react";
import { DeckGrid } from "./components/DeckGrid";
import { HomebrewBuilder } from "./components/HomebrewBuilder";
import { RulesDeck } from "./components/RulesDeck";
import { dmRuleCards, playerRuleCards } from "./data/ruleCardCatalog";
import { useHomebrewCards } from "./hooks/useHomebrewCards";
import "./styles/base.css";
import "./styles/cards.css";
import "./styles/history.css";
import "./styles/homebrew.css";
import "./styles/rule-cards.css";
import "./styles/rule-controls.css";
import "./styles/rule-history.css";
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

      {activePage !== "home" && <h1 className="sr-only">Dungeon Cards</h1>}

      {activePage === "home" && (
        <section className="hero compact-hero">
          <div className="hero__content">
            <p className="hero__eyebrow">Dungeon Cards Rules Engine</p>
            <h1>Choose the rule. Roll the card. Keep playing.</h1>
            <p>
              Poker-size cards keep 2014 and 2024 SRD rules separate while putting every useful control directly on the card.
            </p>
            <div className="role-card-grid">
              <button className="role-card" type="button" onClick={() => setActivePage("player")}>
                <span>🧙</span>
                <strong>Player Deck</strong>
                <small>Weapons, attacks, critical damage, scalable spells, and advantage controls.</small>
              </button>
              <button className="role-card" type="button" onClick={() => setActivePage("dm")}>
                <span>🎲</span>
                <strong>DM Deck</strong>
                <small>Scaled traps, magic-item generators, charge checks, and official random tables.</small>
              </button>
              <button className="role-card" type="button" onClick={() => setActivePage("homebrew")}>
                <span>🛠️</span>
                <strong>Homebrew</strong>
                <small>Create custom formulas without changing or relabeling SRD content.</small>
              </button>
            </div>
          </div>
        </section>
      )}

      {activePage === "player" && (
        <RulesDeck
          cards={playerRuleCards}
          eyebrow="player"
          title="Weapons and spells that scale on the card."
          description="Select 2014 or 2024 rules, roll mode, advantage, slot level, character level, and modifiers without leaving the card."
        />
      )}

      {activePage === "dm" && (
        <RulesDeck
          cards={dmRuleCards}
          eyebrow="dm"
          title="Rules-driven tools for the other side of the screen."
          description="Run scaled traps, generate sentient items, check crafting materials, recharge wands, and resolve random tables."
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
              description="These cards are stored locally in this browser and remain separate from SRD cards."
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