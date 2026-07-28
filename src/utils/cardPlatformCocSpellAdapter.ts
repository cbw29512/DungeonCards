import type { CardDefinition } from "../types/cardPlatform";
import type { CocRitualRecord } from "../types/coc";
import {
  cocCardPrint,
  cocReview,
  cocSourceReference,
  safeCocId,
  type CocAdapterOptions
} from "./cardPlatformCocAdapterShared";

export const adaptCocSpell = (
  spell: CocRitualRecord,
  options: CocAdapterOptions = {}
): CardDefinition => ({
  schemaVersion: 2,
  id: `legacy-coc:ritual:${safeCocId(spell.id)}`,
  gameSystemId: "coc-7e",
  family: "ritual",
  visibility: options.visibility ?? "game-master-only",
  content: {
    title: spell.name,
    subtitle: `${spell.kind} · ${spell.risk} risk · ${spell.castingTime}`,
    summary: spell.summary,
    detail: [
      `Effect: ${spell.effect}`,
      `Magic Point cost: ${spell.magicPointCost}.`,
      `Sanity cost: ${spell.sanityCostFormula}.`,
      `Range: ${spell.range}.`,
      `Duration: ${spell.durationFormula} ${spell.durationUnit}.`,
      `Requirements: ${spell.requirements.join("; ")}.`,
      `Failure: ${spell.failure}`
    ].join(" "),
    tags: [...new Set([
      "legacy-coc",
      "ritual",
      "original",
      safeCocId(spell.kind),
      safeCocId(spell.risk),
      safeCocId(spell.difficulty),
      ...spell.contexts.map(safeCocId)
    ])]
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
      percentileDifficulty: spell.difficulty,
      notes: `Default original-library casting value: ${spell.defaultCastingSkill}%. Spend ${spell.magicPointCost} Magic Points when the attempt begins.`
    },
    {
      id: "sanity-cost",
      kind: "roll",
      label: "Roll Sanity cost",
      rollSystem: "dice-formula",
      formula: spell.sanityCostFormula
    },
    {
      id: "duration",
      kind: "roll",
      label: `Roll duration in ${spell.durationUnit}`,
      rollSystem: "dice-formula",
      formula: spell.durationFormula
    },
    {
      id: "casting-procedure",
      kind: "procedure",
      label: "Resolve the ritual",
      steps: [
        `Confirm the requirements: ${spell.requirements.join("; ")}.`,
        `Spend ${spell.magicPointCost} Magic Points and resolve the ${spell.difficulty} ${spell.castingSkillName} check.`,
        `Apply ${spell.sanityCostFormula} Sanity loss.`,
        `On success, apply the effect for ${spell.durationFormula} ${spell.durationUnit}: ${spell.effect}`,
        `On failure, apply the original backlash: ${spell.failure}`
      ]
    }
  ],
  resources: [],
  linkedCardIds: [],
  print: cocCardPrint
});
