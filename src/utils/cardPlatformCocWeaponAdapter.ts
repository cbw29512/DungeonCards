import type { CardDefinition } from "../types/cardPlatform";
import type { CocWeaponRecord } from "../types/coc";
import {
  cocCardPrint,
  cocReview,
  cocSourceReference,
  safeCocId,
  type CocAdapterOptions
} from "./cardPlatformCocAdapterShared";

export const adaptCocWeapon = (
  weapon: CocWeaponRecord,
  options: CocAdapterOptions = {}
): CardDefinition => {
  const hasTrackedUses = weapon.capacity > 0;
  return {
    schemaVersion: 2,
    id: `legacy-coc:weapon:${safeCocId(weapon.id)}`,
    gameSystemId: "coc-7e",
    family: "weapon",
    visibility: options.visibility ?? "player-safe",
    content: {
      title: weapon.name,
      subtitle: `${weapon.category} · ${weapon.skillName}`,
      summary: `${weapon.damageFormula}${weapon.usesDamageBonus ? " + DB" : ""} tabletop damage; range ${weapon.range}.`,
      detail: `${weapon.notes} Tabletop attacks per round: ${weapon.attacksPerRound}.`,
      tags: [...new Set([
        "legacy-coc",
        "weapon",
        safeCocId(weapon.kind),
        safeCocId(weapon.category),
        safeCocId(weapon.availability),
        ...weapon.eras.map(safeCocId),
        weapon.impaling ? "impaling" : "non-impaling"
      ])]
    },
    source: cocSourceReference(options.source),
    review: options.review ?? cocReview(options.source),
    actions: [
      {
        id: "attack-check",
        kind: "roll",
        label: `Roll ${weapon.skillName}`,
        rollSystem: "percentile",
        percentileTarget: weapon.defaultSkill,
        percentileDifficulty: "regular",
        ...(hasTrackedUses ? { resourceCosts: [{ resourceId: "uses", amount: 1 }] } : {}),
        notes: `Default original-library tabletop skill value: ${weapon.defaultSkill}%.`
      },
      {
        id: "damage",
        kind: "roll",
        label: `Roll ${weapon.name} damage`,
        rollSystem: "dice-formula",
        formula: weapon.damageFormula,
        notes: weapon.usesDamageBonus
          ? "Apply the character's tabletop Damage Bonus when relevant."
          : "This tabletop record does not add Damage Bonus."
      },
      {
        id: "weapon-procedure",
        kind: "procedure",
        label: "Resolve the tabletop weapon",
        steps: [
          `Check the listed range and ${weapon.attacksPerRound} tabletop action limit.`,
          hasTrackedUses ? "Update the card's remaining-use tracker." : "No remaining-use tracker is required.",
          weapon.notes
        ]
      }
    ],
    resources: hasTrackedUses ? [{
      id: "uses",
      label: "Remaining uses",
      maximum: weapon.capacity,
      initial: weapon.capacity,
      refresh: "manual",
      unit: "uses"
    }] : [],
    linkedCardIds: [],
    print: cocCardPrint
  };
};
