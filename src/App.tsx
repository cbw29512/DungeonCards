import { useState } from "react";
import { DeckGrid } from "./components/DeckGrid";
import { HomebrewBuilder } from "./components/HomebrewBuilder";
import { MonsterDeck } from "./components/MonsterDeck";
import { MonsterHomebrewBuilder } from "./components/MonsterHomebrewBuilder";
import { RulesDeck } from "./components/RulesDeck";
import { dmRuleCards, playerRuleCards } from "./data/ruleCardCatalog";
import { useHomebrewCards } from "./hooks/useHomebrewCards";
import { useHomebrewMonsters } from "./hooks/useHomebrewMonsters";
import "./styles/base.css";
import "./styles/cards.css";
import "./styles/history.css";
import "./styles/homebrew.css";
import "./styles/rule-cards.css";
import "./styles/rule-controls.css";
import "./styles/rule-history.css";
import "./styles/workspaces.css";
import "./styles/monsters.css";
import "./styles/monster-homebrew.css";
import "./styles/monster-print.css";
import "./styles/accessibility.css";

type AppPage = "home" | "player" | "dm" | "monster" | "homebrew" | "monster-homebrew";

export const App = () => {
  const [activePage, setActivePage] = useState<AppPage>("home");
  const {
    cards: homebrewCards,
    storageError,
    createCard,
    deleteCard
  } = useHomebrewCards();
  const {
    monsters: homebrewMonsters,
    storageError: homebrewMonsterError,
    createMonster,
    deleteMonster
  } = useHomebrewMonsters();

  return (
    <main>
      <nav className="top-nav" aria-label="Primary navigation">
        <strong>Dungeon Cards</strong>
        <div>
          <button aria-pressed={activePage === "home"} type="button" onClick={() => setActivePage("home")}>Home</button>
          <button aria-pressed={activePage === "player"} type="button" onClick={() => setActivePage("player")}>Player</button>
          <button aria-pressed={activePage === "dm"} type="button" onClick={() => setActivePage("dm")}>DM</button>
          <button aria-pressed={activePage === "monster"} type="button" onClick={() => setActivePage("monster")}>Monsters</button>
          <button aria-pressed={activePage === "homebrew"} type="button" onClick={() => setActivePage("homebrew")}>Card Builder</button>
          <button aria-pressed={activePage === "monster-homebrew"} type="button" onClick={() => setActivePage("monster-homebrew")}>Monster Builder</button>
        </div>
      </nav>

      {activePage !== "home" && <h1 className="sr-only">Dungeon Cards</h1>}

      {activePage === "home" && (
        <section className="hero compact-hero">
          <div className="hero__content">
            <p className="hero__eyebrow">Dungeon Cards Tabletop Toolkit</p>
            <h1>Choose the card. Run the encounter. Keep playing.</h1>
            <p>
              Player rules, DM tables, printable monster references, and guided homebrew now live in one ruleset-safe workspace.
            </p>
            <div className="role-card-grid">
              <button className="role-card" type="button" onClick={() => setActivePage("player")}>
                <span>🧙</span>
                <strong>Player Workspace</strong>
                <small>Keep only your character's attacks, damage, spells, checks, and saves on My Table.</small>
              </button>
              <button className="role-card" type="button" onClick={() => setActivePage("dm")}>
                <span>🎲</span>
                <strong>DM Workspace</strong>
                <small>Prepare traps, magic items, generators, and random tables for the current session.</small>
              </button>
              <button className="role-card" type="button" onClick={() => setActivePage("monster")}>
                <span>🐉</span>
                <strong>Monster Encounter</strong>
                <small>Choose monsters, pin tonight's creatures, open boss folios, and print poker-size references.</small>
              </button>
              <button className="role-card" type="button" onClick={() => setActivePage("homebrew")}>
                <span>🛠️</span>
                <strong>Card Builder</strong>
                <small>Create custom dice and rules cards without changing SRD content.</small>
              </button>
              <button className="role-card" type="button" onClick={() => setActivePage("monster-homebrew")}>
                <span>🧌</span>
                <strong>Monster Builder</strong>
                <small>Edit a complete example monster, save it to your library, and print a live folio.</small>
              </button>
            </div>
          </div>
        </section>
      )}

      {activePage === "player" && (
        <RulesDeck
          cards={playerRuleCards}
          description="Keep the cards your character uses on My Table, then open the full Library whenever your loadout changes."
          eyebrow="player"
          role="player"
          title="Your personal cards, ready when initiative starts."
        />
      )}

      {activePage === "dm" && (
        <RulesDeck
          cards={dmRuleCards}
          description="Prepare the current encounter on My Table and pull traps, items, generators, and random tables from the Library as needed."
          eyebrow="dm"
          role="dm"
          title="A focused DM screen backed by the full rules library."
        />
      )}

      {activePage === "monster" && (
        <MonsterDeck
          homebrewMonsters={homebrewMonsters}
          libraryError={homebrewMonsterError}
          onDeleteHomebrewMonster={deleteMonster}
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

      {activePage === "monster-homebrew" && (
        <MonsterHomebrewBuilder
          libraryError={homebrewMonsterError}
          onSave={createMonster}
        />
      )}
    </main>
  );
};
