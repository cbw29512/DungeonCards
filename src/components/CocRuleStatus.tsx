import { cocRuleVerificationLabels, getCocRuleSource } from "../data/cocRuleSources";
import type { CocRuleSourceRecord } from "../types/coc";

type CocRuleStatusProps = {
  sourceId?: string;
  source?: CocRuleSourceRecord;
};

export const CocRuleStatus = ({ sourceId, source: suppliedSource }: CocRuleStatusProps) => {
  const source = suppliedSource ?? (sourceId ? getCocRuleSource(sourceId) : undefined);
  if (!source) throw new Error("CocRuleStatus requires a source record or source ID.");

  const location = source.page
    ? `p. ${source.page}`
    : source.status === "prototype"
      ? "project demonstration record"
      : "official web section";

  return (
    <details className={`coc-rule-status coc-rule-status--${source.status}`}>
      <summary>
        <span aria-hidden="true">●</span>
        {cocRuleVerificationLabels[source.status]}
      </summary>
      <div>
        <strong>{source.ruleName}</strong>
        <span>{source.sourceTitle}</span>
        <small>{source.chapterOrSection} · {location}</small>
        <p>{source.implementationSummary}</p>
        {source.primaryReviewer && <small>Rules audit: {source.primaryReviewer}</small>}
        {source.independentReviewer && <small>Independent review: {source.independentReviewer}</small>}
        {source.verifiedAt && <small>Verified: {source.verifiedAt}</small>}
        <a href={source.sourceUrl} target="_blank" rel="noreferrer">Open source record</a>
        {source.notes.length > 0 && (
          <ul>{source.notes.map((note) => <li key={note}>{note}</li>)}</ul>
        )}
      </div>
    </details>
  );
};
