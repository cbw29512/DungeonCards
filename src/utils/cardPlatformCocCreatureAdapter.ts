import type { CardDefinition } from "../types/cardPlatform";
import type { CardActionDefinition } from "../types/cardPlatformActions";
import type { CocCreaturePreview } from "../types/coc";
import {
  cocCardPrint,
  cocReview,
  cocSourceReference,
  safeCocId,
  type CocAdapterOptions
} from "./cardPlatformCocAdapterShared";

const attackActions = (creature: CocCreaturePreview): CardActionDefinition[] => creature.attacks.flatMap((attack, index) => {
  const id = `${index}-${safeCocId(attack.id || attack.name)}`;
  return [
    {
      id: `attack-${id}`,
      kind: "roll" as const,
      label: `Roll ${attack.name}`,
      rollSystem: "percentile" as const,
      notes: `Attack skill ${attack.skill}%. ${attack.notes}`
    },
    {
      id: `damage-${id}`,
      kind: "roll" as const,
      label: `Roll ${attack.name} damage`,
      rollSystem: "dice-formula" as const,
      formula: attack.damageFormula,
      notes: attack.notes
    }
  ];
});

export const adaptCocCreature = (
  creature: CocCreaturePreview,
  options: CocAdapterOptions = {}
): CardDefinition => ({
  schemaVersion: 2,
  id: `legacy-coc:creature:${safeCocId(creature.id)}`,
  gameSystemId: "coc-7e",
  family: "creature",
  visibility: options.visibility ?? "game-master-only",
  content: {
    title: creature.name,
    subtitle: creature.classification,
    summary: creature.description,
    detail: `HP ${creature.hitPoints}; MP ${creature.magicPoints}; MOV ${creature.move}; Build ${creature.build}; DB ${creature.damageBonus}; Armor ${creature.armor}. ${creature.traits.join(" ")}`,
    tags: ["legacy-coc", "creature", "keeper-only", safeCocId(creature.classification)]
  },
  source: cocSourceReference(options.source),
  review: options.review ?? cocReview(options.source),
  actions: [
    ...attackActions(creature),
    {
      id: "dodge",
      kind: "roll",
      label: "Roll Dodge",
      rollSystem: "percentile",
      notes: `Dodge ${creature.dodge}%.`
    },
    {
      id: "sanity-loss",
      kind: "roll",
      label: "Roll Sanity loss",
      rollSystem: "dice-formula",
      formula: creature.sanityLossFormula
    }
  ],
  resources: [
    { id: "hit-points", label: "Hit Points", maximum: creature.hitPoints, initial: creature.hitPoints, refresh: "manual", unit: "HP" },
    { id: "magic-points", label: "Magic Points", maximum: creature.magicPoints, initial: creature.magicPoints, refresh: "manual", unit: "MP" }
  ],
  linkedCardIds: [],
  print: cocCardPrint
});
