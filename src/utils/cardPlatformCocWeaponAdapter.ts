import type { CardDefinition } from "../types/cardPlatform";
import type { CocWeaponPreview } from "../types/coc";
import {
  cocCardPrint,
  cocReview,
  cocSourceReference,
  safeCocId,
  type CocAdapterOptions
} from "./cardPlatformCocAdapterShared";

export const adaptCocWeapon = (
  weapon: CocWeaponPreview,
  options: CocAdapterOptions = {}
): CardDefinition => ({
  schemaVersion: 2,
  id: `legacy-coc:weapon:${safeCocId(weapon.id)}`,
  gameSystemId: "coc-7e",
  family: "weapon",
  visibility: options.visibility ?? "player-safe",
  content: {
    title: weapon.name,
    subtitle: `${weapon.category} · ${weapon.skillName}`,
    summary: `${weapon.damageFormula} damage, ${weapon.capacity}-round capacity, range ${weapon.range}.`,
    detail: `${weapon.notes} Attacks per round: ${weapon.attacksPerRound}. Malfunction: ${weapon.malfunction}.`,
    tags: [...new Set(["legacy-coc", "weapon", safeCocId(weapon.category), weapon.impaling ? "impaling" : "non-impaling"])]
  },
  source: cocSourceReference(options.source),
  review: options.review ?? cocReview(options.source),
  actions: [
    {
      id: "attack-check",
      kind: "roll",
      label: `Roll ${weapon.skillName}`,
      rollSystem: "percentile",
      notes: `Default demonstration skill value: ${weapon.defaultSkill}%.`
    },
    {
      id: "damage",
      kind: "roll",
      label: `Roll ${weapon.name} damage`,
      rollSystem: "dice-formula",
      formula: weapon.damageFormula,
      notes: weapon.impaling ? "Apply impaling rules when the attack qualifies." : undefined
    },
    {
      id: "firearm-procedure",
      kind: "procedure",
      label: "Resolve the weapon",
      steps: [
        `Check range and the ${weapon.attacksPerRound} attacks-per-round limit.`,
        `Track ammunition and malfunction ${weapon.malfunction}.`,
        weapon.notes
      ]
    }
  ],
  resources: [{
    id: "ammunition",
    label: "Ammunition",
    maximum: weapon.capacity,
    initial: weapon.capacity,
    refresh: "manual",
    unit: "rounds"
  }],
  linkedCardIds: [],
  print: cocCardPrint
});
