import { useEffect, useRef, useState } from "react";
import type { RuleCard as RuleCardType, RuleRollHistoryEntry } from "../types/ruleCards";
import { useRuleCardState } from "../hooks/useRuleCardState";
import {
  getAttackRollImpact,
  type AttackRollImpact
} from "../utils/ruleRollImpact";
import { RuleCardBack } from "./RuleCardBack";
import { RuleCardFront } from "./RuleCardFront";
import { RuleRollImpact } from "./RuleRollImpact";
import type { WorkspaceCardControls } from "./RuleCardWorkspaceActions";

type RuleCardProps = {
  card: RuleCardType;
  onRoll: (entry: RuleRollHistoryEntry) => void;
  workspaceControls?: WorkspaceCardControls;
};

type VisibleAttackRollImpact = AttackRollImpact & {
  id: number;
};

export const RuleCard = ({ card, onRoll, workspaceControls }: RuleCardProps) => {
  const controller = useRuleCardState({ card, onRoll });
  const impactId = useRef(0);
  const [impact, setImpact] = useState<VisibleAttackRollImpact>();

  useEffect(() => {
    try {
      const nextImpact = getAttackRollImpact(controller.result);

      if (!nextImpact) {
        setImpact(undefined);
        return;
      }

      impactId.current += 1;
      setImpact({ ...nextImpact, id: impactId.current });
    } catch (error) {
      console.error("Updating the rule card roll impact failed", {
        cardId: card.id,
        result: controller.result,
        error
      });
      setImpact(undefined);
    }
  }, [card.id, controller.result]);

  return (
    <article className={`rule-card ${controller.isFlipped ? "is-flipped" : ""}`}>
      {impact && <RuleRollImpact key={impact.id} impact={impact} />}
      <div className="rule-card__inner">
        <RuleCardFront
          card={card}
          controller={controller}
          workspaceControls={workspaceControls}
        />
        <RuleCardBack card={card} controller={controller} />
      </div>
    </article>
  );
};
