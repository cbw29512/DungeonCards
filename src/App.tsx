import { useState } from "react";
import { CocPreview } from "./components/CocPreview";
import { DeckGrid } from "./components/DeckGrid";
import { DndArmorLoadout } from "./components/DndArmorLoadout";
import { DndConditionsLibrary } from "./components/DndConditionsLibrary";
import { DndEncounterTracker } from "./components/DndEncounterTracker";
import { DndHealthTracker } from "./components/DndHealthTracker";
import { DndMovementLibrary } from "./components/DndMovementLibrary";
import { DndPregenLibrary } from "./components/DndPregenLibrary";
import { DndRulesGuide } from "./components/DndRulesGuide";
import { DndWeaponMasteryLibrary } from "./components/DndWeaponMasteryLibrary";
import { GameSystemGateway, type GameSystemId } from "./components/GameSystemGateway";
import { HomebrewBuilder } from "./components/HomebrewBuilder";
import { MonsterDeck } from "./components/MonsterDeck";
import { MonsterHomebrewBuilder } from "./components/MonsterHomebrewBuilder";
import { RulesCoverageDashboard } from "./components/RulesCoverageDashboard";
import { RulesDeck } from "./components/RulesDeck";
import { SrdCompendium } from "./components/SrdCompendium";
import { dmRuleCards, playerRuleCards } from "./data/ruleCardCatalog";
import { useHomebrewCards } from "./hooks/useHomebrewCards";
import { useHomebrewMonsters } from "./hooks/useHomebrewMonsters";
import {
  clearSystemRoute,
  DM_FORGE_HOME,
  parseDndPage,
  parseSystem,
  replaceDndRoute,
  type DndAppPage
} from "./integration/dmForgeRoute";
import "./styles/base.css";
import "./styles/cards.css";
import "./styles/history.css";
import "./styles/homebrew.css";
import "./styles/rule-cards.css";
import "./styles/rule-controls.css";
import "./styles/rule-advantage.css";
import "./styles/rule-history.css";
import "./styles/rule-print.css";
import "./styles/rules-guide.css";
import "./styles/srd-compendium.css";
import "./styles/srd-spell-casting.css";
import "./styles/workspaces.css";
import "./styles/dnd-pregens.css";
import "./styles/monsters.css";
import "./styles/monster-combat-reference.css";
import "./styles/monster-card-flip.css";
import "./styles/srd-encounter-monsters.css";
import "./styles/monster-homebrew.css";
import "./styles/monster-print.css";
import "./styles/coc-preview.css";
import "./styles/coc-rule-status.css";
import "./styles/coc-reference-expansion.css";
import "./styles/accessibility.css";

type DndAppProps = { onChangeSystem: () => void };

const initialSearch = () => (typeof window === "undefined" ? "" : window.location.search);

const pageLabels: Record<DndAppPage, string> = {
  home: "Home",
  rules: "Rules Guide",
  coverage: "Rules Coverage",
  conditions: "Conditions & Exhaustion",
  movement: "Movement & Special Actions",
  health: "HP & Death Saves",
  combat: "Initiative & Concentration",
  mastery: "Weapon Mastery",
  armor: "Armor & Loadout",
  compendium: "SRD Compendium",
  pregens: "Premade Characters",
  player: "Player Workspace",
  dm: "DM Workspace",
  monster: "Monster Encounter",
  homebrew: "Card Builder",
  "monster-homebrew": "Monster Builder"
};

const focusMainContent = (id: string) => {
  window.requestAnimationFrame(() => {
    const target = document.getElementById(id);
    target?.focus({ preventScroll: true });
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  });
};

