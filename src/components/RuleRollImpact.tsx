import { createPortal } from "react-dom";
import type { AttackRollImpact } from "../utils/ruleRollImpact";

type RuleRollImpactProps = {
  impact: AttackRollImpact;
};

export const RuleRollImpact = ({ impact }: RuleRollImpactProps) => {
  const screenImpact = (
    <div
      aria-hidden="true"
      className={`rule-roll-impact-portal rule-roll-impact--${impact.kind}`}
    >
      <div className="rule-roll-impact__screen">
        <strong>{impact.title}</strong>
        <span>{impact.subtitle}</span>
      </div>
    </div>
  );

  return (
    <>
      {typeof document !== "undefined" && createPortal(screenImpact, document.body)}
      <div
        aria-hidden="true"
        className={`rule-roll-impact rule-roll-impact--${impact.kind}`}
      >
        <div className="rule-roll-impact__card-glow" />
      </div>
    </>
  );
};
