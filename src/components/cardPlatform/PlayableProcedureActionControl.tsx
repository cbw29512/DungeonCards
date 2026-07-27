import { useState } from "react";
import type { CardDefinition } from "../../types/cardPlatform";
import type { CardProcedureActionDefinition } from "../../types/cardPlatformActions";
import type { CardActionExecutionResult } from "../../types/cardActionExecution";
import { CardActionCostSummary } from "./CardActionCostSummary";

export const PlayableProcedureActionControl = ({
  action,
  definition,
  result,
  onComplete
}: {
  action: CardProcedureActionDefinition;
  definition: CardDefinition;
  result?: CardActionExecutionResult;
  onComplete(): void;
}) => {
  const [step, setStep] = useState(0);
  return (
    <article className="playable-card-action playable-card-action--procedure">
      <header><div><small>procedure</small><strong>{action.label}</strong></div><CardActionCostSummary action={action} definition={definition} /></header>
      <ol>{action.steps.map((text, index) => <li aria-current={index === step ? "step" : undefined} className={index === step ? "is-current" : ""} key={`${action.id}-${index}`}>{text}</li>)}</ol>
      <div className="playable-card-action__navigation">
        <button disabled={step === 0} onClick={() => setStep((current) => Math.max(0, current - 1))} type="button">Previous step</button>
        <span>Step {step + 1} of {action.steps.length}</span>
        <button disabled={step >= action.steps.length - 1} onClick={() => setStep((current) => Math.min(action.steps.length - 1, current + 1))} type="button">Next step</button>
      </div>
      <button disabled={step !== action.steps.length - 1} onClick={onComplete} type="button">Complete procedure</button>
      {result?.actionKind === "procedure" && <output className="playable-card-action__result"><strong>{result.summary}</strong>{result.resourceChanges.length > 0 && <span>{result.resourceChanges.map((change) => `${change.resourceId}: ${change.before}→${change.after}`).join(" · ")}</span>}</output>}
    </article>
  );
};
