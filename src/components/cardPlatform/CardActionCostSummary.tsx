import type { CardActionDefinition } from "../../types/cardPlatformActions";
import type { CardDefinition } from "../../types/cardPlatform";

export const CardActionCostSummary = ({
  action,
  definition
}: {
  action: CardActionDefinition;
  definition: CardDefinition;
}) => {
  if (!action.resourceCosts?.length) return null;
  const labels = action.resourceCosts.map((cost) => {
    const resource = definition.resources.find((candidate) => candidate.id === cost.resourceId);
    return `${cost.amount} ${resource?.label ?? cost.resourceId}`;
  });
  return <small className="playable-card-action__cost">Cost: {labels.join(", ")}</small>;
};
