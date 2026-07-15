import { useState } from "react";
import { CocPreview } from "./components/CocPreview";
import { DeckGrid } from "./components/DeckGrid";
import { DndRulesGuide } from "./components/DndRulesGuide";
import { GameSystemGateway, type GameSystemId } from "./components/GameSystemGateway";
import { HomebrewBuilder } from "./components/HomebrewBuilder";
import { MonsterDeck } from "./components/MonsterDeck";
import { MonsterHomebrewBuilder } from "./components/MonsterHomebrewBuilder";
import { RulesDeck } from "./components/RulesDeck";
import { SrdCompendium } from "./components/SrdCompendium";
import { dmRuleCards, playerRuleCards } from "./data/ruleCardCatalog";
import { useHomebrewCards } from "./hooks/useHomebrewCards";
import { useHomebrewMonsters } from "./hooks/useHomebrewMonsters";
import "./styles/base.css";
import "./styles/cards.css";
import "./styles/history.css";
import "./styles/homebrew.css";
import "./styles/rule-cards.css";
import "./styles/rule-controls.css";
import "./styles/rule-advantage.css";
import "./styles/rule-history.css";
import "./styles/rules-guide.css";
import "./styles/srd-compendium.css";
import "./styles/workspaces.css";
import "./styles/monsters.css";
import "./styles/monster-homebrew.css";
import "./styles/monster-print.css";
import "./styles/coc-preview.css";
import "./styles/coc-rule-status.css";
import "./styles/accessibility.css";

type AppPage =
  | "home"
  | "rules"
  | "compendium"
  | "player"
  | "dm"
  | "monster"
  | "homebrew"
  | "monster-homebrew";

type DndAppProps = { onChangeSystem: () => void };

const DndApp = ({ onChangeSystem }: DndAppProps) => {
  const [activePage, setActivePage] = useState<AppPage>("home");
  const { cards: homebrewCards, storageError, createCard, deleteCard } = useHomebrewCards();
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
          <button aria-pressed={activePage === "rules"} type="button" onClick={() => setActivePage("rules")}>Rules Guide</button>
          <button aria-pressed={activePage === "compendium"} type="button" onClick={() => setActivePage("compendium")}>Compendium</button>
          <button aria-pressed={activePage === "player"} type="button" onClick={() => setActivePage("player")}>Player</button>
          <button aria-pressed={activePage === "dm"} type="button" onClick={() => setActivePage("dm")}>DM</button>
          <button aria-pressed={activePage === "monster"} type="button" onClick={() => setActivePage("monster")}>Encounter</button>
          <button aria-pressed={activePage === "homebrew"} type="button" onClick={() => setActivePage("homebrew")}>Card Builder</button>
          <button aria-pressed={activePage === "monster-homebrew"} type="button" onClick={() => setActivePage("monster-homebrew")}>Monster Builder</button>
          <button type="button" onClick={onChangeSystem}>Switch System</button>
        </div>
      </nav>

      {activePage !== "home" && <h1 className="sr-only">Dungeon Cards</h1>}

      {activePage === "home" && (
        <section className="hero compact-hero">
          <div className="hero__content">
            <p className="hero__eyebrow">Dungeon Cards Tabletop Toolkit</p>
            <h1>Choose the card. Run the encounter. Keep playing.</h1>
            <p>Rules guidance, complete licensed references, personal decks, encounters, and homebrew tools.</p>
            <div className="role-card-grid">
              <button className="role-card" type="button" onClick={() => setActivePage("rules")}>
                <span>📖</span><strong>Rules Guide</strong>
                <small>Learn the table procedure first, then open the matching card.</small>
              </button>
              <button className="role-card" type="button" onClick={() => setActivePage("compendium")}>
                <span>📚</span><strong>SRD Compendium</strong>
                <small>Search every generated SRD 5.1 and 5.2.1 spell and monster reference.</small>
              </button>
              <button className="role-card" type="button" onClick={() => setActivePage("player")}>
                <span>🧙</span><strong>Player Workspace</strong>
                <small>Keep attacks, damage, spells, checks, and saves on My Table.</small>
              </button>
              <button className="role-card" type="button" onClick={() => setActivePage("dm")}>
                <span>🎲</span><strong>DM Workspace</strong>
                <small>Prepare checks, traps, magic items, generators, and random tables.</small>
              </button>
              <button className="role-card" type="button" onClick={() => setActivePage("monster")}>
                <span>🐉</span><strong>Monster Encounter</strong>
                <small>Choose playable creatures, open ordered folios, and print references.</small>
              </button>
              <button className="role-card" type="button" onClick={() => setActivePage("homebrew")}>
                <span>🛠️</span><strong>Card Builder</strong>
                <small>Create custom dice and rules cards without changing SRD content.</small>
              </button>
              <button className="role-card" type="button" onClick={() => setActivePage("monster-homebrew")}>
                <span>🧌</span><strong>Monster Builder</strong>
                <small>Create, save, and print custom monster folios.</small>
              </button>
            </div>
          </div>
        </section>
      )}

      {activePage === "rules" && <DndRulesGuide />}
      {activePage === "compendium" && <SrdCompendium />}

      {activePage === "player" && (
        <RulesDeck
          cards={playerRuleCards}
          description="Add as many independent copies as you need, name each copy, and keep only the cards used by this character on My Table."
          eyebrow="player"
          role="player"
          title="Your personal cards, ready when initiative starts."
        />
      )}

      {activePage === "dm" && (
        <RulesDeck
          cards={dmRuleCards}
          description="Build a focused table with independent copies of checks, saves, traps, items, and generators."
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
          ) : <p className="homebrew-empty">No homebrew cards yet. Build your first card above.</p>}
        </>
      )}

      {activePage === "monster-homebrew" && (
        <MonsterHomebrewBuilder libraryError={homebrewMonsterError} onSave={createMonster} />
      )}
    </main>
  );
};

export const App = () => {
  const [gameSystem, setGameSystem] = useState<GameSystemId>();
  if (!gameSystem) return <GameSystemGateway onSelect={setGameSystem} />;
  if (gameSystem === "coc-7e") {
    return <CocPreview onChangeSystem={() => setGameSystem(undefined)} />;
  }
  return <DndApp onChangeSystem={() => setGameSystem(undefined)} />;
};
