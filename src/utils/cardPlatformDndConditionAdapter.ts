import type { CardDefinition } from "../types/cardPlatform";
import type { DndConditionRecord } from "../types/dndConditions";
import { gameSystemIdForRuleset } from "./cardPlatformGameSystem";

const editionLabel = (condition: DndConditionRecord): string => (
  condition.edition === "srd-5.1-2014" ? "D&D 2014 condition" : "D&D 2024 condition"
);

const tagForName = (name: string): string => name
  .trim()
  .toLowerCase()
  .replaceAll(/[^a-z0-9]+/g, "-")
  .replaceAll(/^-|-$/g, "");

export const adaptDndCondition = (
  condition: DndConditionRecord
): CardDefinition => {
  const gameSystemId = gameSystemIdForRuleset(condition.edition);
  return {
    schemaVersion: 2,
    id: `dnd-condition:${gameSystemId}:${condition.id}`,
    gameSystemId,
    family: "condition",
    visibility: "public",
    content: {
      title: condition.name,
      subtitle: editionLabel(condition),
      summary: condition.summary,
      detail: condition.effects.join("\n"),
      tags: ["condition", "combat-effect", tagForName(condition.name)]
    },
    source: {
      kind: "srd",
      title: condition.sourceReference,
      url: condition.sourceUrl,
      edition: condition.edition,
      section: "Conditions",
      license: "CC BY 4.0",
      publicDistributionAllowed: true
    },
    review: {
      status: "rules-reviewed",
      notes: ["Adapted from the existing edition-separated condition record."]
    },
    actions: [{
      id: `${condition.id}:effects`,
      kind: "procedure",
      label: `Apply ${condition.name}`,
      steps: [...condition.effects]
    }],
    resources: [],
    linkedCardIds: [],
    print: {
      format: "standard-card",
      sizeId: "poker-2.5x3.5",
      faces: "front-back"
    }
  };
};
