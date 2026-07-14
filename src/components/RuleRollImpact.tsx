import type { AttackRollImpact } from "../utils/ruleRollImpact";

type RuleRollImpactProps = {
  impact: AttackRollImpact;
};

export const RuleRollImpact = ({ impact }: RuleRollImpactProps) => (
  <div
    aria-hidden="true"
    className={`rule-roll-impact rule-roll-impact--${impact.kind}`}
  >
    <div className="rule-roll-impact__screen">
      <strong>{impact.title}</strong>
      <span>{impact.subtitle}</span>
    </div>
    <div className="rule-roll-impact__card-glow" />
  </div>
);
