import { useMemo, useState } from "react";
import {
  createHomebrewEncounterEntry,
  encounterMonsterCatalog
} from "../data/encounterMonsterCatalog";
import { useCardWorkspace } from "../hooks/useCardWorkspace";
import { sendEncounterToDmForge } from "../integration/dmForgeEncounterHandoff";
import type { MonsterCardData } from "../types/monsters";
import type { RulesetId } from "../types/ruleCards";
import type { WorkspaceView } from "../types/workspaces";
import { gameSystemIdForRuleset } from "../utils/cardPlatformGameSystem";
import { MonsterDeckCards } from "./MonsterDeckCards";
import { MonsterDeckFilters } from "./MonsterDeckFilters";
import { WorkspaceToolbar } from "./WorkspaceToolbar";

const normalizedType = (value: string): string => (
  value.trim().replace(/\s+/g, " ").toLowerCase()
);

const editionLabel = (ruleset: RulesetId): string => (
  ruleset === "srd-5.1-2014" ? "2014 / SRD 5.1" : "2024 / SRD 5.2.1"
);

type MonsterDeckProps = {
  homebrewMonsters: MonsterCardData[];
  libraryError: string | null;
  onDeleteHomebrewMonster(monsterId: string): boolean;
};

export const MonsterDeck = ({
  homebrewMonsters,
  libraryError,
  onDeleteHomebrewMonster
}: MonsterDeckProps) => {
  const [view, setView] = useState<WorkspaceView>("table");
  const [query, setQuery] = useState("");
  const [ruleset, setRuleset] = useState<RulesetId>("srd-5.2.1-2024");
  const [type, setType] = useState("all");
  const [handoffError, setHandoffError] = useState<string | null>(null);
  const allMonsters = useMemo(() => [
    ...encounterMonsterCatalog,
    ...homebrewMonsters.map(createHomebrewEncounterEntry)
  ], [homebrewMonsters]);
  const compatibleMonsters = useMemo(() => allMonsters.filter((monster) => (
    monster.ruleset === ruleset || monster.ruleset === "homebrew"
  )), [allMonsters, ruleset]);
  const gameSystemId = gameSystemIdForRuleset(ruleset);
  const workspace = useCardWorkspace("monster", compatibleMonsters, gameSystemId);
  const visible = view === "table" ? workspace.activeCards : compatibleMonsters;
  const types = useMemo(() => [
    "all",
    ...new Set(compatibleMonsters.map((monster) => normalizedType(monster.type)).filter(Boolean))
  ], [compatibleMonsters]);
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return visible.filter((monster) => {
      const matchesQuery = !normalized
        || `${monster.name} ${monster.type} ${monster.cr}`.toLowerCase().includes(normalized);
      const matchesType = type === "all" || normalizedType(monster.type) === type;
      return matchesQuery && matchesType;
    });
  }, [query, type, visible]);

  const changeRuleset = (nextRuleset: RulesetId) => {
    setRuleset(nextRuleset);
    setType("all");
    setHandoffError(null);
  };
  const sendToDmForge = () => {
    setHandoffError(null);
    try {
      sendEncounterToDmForge(workspace.activeCards);
    } catch (error) {
      setHandoffError(error instanceof Error ? error.message : "Could not send this encounter to DM Forge.");
    }
  };

  return (
    <section className="monster-deck" aria-labelledby="monster-deck-title">
      <div className="section-heading monster-deck__heading">
        <p>monster cards · {editionLabel(ruleset)}</p>
        <h2 id="monster-deck-title">Build an edition-safe encounter from the complete SRD monster library.</h2>
        <span>
          Each edition keeps its own saved encounter. Homebrew creatures remain available in either table,
          while 2014 and 2024 SRD monsters never silently mix.
        </span>
        <WorkspaceToolbar
          activeCount={workspace.activeCards.length}
          onChangeView={setView}
          onReset={workspace.resetWorkspace}
          role="monster"
          storageError={workspace.storageError}
          totalCount={compatibleMonsters.length}
          view={view}
        />
        {view === "table" && workspace.activeCards.length > 0 && (
          <div className="dm-forge-handoff">
            <button type="button" onClick={sendToDmForge}>Send My Encounter to DM Forge</button>
            <span>Opens Encounter Forge with this exact-edition monster table ready for balancing and session use.</span>
          </div>
        )}
        {handoffError && <p className="workspace-error" role="alert">{handoffError}</p>}
        {libraryError && <p className="workspace-error" role="alert">{libraryError}</p>}
        <MonsterDeckFilters
          onQueryChange={setQuery}
          onRulesetChange={changeRuleset}
          onTypeChange={setType}
          query={query}
          ruleset={ruleset}
          type={type}
          types={types}
          view={view}
        />
      </div>

      {view === "table" && workspace.activeCards.length === 0 ? (
        <div className="workspace-empty">
          <span aria-hidden="true">🐉</span><h3>Your {editionLabel(ruleset)} encounter is empty.</h3>
          <p>Open the Monster Library and add the creatures you need tonight.</p>
          <button onClick={() => setView("library")} type="button">Open Monster Library</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="workspace-empty">
          <span aria-hidden="true">🔎</span><h3>No monsters match these filters.</h3>
          <p>Clear the search or choose a different creature type.</p>
        </div>
      ) : (
        <MonsterDeckCards
          activeCardIds={workspace.workspace.activeCardIds}
          activeEntries={workspace.activeCards}
          entries={filtered}
          onAdd={workspace.addCard}
          onDeleteHomebrew={onDeleteHomebrewMonster}
          onMove={workspace.moveCard}
          onRemove={workspace.removeCard}
          onTogglePin={workspace.togglePin}
          pinnedCardIds={workspace.workspace.pinnedCardIds}
          view={view}
        />
      )}
    </section>
  );
};