const DndApp = ({ onChangeSystem }: DndAppProps) => {
  const [activePage, setActivePage] = useState<DndAppPage>(() => parseDndPage(initialSearch()));
  const [navigationOpen, setNavigationOpen] = useState(false);
  const { cards: homebrewCards, storageError, createCard, deleteCard } = useHomebrewCards();
  const {
    monsters: homebrewMonsters,
    storageError: homebrewMonsterError,
    createMonster,
    deleteMonster
  } = useHomebrewMonsters();

  const navigate = (page: DndAppPage) => {
    setActivePage(page);
    setNavigationOpen(false);
    replaceDndRoute(page);
    focusMainContent("dnd-main-content");
  };

  const changeSystem = () => {
    setNavigationOpen(false);
    onChangeSystem();
  };

  return (
    <div className="application-shell application-shell--dnd">
      <a className="skip-link" href="#dnd-main-content">Skip to main content</a>
      <nav className="top-nav" aria-label="Primary navigation">
        <div className="product-lockup">
          <a className="dm-forge-return" href={DM_FORGE_HOME}>DM Forge</a>
          <span>Rules Compendium &amp; Roll Cards</span>
          <small className="top-nav__current">{pageLabels[activePage]}</small>
        </div>
        <button
          aria-controls="dnd-primary-navigation"
          aria-expanded={navigationOpen}
          aria-label={navigationOpen ? "Close navigation" : "Open navigation"}
          className="navigation-toggle"
          onClick={() => setNavigationOpen((current) => !current)}
          type="button"
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>
        <div className={`top-nav__actions${navigationOpen ? " is-open" : ""}`} id="dnd-primary-navigation">
          <button aria-pressed={activePage === "home"} type="button" onClick={() => navigate("home")}>Home</button>
          <button aria-pressed={activePage === "rules"} type="button" onClick={() => navigate("rules")}>Rules Guide</button>
          <button aria-pressed={activePage === "coverage"} type="button" onClick={() => navigate("coverage")}>Coverage</button>
          <button aria-pressed={activePage === "conditions"} type="button" onClick={() => navigate("conditions")}>Conditions</button>
          <button aria-pressed={activePage === "movement"} type="button" onClick={() => navigate("movement")}>Movement</button>
          <button aria-pressed={activePage === "health"} type="button" onClick={() => navigate("health")}>Health</button>
          <button aria-pressed={activePage === "combat"} type="button" onClick={() => navigate("combat")}>Combat</button>
          <button aria-pressed={activePage === "mastery"} type="button" onClick={() => navigate("mastery")}>Mastery</button>
          <button aria-pressed={activePage === "armor"} type="button" onClick={() => navigate("armor")}>Armor</button>
          <button aria-pressed={activePage === "compendium"} type="button" onClick={() => navigate("compendium")}>Compendium</button>
          <button aria-pressed={activePage === "pregens"} type="button" onClick={() => navigate("pregens")}>Pregens</button>
          <button aria-pressed={activePage === "player"} type="button" onClick={() => navigate("player")}>Player</button>
          <button aria-pressed={activePage === "dm"} type="button" onClick={() => navigate("dm")}>DM</button>
          <button aria-pressed={activePage === "monster"} type="button" onClick={() => navigate("monster")}>Encounter</button>
          <button aria-pressed={activePage === "homebrew"} type="button" onClick={() => navigate("homebrew")}>Card Builder</button>
          <button aria-pressed={activePage === "monster-homebrew"} type="button" onClick={() => navigate("monster-homebrew")}>Monster Builder</button>
          <button type="button" onClick={changeSystem}>Other Systems</button>
        </div>
      </nav>

      <main id="dnd-main-content" tabIndex={-1}>
        {activePage !== "home" && <h1 className="sr-only">DM Forge {pageLabels[activePage]}</h1>}

        {activePage === "home" && (
          <section className="hero compact-hero">
            <div className="hero__content">
              <p className="hero__eyebrow">DM Forge · Rules Compendium &amp; Roll Cards</p>
              <h1>Choose the card. Run the encounter. Keep playing.</h1>
              <p>Verified 5e and 5.5e references, executable roll cards, personal tables, encounter folios, and homebrew tools—all local and account-free.</p>
              <div className="role-card-grid">
                <button className="role-card" type="button" onClick={() => navigate("rules")}>
                  <span aria-hidden="true">📖</span><strong>Rules Guide</strong>
                  <small>Learn the table procedure first, then open the matching card.</small>
                </button>
                <button className="role-card" type="button" onClick={() => navigate("coverage")}>
                  <span aria-hidden="true">🧭</span><strong>Rules Coverage</strong>
                  <small>See exactly what is complete, automated, missing, or requires an owned source.</small>
                </button>
                <button className="role-card" type="button" onClick={() => navigate("conditions")}>
                  <span aria-hidden="true">⚠️</span><strong>Conditions &amp; Exhaustion</strong>
                  <small>Search every condition and track edition-specific Exhaustion without mixing rules.</small>
                </button>
                <button className="role-card" type="button" onClick={() => navigate("movement")}>
                  <span aria-hidden="true">🏃</span><strong>Movement &amp; Special Actions</strong>
                  <small>Calculate movement, jumps, cover, grapples, shoves, hiding, and Opportunity Attacks.</small>
                </button>
                <button className="role-card" type="button" onClick={() => navigate("health")}>
                  <span aria-hidden="true">❤️</span><strong>HP &amp; Death Saves</strong>
                  <small>Track damage, Temporary HP, massive damage, stabilization, Bloodied, and Death Saves.</small>
                </button>
                <button className="role-card" type="button" onClick={() => navigate("combat")}>
                  <span aria-hidden="true">⏱️</span><strong>Initiative &amp; Concentration</strong>
                  <small>Run rounds, turns, movement, reactions, surprise, and concentration checks.</small>
                </button>
                <button className="role-card" type="button" onClick={() => navigate("mastery")}>
                  <span aria-hidden="true">⚔️</span><strong>Weapon Mastery</strong>
                  <small>Run all eight 2024 mastery properties with weapon lookup, Topple DC, and turn limits.</small>
                </button>
                <button className="role-card" type="button" onClick={() => navigate("armor")}>
                  <span aria-hidden="true">🛡️</span><strong>Armor &amp; Loadout</strong>
                  <small>Calculate AC, training penalties, armor Speed, carrying limits, and 2014 encumbrance.</small>
                </button>
                <button className="role-card" type="button" onClick={() => navigate("compendium")}>
                  <span aria-hidden="true">📚</span><strong>SRD Compendium</strong>
                  <small>Search all generated SRD 5.1 and 5.2.1 spell and monster references.</small>
                </button>
                <button className="role-card" type="button" onClick={() => navigate("pregens")}>
                  <span aria-hidden="true">🧑‍🤝‍🧑</span><strong>Premade Characters</strong>
                  <small>Pick a verified ready-to-play character by class, subclass, edition, and level.</small>
                </button>
                <button className="role-card" type="button" onClick={() => navigate("player")}>
                  <span aria-hidden="true">🧙</span><strong>Player Workspace</strong>
                  <small>Keep attacks, damage, spells, checks, and saves on My Table.</small>
                </button>
                <button className="role-card" type="button" onClick={() => navigate("dm")}>
                  <span aria-hidden="true">🎲</span><strong>DM Workspace</strong>
                  <small>Prepare checks, traps, magic items, generators, and random tables.</small>
                </button>
                <button className="role-card" type="button" onClick={() => navigate("monster")}>
                  <span aria-hidden="true">🐉</span><strong>Monster Encounter</strong>
                  <small>Choose SRD creatures, open ordered folios, and print references.</small>
                </button>
                <button className="role-card" type="button" onClick={() => navigate("homebrew")}>
                  <span aria-hidden="true">🛠️</span><strong>Card Builder</strong>
                  <small>Build custom cards beside a live finished-size preview.</small>
                </button>
                <button className="role-card" type="button" onClick={() => navigate("monster-homebrew")}>
                  <span aria-hidden="true">🧌</span><strong>Monster Builder</strong>
                  <small>Create, save, and print custom monster folios.</small>
                </button>
              </div>
            </div>
          </section>
        )}

        {activePage === "rules" && <DndRulesGuide />}
        {activePage === "coverage" && <RulesCoverageDashboard />}
        {activePage === "conditions" && <DndConditionsLibrary />}
        {activePage === "movement" && <DndMovementLibrary />}
        {activePage === "health" && <DndHealthTracker />}
        {activePage === "combat" && <DndEncounterTracker />}
        {activePage === "mastery" && <DndWeaponMasteryLibrary />}
        {activePage === "armor" && <DndArmorLoadout />}
        {activePage === "compendium" && <SrdCompendium />}
        {activePage === "pregens" && <DndPregenLibrary />}

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
    </div>
  );
};

export const App = () => {
  const [gameSystem, setGameSystem] = useState<GameSystemId | undefined>(() => parseSystem(initialSearch()));

  const selectSystem = (system: GameSystemId) => {
    setGameSystem(system);
    if (system === "dnd-5e") replaceDndRoute("home");
    else if (typeof window !== "undefined") window.history.replaceState(null, "", "?system=coc");
  };

  const changeSystem = () => {
    clearSystemRoute();
    setGameSystem(undefined);
  };

  if (!gameSystem) return <GameSystemGateway onSelect={selectSystem} />;
  if (gameSystem === "coc-7e") return <CocPreview onChangeSystem={changeSystem} />;
  return <DndApp onChangeSystem={changeSystem} />;
};
