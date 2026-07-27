import { srdManifest } from "../data/srdCompendium";
import type { CardDefinition } from "../types/cardPlatform";
import type { SrdSpellRecord } from "../types/srdCompendium";
import { gameSystemIdForRuleset } from "./cardPlatformGameSystem";

const safeId = (value: string): string => (
  value.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-|-$/g, "") || "spell"
);

export const adaptSrdSpell = (spell: SrdSpellRecord): CardDefinition => {
  const gameSystemId = gameSystemIdForRuleset(spell.edition);
  const manifest = srdManifest.sources.find((source) => source.edition === spell.edition);
  const levelLabel = spell.level === 0 ? "Cantrip" : `Level ${spell.level}`;
  const concentration = /\bconcentration\b/i.test(spell.duration);
  return {
    schemaVersion: 2,
    id: `srd-spell:${gameSystemId}:${safeId(spell.id)}`,
    gameSystemId,
    family: "spell",
    visibility: "public",
    content: {
      title: spell.name,
      subtitle: `${levelLabel} · ${spell.school}`,
      summary: `${spell.castingTime}; range ${spell.range}; duration ${spell.duration}.`,
      detail: `${spell.description}${spell.higherLevels ? ` At Higher Levels: ${spell.higherLevels}` : ""}`,
      tags: [
        "srd-spell",
        spell.school,
        `level-${spell.level}`,
        ...spell.classes,
        ...(concentration ? ["concentration"] : [])
      ]
    },
    source: {
      kind: "srd",
      title: spell.sourceReference,
      url: manifest?.pdfUrl,
      edition: spell.edition,
      section: `${spell.school} spell · ${levelLabel}`,
      page: spell.sourcePage,
      license: "CC BY 4.0",
      publicDistributionAllowed: true
    },
    review: { status: "rules-reviewed" },
    actions: [{
      id: "cast",
      kind: "procedure",
      label: `Cast ${spell.name}`,
      steps: [
        `Use ${spell.castingTime}, range ${spell.range}, and components ${spell.components}.`,
        spell.level === 0 ? "Cantrips do not spend spell slots." : `Spend a level ${spell.level} or higher spell slot.`,
        `Track duration: ${spell.duration}.`,
        spell.description
      ]
    }],
    resources: [],
    linkedCardIds: [],
    print: { format: "standard-card", sizeId: "poker-2.5x3.5", faces: "front-back" }
  };
};
