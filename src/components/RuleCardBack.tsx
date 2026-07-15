import type { KeyboardEvent } from "react";
import type { RuleCard } from "../types/ruleCards";
import type { useRuleCardState } from "../hooks/useRuleCardState";
import { formatRollBreakdown } from "../utils/formatRollResult";
import { getAttackRollImpact } from "../utils/ruleRollImpact";

type RuleCardController = ReturnType<typeof useRuleCardState>;

type RuleCardBackProps = {
  card: RuleCard;
  controller: RuleCardController;
};

export const RuleCardBack = ({ card, controller }: RuleCardBackProps) => {
  const { result, formula, mode, roll, setIsFlipped } = controller;
  const impact = getAttackRollImpact(result);
  const outcome = impact?.title ?? mode.label;
  const impactClass = impact
    ? ` rule-card__back--${impact.kind}`
    : "";

  const handleReroll = () => {
    try {
      roll();
    } catch (error) {
      console.error("Rule card reroll failed", { cardId: card.id, error });
    }
  };

  const handleRerollKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    try {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }

      event.preventDefault();
      handleReroll();
    } catch (error) {
      console.error("Rule card keyboard reroll failed", { cardId: card.id, error });
    }
  };

  const handleChange = () => {
    try {
      setIsFlipped(false);
    } catch (error) {
      console.error("Rule card settings reopen failed", { cardId: card.id, error });
    }
  };

  return (
    <section
      className={`rule-card__face rule-card__back${impactClass}`}
      aria-hidden={!controller.isFlipped}
    >
      <div
        aria-label={`Roll ${card.name} again`}
        className="rule-card__reroll-surface"
        onClick={handleReroll}
        onKeyDown={handleRerollKeyDown}
        role="button"
        tabIndex={controller.isFlipped ? 0 : -1}
      >
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
          {impact && <em className="rule-result__impact-label">{impact.subtitle}</em>}
          {result?.tableResult && <blockquote>{result.tableResult}</blockquote>}
        </div>

        {result?.secondary && (
          <div className="rule-result rule-result--secondary">
            <small>Potential {result.secondary.label}</small>
            <strong>{result.secondary.result.total}</strong>
            <span>{result.secondary.formula}</span>
            <p>{formatRollBreakdown(result.secondary.result)}</p>
            <em>Apply this damage only if the attack hits.</em>
            {result.secondary.tableResult && <blockquote>{result.secondary.tableResult}</blockquote>}
          </div>
        )}
      </div>

      <div className="rule-card__back-actions">
        <button onClick={handleChange} type="button">Change</button>
        <span className="rule-card__reroll-hint">Click the card to roll again</span>
      </div>
    </section>
  );
};
