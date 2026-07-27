import type { CardDefinition } from "../../types/cardPlatform";
import type { CardLinkActionDefinition } from "../../types/cardPlatformActions";
import type { CardActionExecutionResult } from "../../types/cardActionExecution";
import { CardActionCostSummary } from "./CardActionCostSummary";

export const PlayableLinkActionControl = ({
  action,
  definition,
  result,
  onOpen
}: {
  action: CardLinkActionDefinition;
  definition: CardDefinition;
  result?: CardActionExecutionResult;
  onOpen(): void;
}) => (
  <article className="playable-card-action playable-card-action--link">
    <header><div><small>linked cards</small><strong>{action.label}</strong></div><CardActionCostSummary action={action} definition={definition} /></header>
    <p>{action.targetCardIds.length} referenced definition{action.targetCardIds.length === 1 ? "" : "s"}.</p>
    <button onClick={onOpen} type="button">Open linked card</button>
    {result?.actionKind === "link" && (
      <output className="playable-card-action__result">
        <strong>{result.summary}</strong>
        {result.missingTargetCardIds && result.missingTargetCardIds.length > 0 && <span>Missing: {result.missingTargetCardIds.join(", ")}</span>}
      </output>
    )}
  </article>
);
