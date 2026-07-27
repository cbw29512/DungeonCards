import type { CardDefinition } from "../types/cardPlatform";
import type { CardActionDefinition } from "../types/cardPlatformActions";
import type { CardRuntimeInstance } from "../types/cardPlatformRuntime";
import type { CardActionResourceChange } from "../types/cardActionExecution";

export type CardActionCostResult = {
  resourceState: Record<string, number>;
  changes: CardActionResourceChange[];
};

export const calculateCardActionCosts = (
  definition: CardDefinition,
  instance: CardRuntimeInstance,
  action: CardActionDefinition
): CardActionCostResult => {
  const resourceState = { ...instance.resourceState };
  const changes: CardActionResourceChange[] = [];
  for (const cost of action.resourceCosts ?? []) {
    const resource = definition.resources.find((candidate) => candidate.id === cost.resourceId);
    if (!resource) throw new Error(`${action.label} references missing resource ${cost.resourceId}.`);
    if (resource.maximum === "unlimited") continue;
    const before = resourceState[resource.id];
    if (!Number.isSafeInteger(before) || before < 0) throw new Error(`${resource.label} has invalid runtime state.`);
    if (before < cost.amount) throw new Error(`${action.label} needs ${cost.amount} ${resource.label}, but only ${before} remain.`);
    const after = before - cost.amount;
    resourceState[resource.id] = after;
    changes.push({ resourceId: resource.id, before, after, amount: cost.amount });
  }
  return { resourceState, changes };
};
