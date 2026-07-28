import { getCocOccupation } from "../data/cocOccupationCatalog";
import type { CardDefinition } from "../types/cardPlatform";
import type { CocInvestigatorRecord } from "../types/cocInvestigatorCatalog";
import { calculateCocDerivedAttributes } from "./cocInvestigator";
import { calculateMaximumSanity } from "./cocSanityCampaign";
import {
  cocCardPrint,
  cocReview,
  cocSourceReference,
  safeCocId,
  type CocAdapterOptions
} from "./cardPlatformCocAdapterShared";

export const adaptCocInvestigator = (
  investigator: CocInvestigatorRecord,
  options: CocAdapterOptions = {}
): CardDefinition => {
  const occupation = getCocOccupation(investigator.occupationId);
  const derived = calculateCocDerivedAttributes(investigator.characteristics);
  const cthulhuMythos = Math.max(0, Math.min(99, Math.trunc(investigator.cthulhuMythos ?? 0)));
  const maximumSanity = calculateMaximumSanity(cthulhuMythos);
  const startingSanity = Math.min(investigator.characteristics.POW, maximumSanity);
  const topSkills = Object.entries(investigator.skills)
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, 6);

  return {
    schemaVersion: 2,
    id: `legacy-coc:investigator:${safeCocId(investigator.id)}`,
    gameSystemId: "coc-7e",
    family: "investigator",
    visibility: options.visibility ?? "player-safe",
    content: {
      title: investigator.name,
      subtitle: `${occupation.name} · ${investigator.era} · age ${investigator.age}`,
      summary: investigator.biography,
      detail: [
        `Ideology: ${investigator.ideology}`,
        `Traits: ${investigator.traits.join(", ")}.`,
        `Significant people: ${investigator.significantPeople.join("; ")}.`,
        `Meaningful locations: ${investigator.meaningfulLocations.join("; ")}.`,
        `Treasured possessions: ${investigator.treasuredPossessions.join("; ")}.`,
        `Maximum Sanity: ${maximumSanity} (99 minus Cthulhu Mythos ${cthulhuMythos}).`
      ].join(" "),
      tags: [...new Set([
        "legacy-coc",
        "investigator",
        "premade",
        safeCocId(investigator.era),
        safeCocId(occupation.category),
        safeCocId(occupation.name),
        ...investigator.traits.map(safeCocId)
      ])]
    },
    source: cocSourceReference(options.source),
    review: options.review ?? cocReview(options.source),
    actions: topSkills.map(([skill, value], index) => ({
      id: `skill-${index}-${safeCocId(skill)}`,
      kind: "roll" as const,
      label: `Roll ${skill}`,
      rollSystem: "percentile" as const,
      percentileTarget: value,
      percentileDifficulty: "regular" as const,
      notes: `${investigator.name}'s listed skill value is ${value}%.`
    })),
    resources: [
      { id: "hit-points", label: "Hit Points", maximum: derived.hitPoints, initial: derived.hitPoints, refresh: "manual", unit: "HP" },
      { id: "sanity", label: "Sanity", maximum: maximumSanity, initial: startingSanity, refresh: "manual", unit: "SAN", notes: "Maximum Sanity equals 99 minus Cthulhu Mythos." },
      { id: "magic-points", label: "Magic Points", maximum: derived.magicPoints, initial: derived.magicPoints, refresh: "manual", unit: "MP" },
      { id: "luck", label: "Luck", maximum: 99, initial: investigator.luck, refresh: "manual", unit: "Luck" },
      { id: "cthulhu-mythos", label: "Cthulhu Mythos", maximum: 99, initial: cthulhuMythos, refresh: "manual", unit: "%", notes: "When Mythos changes, update the Sanity maximum to 99 minus this value." }
    ],
    linkedCardIds: investigator.weaponIds.map((weaponId) => `legacy-coc:weapon:${safeCocId(weaponId)}`),
    print: cocCardPrint
  };
};