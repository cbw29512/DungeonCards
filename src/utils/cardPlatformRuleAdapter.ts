import type {
  CardActionDefinition,
  CardRollActionDefinition
} from "../types/cardPlatformActions";
import type { CardDefinition } from "../types/cardPlatform";
import type {
  RuleCard,
  RuleRollMode,
  RulesetId
} from "../types/ruleCards";
import { gameSystemIdForRuleset } from "./cardPlatformGameSystem";

export { gameSystemIdForRuleset } from "./cardPlatformGameSystem";

const actionForMode = (
  mode: RuleRollMode,
  id: string,
  label: string,
  formula: string
): CardRollActionDefinition => ({
  id,
  kind: "roll",
  label,
  rollSystem: formula.trim().toLowerCase().startsWith("d20") ? "d20" : "dice-formula",
  formula,
  allowsAdvantage: mode.allowsAdvantage,
  notes: mode.naturalRollRule === "attack" ? "Apply attack natural-roll rules." : undefined
});

const actionsForMode = (mode: RuleRollMode): CardActionDefinition[] => {
  const actions = mode.choices?.length
    ? mode.choices.map((choice) => actionForMode(
        mode,
        `${mode.id}:${choice.id}`,
        `${mode.label}: ${choice.label}`,
        choice.formula
      ))
    : [actionForMode(mode, mode.id, mode.label, mode.formula)];
  if (mode.secondaryRoll) {
    actions.push(actionForMode(
      mode,
      `${mode.id}:secondary`,
      mode.secondaryRoll.label,
      mode.secondaryRoll.formula
    ));
  }
  return actions;
};

export const adaptRuleCard = (
  card: RuleCard,
  ruleset: RulesetId
): CardDefinition | null => {
  const variant = card.variants[ruleset];
  if (!variant) return null;
  const gameSystemId = gameSystemIdForRuleset(ruleset);
  return {
    schemaVersion: 2,
    id: `legacy-rule:${gameSystemId}:${card.id}`,
    gameSystemId,
    family: variant.modes.length > 0 ? "roll-action" : "rule",
    visibility: "public",
    content: {
      title: card.name,
      subtitle: card.kind.replaceAll("-", " "),
      summary: variant.summary,
      detail: variant.detail,
      icon: card.imageEmoji,
      tags: [...new Set(["legacy-rule", card.kind, ...variant.tags])]
    },
    source: {
      kind: variant.source === "srd" ? "srd" : "original",
      title: variant.sourceReference,
      edition: ruleset,
      license: variant.source === "srd" ? "CC BY 4.0" : undefined,
      publicDistributionAllowed: true
    },
    review: { status: "draft" },
    actions: variant.modes.flatMap(actionsForMode),
    resources: [],
    linkedCardIds: [],
    print: {
      format: "standard-card",
      sizeId: "poker-2.5x3.5",
      faces: "front-back"
    }
  };
};
