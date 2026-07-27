import type { CardDefinition } from "../types/cardPlatform";
import type { CocSpellPreview } from "../types/coc";
import {
  cocCardPrint,
  cocReview,
  cocSourceReference,
  safeCocId,
  type CocAdapterOptions
} from "./cardPlatformCocAdapterShared";

export const adaptCocSpell = (
  spell: CocSpellPreview,
  options: CocAdapterOptions = {}
): CardDefinition => ({
  schemaVersion: 2,
  id: `legacy-coc:ritual:${safeCocId(spell.id)}`,
  gameSystemId: "coc-7e",
  family: "ritual",
  visibility: options.visibility ?? "game-master-only",
  content: {
    title: spell.name,
    subtitle: `${spell.castingTime} · range ${spell.range}`,
    summary: spell.summary,
    detail: `Magic Point cost: ${spell.magicPointCost}. Sanity cost: ${spell.sanityCostFormula}. Duration: ${spell.duration}. Failure: ${spell.failure}`,
    tags: ["legacy-coc", "ritual", "magic", "sanity-cost"]
  },
  source: cocSourceReference(options.source),
  review: options.review ?? cocReview(options.source),
  actions: [
    {
      id: "casting-check",
      kind: "roll",
      label: `Roll ${spell.castingSkillName}`,
      rollSystem: "percentile",
      percentileTarget: spell.defaultCastingSkill,
      percentileDifficulty: "regular",
      notes: `Default demonstration casting value: ${spell.defaultCastingSkill}%.`
    },
    {
      id: "sanity-cost",
      kind: "roll",
      label: "Roll Sanity cost",
      rollSystem: "dice-formula",
      formula: spell.sanityCostFormula
    },
    {
      id: "casting-procedure",
      kind: "procedure",
      label: "Resolve the ritual",
      steps: [
        `Spend ${spell.magicPointCost} Magic Points.`,
        `Resolve the ${spell.castingSkillName} casting check when required.`,
        `Apply ${spell.sanityCostFormula} Sanity loss and track the ${spell.duration} duration.`,
        spell.failure
      ]
    }
  ],
  resources: [],
  linkedCardIds: [],
  print: cocCardPrint
});
