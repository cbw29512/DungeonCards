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
        <small>{source.chapterOrSection}{source.page ? ` · p. ${source.page}` : " · page review pending"}</small>
        <p>{source.implementationSummary}</p>
        {source.notes.length > 0 && (
          <ul>{source.notes.map((note) => <li key={note}>{note}</li>)}</ul>
        )}
      </div>
    </details>
  );
};