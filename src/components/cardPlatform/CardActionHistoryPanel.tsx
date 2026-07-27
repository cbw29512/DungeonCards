import { useEffect, useMemo, useState } from "react";
import type { CardActionHistoryEnvelope } from "../../types/cardActionExecution";
import type { CardDeckLibraryEnvelope } from "../../types/cardDeckLibrary";
import {
  EMPTY_CARD_ACTION_HISTORY_FILTERS,
  filterCardActionHistory,
  paginateCardActionHistory,
  type CardActionHistoryFilters
} from "../../utils/cardActionHistoryFilters";

export const CardActionHistoryPanel = ({
  history,
  library,
  error,
  onClear
}: {
  history: CardActionHistoryEnvelope;
  library: CardDeckLibraryEnvelope;
  error?: string | null;
  onClear(): void;
}) => {
  const [filters, setFilters] = useState<CardActionHistoryFilters>(EMPTY_CARD_ACTION_HISTORY_FILTERS);
  const [page, setPage] = useState(1);
  useEffect(() => { setFilters(EMPTY_CARD_ACTION_HISTORY_FILTERS); setPage(1); }, [history.gameSystemId]);
  const filtered = useMemo(() => filterCardActionHistory(history.entries, filters), [filters, history.entries]);
  const paginated = useMemo(() => paginateCardActionHistory(filtered, page), [filtered, page]);
  const deckNames = useMemo(() => new Map(library.decks.map((deck) => [deck.id, deck.name])), [library.decks]);
  const instanceNames = useMemo(() => new Map(library.instances.map((instance) => {
    const definition = library.definitions.find((card) => card.id === instance.definitionId);
    return [instance.id, instance.customName || definition?.content.title || instance.definitionId];
  })), [library.definitions, library.instances]);
  const decks = [...new Set(history.entries.map((entry) => entry.deckId))];
  const instances = [...new Set(history.entries.map((entry) => entry.cardInstanceId))];
  const patch = <K extends keyof CardActionHistoryFilters>(key: K, value: CardActionHistoryFilters[K]) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  };
  return (
    <section className="card-action-history" aria-labelledby="card-action-history-title">
      <header><div><small>{history.gameSystemId} · newest first</small><h2 id="card-action-history-title">Action History</h2></div><button disabled={history.entries.length === 0} onClick={() => window.confirm("Clear this exact-system action history?") && onClear()} type="button">Clear history</button></header>
      {error && <p className="card-action-history__warning" role="alert">{error}</p>}
      <div className="card-action-history__filters">
        <label>Search<input onChange={(event) => patch("query", event.target.value)} placeholder="Action, result, formula…" type="search" value={filters.query} /></label>
        <label>Deck<select onChange={(event) => patch("deckId", event.target.value)} value={filters.deckId}><option value="all">All decks</option>{decks.map((id) => <option key={id} value={id}>{deckNames.get(id) ?? id}</option>)}</select></label>
        <label>Card<select onChange={(event) => patch("cardInstanceId", event.target.value)} value={filters.cardInstanceId}><option value="all">All cards</option>{instances.map((id) => <option key={id} value={id}>{instanceNames.get(id) ?? id}</option>)}</select></label>
        <label>Kind<select onChange={(event) => patch("actionKind", event.target.value as CardActionHistoryFilters["actionKind"])} value={filters.actionKind}><option value="all">All actions</option><option value="roll">Rolls</option><option value="procedure">Procedures</option><option value="link">Links</option></select></label>
      </div>
      <p className="card-action-history__result" aria-live="polite">Showing {paginated.entries.length} of {paginated.total} matching entries · page {paginated.page} of {paginated.pageCount}.</p>
      {paginated.entries.length === 0 ? <p>No action history matches these filters.</p> : (
        <ol className="card-action-history__entries">{paginated.entries.map((entry) => (
          <li key={entry.id}>
            <header><div><small>{entry.actionKind} · {deckNames.get(entry.deckId) ?? entry.deckId}</small><strong>{entry.label}</strong></div><time dateTime={entry.executedAt}>{new Date(entry.executedAt).toLocaleString()}</time></header>
            <p>{entry.summary}</p>
            {entry.roll && <p><code>{entry.roll.formula ?? `${entry.roll.percentileRoll ?? "—"}%`}</code>{entry.roll.successLevel ? ` · ${entry.roll.successLevel}` : ""}</p>}
            {entry.resourceChanges.length > 0 && <p>{entry.resourceChanges.map((change) => `${change.resourceId}: ${change.before}→${change.after}`).join(" · ")}</p>}
          </li>
        ))}</ol>
      )}
      <nav className="card-action-history__pagination" aria-label="Action history pages"><button disabled={paginated.page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))} type="button">Previous</button><span>Page {paginated.page} of {paginated.pageCount}</span><button disabled={paginated.page >= paginated.pageCount} onClick={() => setPage((current) => Math.min(paginated.pageCount, current + 1))} type="button">Next</button></nav>
    </section>
  );
};
