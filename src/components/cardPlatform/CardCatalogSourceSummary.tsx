import type { CardCatalog, CardCatalogSourceId } from "../../types/cardCatalog";

export type CardCatalogSourceAction = {
  sourceId: CardCatalogSourceId;
  label: string;
  onOpen?: () => void;
};

export const CardCatalogSourceSummary = ({
  catalog,
  actions
}: {
  catalog: CardCatalog;
  actions: CardCatalogSourceAction[];
}) => (
  <section className="card-catalog__sources" aria-labelledby="card-catalog-source-title">
    <header>
      <div><small>Source groups</small><h2 id="card-catalog-source-title">Validated catalog inputs</h2></div>
      <span>{catalog.entries.length} accepted definitions</span>
    </header>
    <div className="card-catalog__source-grid">
      {actions.map((action) => {
        const count = catalog.sourceCounts[action.sourceId] ?? 0;
        const content = <><strong>{action.label}</strong><span>{count} cards</span></>;
        return action.onOpen ? (
          <button key={action.sourceId} onClick={action.onOpen} type="button">{content}<small>Open workspace</small></button>
        ) : (
          <article key={action.sourceId}>{content}</article>
        );
      })}
    </div>
    {catalog.issues.length > 0 && (
      <details className="card-catalog__health">
        <summary>{catalog.issues.length} source-health warning{catalog.issues.length === 1 ? "" : "s"}</summary>
        <p>Invalid or conflicting definitions were excluded without stopping the rest of the catalog.</p>
        <ul>{catalog.issues.slice(0, 50).map((issue, index) => <li key={`${issue.sourceId}-${index}`}><strong>{issue.sourceId}</strong>: {issue.message}</li>)}</ul>
        {catalog.issues.length > 50 && <p>Showing the first 50 warnings.</p>}
      </details>
    )}
  </section>
);
