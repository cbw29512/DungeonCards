import { useMemo, useState } from "react";
import { useRuleCardWorkspace } from "../hooks/useRuleCardWorkspace";
import { useRuleRollHistory } from "../hooks/useRuleRollHistory";
import type {
  RuleCard as RuleCardType,
  RulesetId
} from "../types/ruleCards";
import type { RuleCardWorkspaceRole } from "../types/ruleCardWorkspaces";
import type { WorkspaceView } from "../types/workspaces";
import { RuleCard } from "./RuleCard";
import { RuleRollHistory } from "./RuleRollHistory";
import { WorkspaceToolbar } from "./WorkspaceToolbar";

type RulesDeckProps = {
  cards: RuleCardType[];
  role: RuleCardWorkspaceRole;
  eyebrow: string;
  title: string;
  description: string;
};

const rulesetsFor = (card: RuleCardType): RulesetId[] => Object.keys(card.variants) as RulesetId[];

export const RulesDeck = ({ cards, role, eyebrow, title, description }: RulesDeckProps) => {
  const [query, setQuery] = useState("");
  const [view, setView] = useState<WorkspaceView>("table");
  const history = useRuleRollHistory(role);
  const workspace = useRuleCardWorkspace(role, cards);
  const normalizedQuery = query.trim().toLowerCase();

  const tableCards = useMemo(() => workspace.activeCards.filter((entry) => {
    const text = `${entry.label ?? ""} ${entry.card.name} ${entry.card.kind}`.toLowerCase();
    return !normalizedQuery || text.includes(normalizedQuery);
  }), [normalizedQuery, workspace.activeCards]);
  const libraryCards = useMemo(() => cards.filter((card) =>
    !normalizedQuery || `${card.name} ${card.kind}`.toLowerCase().includes(normalizedQuery)
  ), [cards, normalizedQuery]);
  const renameCard = (instanceId: string, currentName: string) => {
    try {
      const label = window.prompt("Give this card copy its own name:", currentName);
      if (label !== null) workspace.renameCard(instanceId, label);
    } catch (error) {
      console.error("Renaming an individual card instance failed", { instanceId, error });
    }
  };

  return (
    <section className="rules-deck" aria-labelledby={`${eyebrow}-rules-title`}>
      <div className="section-heading rules-deck__heading">
        <p>{eyebrow}</p><h2 id={`${eyebrow}-rules-title`}>{title}</h2><span>{description}</span>
        <WorkspaceToolbar activeCount={workspace.workspace.instances.length} onChangeView={setView} onReset={workspace.resetWorkspace} role={role} storageError={workspace.storageError} totalCount={cards.length} view={view} />
        {history.storageError && <p className="workspace-error" role="alert">{history.storageError}</p>}
        <label className="rules-deck__search">
          <span className="sr-only">Search cards</span>
          <input onChange={(event) => setQuery(event.target.value)} placeholder={view === "table" ? "Search My Table…" : "Search the full Library…"} type="search" value={query} />
        </label>
      </div>

      <div className="rules-deck__layout">
        <div>
          {view === "table" && workspace.activeCards.length === 0 ? (
            <div className="workspace-empty">
              <span aria-hidden="true">🃏</span><h3>Your table is empty.</h3>
              <p>Open the Library and add the cards you want ready during play.</p>
              <button onClick={() => setView("library")} type="button">Open Library</button>
            </div>
          ) : (
            <div className="rules-card-grid">
              {view === "table"
                ? tableCards.map((entry) => {
                    const displayName = entry.label || entry.card.name;
                    const displayCard = entry.label ? { ...entry.card, name: entry.label } : entry.card;
                    const activeIndex = workspace.activeCards.findIndex((item) => item.instanceId === entry.instanceId);
                    const previous = workspace.activeCards[activeIndex - 1];
                    const next = workspace.activeCards[activeIndex + 1];
                    return (
                      <RuleCard
                        card={displayCard}
                        initialRuleset={entry.ruleset}
                        key={entry.instanceId}
                        onRoll={history.addEntry}
                        onRulesetChange={(ruleset) => workspace.changeRuleset(entry.instanceId, ruleset)}
                        workspaceControls={{
                          view, isActive: true, isPinned: entry.pinned,
                          canMoveEarlier: Boolean(previous && previous.pinned === entry.pinned),
                          canMoveLater: Boolean(next && next.pinned === entry.pinned),
                          onRename: () => renameCard(entry.instanceId, displayName),
                          onToggleActive: () => workspace.removeCard(entry.instanceId),
                          onTogglePin: () => workspace.togglePin(entry.instanceId),
                          onMoveEarlier: () => workspace.moveCard(entry.instanceId, "earlier"),
                          onMoveLater: () => workspace.moveCard(entry.instanceId, "later")
                        }}
                      />
                    );
                  })
                : libraryCards.map((card) => {
                    const copyCount = workspace.countCopies(card.id);
                    const defaultRuleset = rulesetsFor(card)[0];
                    return (
                      <RuleCard
                        card={card}
                        initialRuleset={defaultRuleset}
                        key={`library-${card.id}`}
                        onRoll={history.addEntry}
                        workspaceControls={{
                          view, isActive: copyCount > 0, isPinned: false,
                          canMoveEarlier: false, canMoveLater: false, allowDuplicates: true, copyCount,
                          onToggleActive: (ruleset) => workspace.addCard(card.id, ruleset ?? defaultRuleset),
                          onTogglePin: () => undefined, onMoveEarlier: () => undefined, onMoveLater: () => undefined
                        }}
                      />
                    );
                  })}
            </div>
          )}
        </div>
        <RuleRollHistory entries={history.entries} onClear={() => history.clear()} />
      </div>
    </section>
  );
};
