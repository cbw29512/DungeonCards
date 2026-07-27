import { srdManifest, srdSpells } from "../data/srdCompendium";
import type { CardDefinition, CardSourceReference } from "../types/cardPlatform";
import type { SrdSpellRecord } from "../types/srdCompendium";
import type { DndOptimizedBuildProfile } from "../types/dndCharacterVault";
import { buildVaultCard, safeVaultCardId } from "./dndCharacterCardShared";

const findSpell = (
  profile: DndOptimizedBuildProfile,
  name: string
): SrdSpellRecord | undefined => srdSpells.find((spell) => (
  spell.edition === profile.ruleset && spell.name.toLowerCase() === name.toLowerCase()
));

const spellSource = (record: SrdSpellRecord): CardSourceReference => {
  const manifest = srdManifest.sources.find((source) => source.edition === record.edition);
  return {
    kind: "srd",
    title: record.sourceReference,
    url: manifest?.pdfUrl,
    edition: record.edition,
    section: `${record.school} spell · level ${record.level}`,
    page: record.sourcePage,
    license: "CC BY 4.0",
    publicDistributionAllowed: true
  };
};

export const generateDndSpellCards = (
  profile: DndOptimizedBuildProfile
): CardDefinition[] => {
  const casting = profile.character.spellcasting;
  if (casting.kind === "none") return [];
  const selected = [
    ...casting.cantrips.map((name) => ({ name, cantrip: true })),
    ...casting.spells.map((name) => ({ name, cantrip: false }))
  ].filter((entry, index, entries) => entries.findIndex((candidate) => (
    candidate.name.toLowerCase() === entry.name.toLowerCase()
  )) === index);
  return selected.map((entry, index) => {
    const record = findSpell(profile, entry.name);
    const level = record?.level ?? (entry.cantrip ? 0 : undefined);
    return buildVaultCard(profile, {
      id: `spell:${index}-${safeVaultCardId(entry.name)}`,
      family: "spell",
      title: entry.name,
      subtitle: record
        ? `${record.level === 0 ? "Cantrip" : `Level ${record.level}`} · ${record.school}`
        : entry.cantrip ? "Cantrip" : "Selected spell",
      summary: record
        ? `${record.castingTime}; range ${record.range}; duration ${record.duration}.`
        : `${entry.name} is selected for this exact-edition Character Vault build.`,
      detail: record
        ? `${record.description}${record.higherLevels ? ` At Higher Levels: ${record.higherLevels}` : ""}`
        : casting.notes,
      tags: ["spell", entry.cantrip ? "cantrip" : "leveled-spell", ...(record ? [record.school, `level-${record.level}`, ...record.classes] : [])],
      actions: [{
        id: "cast",
        kind: "procedure",
        label: `Cast ${entry.name}`,
        steps: [
          record ? `Use ${record.castingTime}, range ${record.range}, and components ${record.components}.` : "Use the exact-edition source rules for this selected spell.",
          level && level > 0 ? `Spend one level ${level} spell slot unless another feature changes the cost.` : "Cantrips do not spend spell slots.",
          record?.duration ? `Track duration: ${record.duration}.` : "Resolve and track the spell's duration."
        ]
      }],
      sourceReference: record ? spellSource(record) : undefined
    });
  });
};

export const generateDndSpellSlotCards = (
  profile: DndOptimizedBuildProfile
): CardDefinition[] => {
  const casting = profile.character.spellcasting;
  if (casting.kind === "none") return [];
  return Object.entries(casting.slotsByLevel).flatMap(([levelText, maximum]) => {
    const level = Number(levelText);
    if (!Number.isInteger(maximum) || !Number.isInteger(level) || maximum <= 0) return [];
    return [buildVaultCard(profile, {
      id: `spell-slot:${level}`,
      family: "character-action",
      title: `Level ${level} Spell Slots`,
      subtitle: "Long-rest resource",
      summary: `Track ${maximum} level ${level} spell slots for this build.`,
      tags: ["resource", "spell-slot", `level-${level}`],
      actions: [{ id: "spend-slot", kind: "procedure", label: `Spend a level ${level} slot`, steps: [`Reduce remaining level ${level} slots by one.`] }],
      resources: [{ id: "slots", label: `Level ${level} Slots`, maximum, initial: maximum, refresh: "long-rest", unit: "slots" }]
    })];
  });
};
