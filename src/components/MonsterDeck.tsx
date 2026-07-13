import { useMemo, useState } from "react";
import { monsterCatalog } from "../data/monsterCatalog";
import { useCardWorkspace } from "../hooks/useCardWorkspace";
import type { MonsterRuleset } from "../types/monsters";
import type { WorkspaceView } from "../types/workspaces";
import { MonsterReferenceCard } from "./MonsterReferenceCard";
import { WorkspaceToolbar } from "./WorkspaceToolbar";

const rulesetOptions: Array<MonsterRuleset | "all"> = [
  "all",
  "srd-5.1-2014",
  "srd-5.2.1-2024"
];

const rulesetText = (ruleset: MonsterRuleset | "all"): string => {
  if (ruleset === "all") return "All rulesets";
  if (ruleset === "srd-5.1-2014") return "2014 SRD";
  if (ruleset === "srd-5.2.1-2024") return "2024 SRD";
  return "Homebrew";
};

export const MonsterDeck = () => {
  const [view, setView] = useState<WorkspaceView>("table");
  const [query, setQuery] = useState("");
  const [ruleset, setRuleset] = useState<MonsterRuleset | "all">("all");
  const [type, setType] = useState("all");
  const workspace = useCardWorkspace("monster", monsterCatalog);
  const visible = view === "table" ? workspace.activeCards : monsterCatalog;
  const types = useMemo(
    () => ["all", ...new Set(monsterCatalog.map((monster) => monster.type))],
    []
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

  return (
    <section className="monster-deck" aria-labelledby="monster-deck-title">
      <div className="section-heading monster-deck__heading">
        <p>monster cards</p>
        <h2 id="monster-deck-title">Build tonight's encounter from printable monster references.</h2>
        <span>
          Simple monsters stay on one poker-size card. Bosses and spellcasters open into readable folios.
        </span>
        <WorkspaceToolbar
          activeCount={workspace.workspace.activeCardIds.length}
          onChangeView={setView}
          onReset={workspace.resetWorkspace}
          role="monster"
          storageError={workspace.storageError}
          totalCount={monsterCatalog.length}
          view={view}
        />
        <div className="monster-deck__filters">
          <input
            aria-label="Search monsters"
            onChange={(event) => setQuery(event.target.value)}
            placeholder={view === "table" ? "Search My Encounter…" : "Search Monster Library…"}
            type="search"
            value={query}
          />
          <select
            aria-label="Filter monster ruleset"
            onChange={(event) => setRuleset(event.target.value as MonsterRuleset | "all")}
            value={ruleset}
          >
            {rulesetOptions.map((option) => <option key={option} value={option}>{rulesetText(option)}</option>)}
          </select>
          <select aria-label="Filter monster type" onChange={(event) => setType(event.target.value)} value={type}>
            {types.map((option) => <option key={option} value={option}>{option === "all" ? "All creature types" : option}</option>)}
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
      ) : (
        <div className="monster-grid">
          {filtered.map((monster) => {
            const isActive = workspace.workspace.activeCardIds.includes(monster.id);
            const isPinned = workspace.workspace.pinnedCardIds.includes(monster.id);
            const tableIndex = workspace.activeCards.findIndex((item) => item.id === monster.id);
            const previous = workspace.activeCards[tableIndex - 1];
            const next = workspace.activeCards[tableIndex + 1];
            const previousMatches = previous !== undefined
              && workspace.workspace.pinnedCardIds.includes(previous.id) === isPinned;
            const nextMatches = next !== undefined
              && workspace.workspace.pinnedCardIds.includes(next.id) === isPinned;

            return (
              <MonsterReferenceCard
                key={monster.id}
                monster={monster}
                workspaceControls={{
                  view,
                  isActive,
                  isPinned,
                  canMoveEarlier: view === "table" && previousMatches,
                  canMoveLater: view === "table" && nextMatches,
                  onToggleActive: () => isActive
                    ? workspace.removeCard(monster.id)
                    : workspace.addCard(monster.id),
                  onTogglePin: () => workspace.togglePin(monster.id),
                  onMoveEarlier: () => workspace.moveCard(monster.id, "earlier"),
                  onMoveLater: () => workspace.moveCard(monster.id, "later")
                }}
              />
            );
          })}
        </div>
      )}
    </section>
  );
};