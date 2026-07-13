import { useMemo, useState } from "react";
import { useCardWorkspace } from "../hooks/useCardWorkspace";
import type { RuleCard as RuleCardType, RuleRollHistoryEntry } from "../types/ruleCards";
import type { WorkspaceRole, WorkspaceView } from "../types/workspaces";
import { RuleCard } from "./RuleCard";
import { RuleRollHistory } from "./RuleRollHistory";
import { WorkspaceToolbar } from "./WorkspaceToolbar";

type RulesDeckProps = {
  cards: RuleCardType[];
  role: WorkspaceRole;
  eyebrow: string;
  title: string;
  description: string;
};

export const RulesDeck = ({ cards, role, eyebrow, title, description }: RulesDeckProps) => {
  const [query, setQuery] = useState("");
  const [view, setView] = useState<WorkspaceView>("table");
  const [history, setHistory] = useState<RuleRollHistoryEntry[]>([]);
  const workspace = useCardWorkspace(role, cards);
  const visibleCards = view === "table" ? workspace.activeCards : cards;
  const filteredCards = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) return visibleCards;
    return visibleCards.filter((card) =>
      `${card.name} ${card.kind}`.toLowerCase().includes(normalized)
    );
  }, [query, visibleCards]);

  const addHistory = (entry: RuleRollHistoryEntry) => {
    setHistory((current) => [entry, ...current].slice(0, 30));
  };

  return (
    <section className="rules-deck" aria-labelledby={`${eyebrow}-rules-title`}>
      <div className="section-heading rules-deck__heading">
        <p>{eyebrow}</p>
        <h2 id={`${eyebrow}-rules-title`}>{title}</h2>
        <span>{description}</span>
        <WorkspaceToolbar
          activeCount={workspace.workspace.activeCardIds.length}
          onChangeView={setView}
          onReset={workspace.resetWorkspace}
          role={role}
          storageError={workspace.storageError}
          totalCount={cards.length}
          view={view}
        />
        <label className="rules-deck__search">
          <span className="sr-only">Search cards</span>
          <input
            onChange={(event) => setQuery(event.target.value)}
            placeholder={view === "table" ? "Search My Table…" : "Search the full Library…"}
            type="search"
            value={query}
          />
        </label>
      </div>

      <div className="rules-deck__layout">
        <div>
          {view === "table" && workspace.activeCards.length === 0 ? (
            <div className="workspace-empty">
              <span aria-hidden="true">🃏</span>
              <h3>Your table is empty.</h3>
              <p>Open the Library and add the cards you want ready during play.</p>
              <button onClick={() => setView("library")} type="button">Open Library</button>
            </div>
          ) : (
            <div className="rules-card-grid">
              {filteredCards.map((card) => {
                const isActive = workspace.workspace.activeCardIds.includes(card.id);
                const isPinned = workspace.workspace.pinnedCardIds.includes(card.id);
                const tableIndex = workspace.activeCards.findIndex((item) => item.id === card.id);
                const previous = workspace.activeCards[tableIndex - 1];
                const next = workspace.activeCards[tableIndex + 1];

                return (
                  <RuleCard
                    card={card}
                    key={card.id}
                    onRoll={addHistory}
                    workspaceControls={{
                      view,
                      isActive,
                      isPinned,
                      canMoveEarlier: view === "table" && Boolean(previous)
                        && workspace.workspace.pinnedCardIds.includes(previous.id) === isPinned,
                      canMoveLater: view === "table" && Boolean(next)
                        && workspace.workspace.pinnedCardIds.includes(next.id) === isPinned,
                      onToggleActive: () => isActive
                        ? workspace.removeCard(card.id)
                        : workspace.addCard(card.id),
                      onTogglePin: () => workspace.togglePin(card.id),
                      onMoveEarlier: () => workspace.moveCard(card.id, "earlier"),
                      onMoveLater: () => workspace.moveCard(card.id, "later")
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>
        <RuleRollHistory entries={history} onClear={() => setHistory([])} />
      </div>
    </section>
  );
};