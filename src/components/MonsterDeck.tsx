import { useMemo, useState } from "react";
import {
  createHomebrewEncounterEntry,
  encounterMonsterCatalog
} from "../data/encounterMonsterCatalog";
import { useMonsterEncounterWorkspace } from "../hooks/useMonsterEncounterWorkspace";
import { sendEncounterToDmForge } from "../integration/dmForgeEncounterHandoff";
import type { MonsterCardData } from "../types/monsters";
import type { RulesetId } from "../types/ruleCards";
import type { WorkspaceView } from "../types/workspaces";
import { gameSystemIdForRuleset } from "../utils/cardPlatformGameSystem";
import {
  filterMonsterWorkspaceEntries,
  monstersForEncounterRuleset,
  monsterTypesForWorkspace
} from "../utils/monsterWorkspaceCatalog";
import { MonsterDeckCards } from "./MonsterDeckCards";
import { MonsterDeckFilters } from "./MonsterDeckFilters";
import { WorkspaceToolbar } from "./WorkspaceToolbar";

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
  const compatibleMonsters = useMemo(
    () => monstersForEncounterRuleset(allMonsters, ruleset),
    [allMonsters, ruleset]
  );
  const workspace = useMonsterEncounterWorkspace(
    compatibleMonsters,
    gameSystemIdForRuleset(ruleset)
  );
  const types = useMemo(
    () => monsterTypesForWorkspace(compatibleMonsters),
    [compatibleMonsters]
  );
  const filteredLibraryEntries = useMemo(
    () => filterMonsterWorkspaceEntries(compatibleMonsters, query, type),
    [compatibleMonsters, query, type]
  );
  const matchingMonsterIds = useMemo(() => new Set(
    filterMonsterWorkspaceEntries(compatibleMonsters, query, type).map((entry) => entry.id)
  ), [compatibleMonsters, query, type]);
  const filteredInstances = useMemo(
    () => workspace.activeInstances.filter((instance) => matchingMonsterIds.has(instance.monsterId)),
    [matchingMonsterIds, workspace.activeInstances]
  );
  const filteredCount = view === "library" ? filteredLibraryEntries.length : filteredInstances.length;

  const changeRuleset = (nextRuleset: RulesetId) => {
    setRuleset(nextRuleset);
    setType("all");
    setHandoffError(null);
  };
  const sendToDmForge = () => {
    setHandoffError(null);
    try {
      sendEncounterToDmForge(workspace.activeEntries);
    } catch (error) {
      setHandoffError(error instanceof Error ? error.message : "Could not send this encounter to DM Forge.");
    }
  };

  return (
    <section className="monster-deck" aria-labelledby="monster-deck-title">
      <div className="section-heading monster-deck__heading">
        <p>monster encounter · {editionLabel(ruleset)}</p>
        <h2 id="monster-deck-title">Run every creature as an independent combatant.</h2>
        <span>
          Add as many copies as the encounter needs. Goblin 1 and Goblin 2 keep separate names,
          HP, initiative, conditions, reactions, recharge state, and legendary-action budgets.
          Each edition keeps its own saved encounter, and 2014 and 2024 monsters never silently mix.
        </span>
        <WorkspaceToolbar
          activeCount={workspace.activeInstances.length}
          onChangeView={setView}
          onReset={workspace.resetWorkspace}
          role="monster"
          storageError={workspace.storageError}
          totalCount={compatibleMonsters.length}
          view={view}
        />
        {view === "table" && workspace.activeInstances.length > 0 && (
          <div className="monster-encounter-toolbar" aria-label="Encounter order actions">
            <button type="button" onClick={workspace.sortByInitiative}>Sort by initiative</button>
            <span>{workspace.activeInstances.length} combatant{workspace.activeInstances.length === 1 ? "" : "s"} saved in this edition.</span>
          </div>
        )}
        {view === "table" && workspace.activeInstances.length > 0 && (
          <div className="dm-forge-handoff">
            <button type="button" onClick={sendToDmForge}>Send My Encounter to DM Forge</button>
            <span>Transfers exact-edition quantities after grouping repeated monster instances.</span>
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

      {view === "table" && workspace.activeInstances.length === 0 ? (
        <div className="workspace-empty">
          <span aria-hidden="true">🐉</span><h3>Your {editionLabel(ruleset)} encounter is empty.</h3>
          <p>Open the Monster Library and add each creature. Use “Add another” for multiple copies.</p>
          <button onClick={() => setView("library")} type="button">Open Monster Library</button>
        </div>
      ) : filteredCount === 0 ? (
        <div className="workspace-empty">
          <span aria-hidden="true">🔎</span><h3>No monsters match these filters.</h3>
          <p>Clear the search or choose a different creature type.</p>
        </div>
      ) : (
        <MonsterDeckCards
          activeInstances={filteredInstances}
          countCopies={workspace.countCopies}
          entries={filteredLibraryEntries}
          onAdd={workspace.addMonster}
          onAddCondition={workspace.addCondition}
          onDeleteHomebrew={onDeleteHomebrewMonster}
          onMove={workspace.moveInstance}
          onRemove={workspace.removeInstance}
          onRemoveCondition={workspace.removeCondition}
          onRename={workspace.renameInstance}
          onSetHitPoints={workspace.setHitPoints}
          onSetInitiative={workspace.setInitiative}
          onSetLegendaryRemaining={workspace.setLegendaryRemaining}
          onSetReaction={workspace.setReaction}
          onSetRecharge={workspace.setRecharge}
          onStartTurn={workspace.startTurn}
          onTogglePin={workspace.togglePin}
          view={view}
        />
      )}
    </section>
  );
};