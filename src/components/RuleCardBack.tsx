import type { RuleCard } from "../types/ruleCards";
import type { useRuleCardState } from "../hooks/useRuleCardState";
import { formatRollBreakdown } from "../utils/formatRollResult";

type RuleCardController = ReturnType<typeof useRuleCardState>;

type RuleCardBackProps = {
  card: RuleCard;
  controller: RuleCardController;
};

export const RuleCardBack = ({ card, controller }: RuleCardBackProps) => {
  const { result, formula, mode, roll, setIsFlipped } = controller;
  const outcome = result?.isCritical
    ? "Natural 20"
    : result?.isFailure
      ? "Natural 1"
      : mode.label;

  return (
    <section className="rule-card__face rule-card__back" aria-hidden={!controller.isFlipped}>
      <header>
        <span aria-hidden="true">{card.imageEmoji}</span>
        <div>
          <small>{outcome}</small>
          <h3>{card.name}</h3>
        </div>
      </header>

      <div className="rule-result" aria-live="polite">
        <strong>{result?.total ?? "—"}</strong>
        <span>{formula}</span>
        <p>{formatRollBreakdown(result)}</p>
        {result?.tableResult && <blockquote>{result.tableResult}</blockquote>}
      </div>

      <div className="rule-card__back-actions">
        <button onClick={() => setIsFlipped(false)} type="button">Change</button>
        <button className="rule-card__roll" onClick={roll} type="button">Roll again</button>
      </div>
    </section>
  );
};