import { useEffect, useMemo, useState } from "react";
import type { CardCatalog, CardCatalogFilters } from "../../types/cardCatalog";
import type { CardDefinition } from "../../types/cardPlatform";
import {
  cardCatalogFilterOptions,
  EMPTY_CARD_CATALOG_FILTERS,
  filterCardCatalogEntries,
  paginateCardCatalogEntries
} from "../../utils/cardCatalogQuery";
import { printCardSurface } from "../../utils/printCardSurface";
import { CardCatalogControls } from "./CardCatalogControls";
import { CardCatalogItem } from "./CardCatalogItem";
import { CardCatalogSourceSummary, type CardCatalogSourceAction } from "./CardCatalogSourceSummary";

const systemLabel = (system: CardCatalog["gameSystemId"]): string => {
  if (system === "dnd-2014") return "D&D 2014";
  if (system === "dnd-2024") return "D&D 2024";
  return "Call of Cthulhu 7e";
};

export const CardCatalogWorkspace = ({
  catalog,
  sourceActions,
  activeDeckName,
  onAddCard
}: {
  catalog: CardCatalog;
  sourceActions: CardCatalogSourceAction[];
  activeDeckName?: string;
  onAddCard?(definition: CardDefinition): void;
}) => {
  const [filters, setFilters] = useState<CardCatalogFilters>(EMPTY_CARD_CATALOG_FILTERS);
  const [page, setPage] = useState(1);
  useEffect(() => {
    setFilters(EMPTY_CARD_CATALOG_FILTERS);
    setPage(1);
  }, [catalog.gameSystemId]);
  const options = useMemo(() => cardCatalogFilterOptions(catalog.entries), [catalog.entries]);
  const filtered = useMemo(() => filterCardCatalogEntries(catalog.entries, filters), [catalog.entries, filters]);
  const paginated = useMemo(() => paginateCardCatalogEntries(filtered, page), [filtered, page]);
  const sourceLabels = useMemo(() => Object.fromEntries(sourceActions.map((action) => [action.sourceId, action.label])), [sourceActions]);
  const updateFilters = (next: CardCatalogFilters) => { setFilters(next); setPage(1); };
  return (
    <section className="card-catalog" aria-labelledby="card-catalog-title">
      <header className="card-catalog__header">
        <div><small>{systemLabel(catalog.gameSystemId)} · exact-system Card Platform v2</small><h1 id="card-catalog-title">Card Catalog</h1><p>Search built-in and private cards together, then add independent runtime copies to the active deck.</p></div>
        <button onClick={() => printCardSurface("card-catalog")} type="button">Print current page</button>
      </header>
      <CardCatalogSourceSummary actions={sourceActions} catalog={catalog} />
      <CardCatalogControls families={options.families} filters={filters} onChange={updateFilters} reviews={options.reviews} sourceLabels={sourceLabels} sources={options.sources} />
      <div className="card-catalog__family-counts" aria-label="Card counts by family">{Object.entries(catalog.familyCounts).map(([family, count]) => <span key={family}>{family.replaceAll("-", " ")} <strong>{count}</strong></span>)}</div>
      <div className="card-catalog__result" aria-live="polite"><span>Showing {paginated.entries.length} of {paginated.total} matching cards.</span><span>{activeDeckName ? `Active deck: ${activeDeckName}.` : "Create a playable deck to add cards."}</span><span>Page {paginated.page} of {paginated.pageCount}</span></div>
      {paginated.entries.length === 0 ? <p className="card-catalog__empty">No cards match the current search and filters.</p> : (
        <div className="card-platform-grid card-catalog__grid">{paginated.entries.map((entry) => <CardCatalogItem activeDeckName={activeDeckName} entry={entry} key={entry.definition.id} onAddCard={onAddCard} />)}</div>
      )}
      <nav className="card-catalog__pagination" aria-label="Catalog pages">
        <button disabled={paginated.page <= 1} onClick={() => setPage(1)} type="button">First</button>
        <button disabled={paginated.page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))} type="button">Previous</button>
        <span>Page {paginated.page} of {paginated.pageCount}</span>
        <button disabled={paginated.page >= paginated.pageCount} onClick={() => setPage((current) => Math.min(paginated.pageCount, current + 1))} type="button">Next</button>
        <button disabled={paginated.page >= paginated.pageCount} onClick={() => setPage(paginated.pageCount)} type="button">Last</button>
      </nav>
    </section>
  );
};
