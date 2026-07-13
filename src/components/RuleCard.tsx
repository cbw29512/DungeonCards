import type { RuleCard as RuleCardType, RuleRollHistoryEntry } from "../types/ruleCards";
import { useRuleCardState } from "../hooks/useRuleCardState";
import { RuleCardBack } from "./RuleCardBack";
import { RuleCardFront } from "./RuleCardFront";

type RuleCardProps = {
  card: RuleCardType;
  onRoll: (entry: RuleRollHistoryEntry) => void;
};

export const RuleCard = ({ card, onRoll }: RuleCardProps) => {
  const controller = useRuleCardState({ card, onRoll });

  return (
    <article className={`rule-card ${controller.isFlipped ? "is-flipped" : ""}`}>
      <div className="rule-card__inner">
        <RuleCardFront card={card} controller={controller} />
        <RuleCardBack card={card} controller={controller} />
      </div>
    </article>
  );
};