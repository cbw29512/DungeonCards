import { cocRuleVerificationLabels, getCocRuleSource } from "../data/cocRuleSources";

type CocRuleStatusProps = {
  sourceId: string;
};

export const CocRuleStatus = ({ sourceId }: CocRuleStatusProps) => {
  const source = getCocRuleSource(sourceId);

  return (
    <details className={`coc-rule-status coc-rule-status--${source.status}`}>
      <summary>
        <span aria-hidden="true">●</span>
        {cocRuleVerificationLabels[source.status]}
      </summary>
      <div>
        <strong>{source.ruleName}</strong>
        <span>{source.sourceTitle}</span>
        <small>{source.chapterOrSection}{source.page ? ` · p. ${source.page}` : " · web section or page review pending"}</small>
        <p>{source.implementationSummary}</p>
        {source.primaryReviewer && <small>Primary review: {source.primaryReviewer}</small>}
        <a href={source.sourceUrl} target="_blank" rel="noreferrer">Open source record</a>
        {source.notes.length > 0 && (
          <ul>{source.notes.map((note) => <li key={note}>{note}</li>)}</ul>
        )}
      </div>
    </details>
  );
};