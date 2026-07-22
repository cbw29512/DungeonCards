import { useMemo, useState } from "react";
import {
  createHomebrewEncounterEntry,
  encounterMonsterCatalog
} from "../data/encounterMonsterCatalog";
import { sendEncounterToDmForge } from "../integration/dmForgeEncounterHandoff";
import { useCardWorkspace } from "../hooks/useCardWorkspace";
import type { MonsterCardData, MonsterRuleset } from "../types/monsters";
import type { WorkspaceView } from "../types/workspaces";
import { MonsterReferenceCard } from "./MonsterReferenceCard";
import { SrdMonsterEncounterCard } from "./SrdMonsterEncounterCard";
import { WorkspaceToolbar } from "./WorkspaceToolbar";

const rulesetOptions: Array<MonsterRuleset | "all"> = [
  "all",
  "srd-5.1-2014",
  "srd-5.2.1-2024",
  "homebrew"
];

const rulesetText = (ruleset: MonsterRuleset | "all"): string => {
  if (ruleset === "all") return "All rulesets";
  if (ruleset === "srd-5.1-2014") return "2014 SRD";
  if (ruleset === "srd-5.2.1-2024") return "2024 SRD";
  return "Homebrew";
};

type MonsterDeckProps = {
  homebrewMonsters: MonsterCardData[];
  libraryError: string | null;
  onDeleteHomebrewMonster: (monsterId: string) => boolean;
};

export const MonsterDeck = ({
  homebrewMonsters,
  libraryError,
  onDeleteHomebrewMonster
}: MonsterDeckProps) => {
  const [view, setView] = useState<WorkspaceView>("table");
  const [query, setQuery] = useState("");
  const [ruleset, setRuleset] = useState<MonsterRuleset | "all">("all");
  const [type, setType] = useState("all");
  const [handoffError, setHandoffError] = useState<string | null>(null);
  const monsters = useMemo(
    () => [
      ...encounterMonsterCatalog,
      ...homebrewMonsters.map(createHomebrewEncounterEntry)
    ],
    [homebrewMonsters]
  );
  const workspace = useCardWorkspace("monster", monsters);
  const visible = view === "table" ? workspace.activeCards : monsters;
  const types = useMemo(
    () => ["all", ...new Set(monsters.map((monster) => monster.type))],
    [monsters]
  );
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return visible.filter((monster) => {
      const matchesQuery = !normalized
        || `${monster.name} ${monster.type} ${monster.cr}`.toLowerCase().includes(normalized);
      const matchesRuleset = ruleset === "all" || monster.ruleset === ruleset;
      const matchesType = type === "all" || monster.type === type;
      return matchesQuery && matchesRuleset && matchesType;
    });
  }, [query, ruleset, type, visible]);

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
        <p>monster cards</p>
        <h2 id="monster-deck-title">Build tonight's encounter from the complete SRD monster library.</h2>
        <span>
          All 642 licensed SRD monsters are available. Three have fully formatted combat cards;
          the remaining records open as ordered, equal-size six-card reference folios.
        </span>
        <WorkspaceToolbar
          activeCount={workspace.workspace.activeCardIds.length}
          onChangeView={setView}
          onReset={workspace.resetWorkspace}
          role="monster"
          storageError={workspace.storageError}
          totalCount={monsters.length}
          view={view}
        />
        {view === "table" && workspace.activeCards.length > 0 && (
          <div className="dm-forge-handoff">
            <button type="button" onClick={sendToDmForge}>Send My Encounter to DM Forge</button>
            <span>Opens Encounter Forge with these monsters ready for party balancing, quantities, saving, printing, and Session Console launch.</span>
          </div>
        )}
        {handoffError && <p className="workspace-error" role="alert">{handoffError}</p>}
        {libraryError && <p className="workspace-error" role="alert">{libraryError}</p>}
        <div className="monster-deck__filters">
          <input
            aria-label="Search monsters"
            onChange={(event) => setQuery(event.target.value)}
            placeholder={view === "table" ? "Search My Encounter…" : "Search all SRD monsters…"}
            type="search"
            value={query}
          />
          <select
            aria-label="Filter monster ruleset"
            onChange={(event) => setRuleset(event.target.value as MonsterRuleset | "all")}
            value={ruleset}
          >
            {rulesetOptions.map((option) => (
              <option key={option} value={option}>{rulesetText(option)}</option>
            ))}
          </select>
          <select
            aria-label="Filter monster type"
            onChange={(event) => setType(event.target.value)}
            value={type}
          >
            {types.map((option) => (
              <option key={option} value={option}>
                {option === "all" ? "All creature types" : option}
              </option>
            ))}
          </select>
        </div>
      </div>

      {view === "table" && workspace.activeCards.length === 0 ? (
        <div className="workspace-empty">
          <span aria-hidden="true">🐉</span>
          <h3>Your encounter is empty.</h3>
          <p>Open the Monster Library and add the creatures you need tonight.</p>
          <button onClick={() => setView("library")} type="button">Open Monster Library</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="workspace-empty">
          <span aria-hidden="true">🔎</span>
          <h3>No monsters match these filters.</h3>
          <p>Clear the search or choose a different ruleset or creature type.</p>
        </div>
      ) : (
        <div className="monster-grid">
          {filtered.map((entry) => {
            const isActive = workspace.workspace.activeCardIds.includes(entry.id);
            const isPinned = workspace.workspace.pinnedCardIds.includes(entry.id);
            const tableIndex = workspace.activeCards.findIndex((item) => item.id === entry.id);
            const previous = workspace.activeCards[tableIndex - 1];
            const next = workspace.activeCards[tableIndex + 1];
            const previousMatches = previous !== undefined
              && workspace.workspace.pinnedCardIds.includes(previous.id) === isPinned;
            const nextMatches = next !== undefined
              && workspace.workspace.pinnedCardIds.includes(next.id) === isPinned;
            const workspaceControls = {
              view,
              isActive,
              isPinned,
              canMoveEarlier: view === "table" && previousMatches,
              canMoveLater: view === "table" && nextMatches,
              onToggleActive: () => isActive
                ? workspace.removeCard(entry.id)
                : workspace.addCard(entry.id),
              onTogglePin: () => workspace.togglePin(entry.id),
              onMoveEarlier: () => workspace.moveCard(entry.id, "earlier" as const),
              onMoveLater: () => workspace.moveCard(entry.id, "later" as const)
            };

            if (entry.kind === "reference") {
              return (
                <SrdMonsterEncounterCard
                  key={entry.id}
                  monster={entry.monster}
                  workspaceControls={workspaceControls}
                />
              );
            }

            return (
              <MonsterReferenceCard
                key={entry.id}
                monster={entry.monster}
                onDelete={view === "library" && entry.ruleset === "homebrew"
                  ? () => onDeleteHomebrewMonster(entry.id)
                  : undefined}
                workspaceControls={workspaceControls}
              />
            );
          })}
        </div>
      )}
    </section>
  );
};
