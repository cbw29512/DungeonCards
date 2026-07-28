import type { CardDefinition, CardFamily, CardSourceReference } from "../types/cardPlatform";
import type { DndOptimizedBuildProfile } from "../types/dndCharacterVault";
import { buildVaultCard, safeVaultCardId } from "./dndCharacterCardShared";

const parseEquipment = (value: string): { title: string; detail?: string } => {
  const separator = value.includes(" — ") ? " — " : value.includes(": ") ? ": " : undefined;
  if (!separator) return { title: value.trim() };
  const [title, ...detail] = value.split(separator);
  return { title: title.trim(), detail: detail.join(separator).trim() || undefined };
};

const loadoutSource = (profile: DndOptimizedBuildProfile): CardSourceReference => ({
  kind: "original",
  title: "DM Forge Character Vault loadout",
  edition: profile.ruleset,
  publicDistributionAllowed: true,
  notes: "Loadout selection and packaging are original DM Forge build data; individual equipment rules remain governed by the selected edition sources."
});

export const generateDndEquipmentCards = (
  profile: DndOptimizedBuildProfile
): CardDefinition[] => profile.character.equipment.map((value, index) => {
  const item = parseEquipment(value);
  return buildVaultCard(profile, {
    id: `item:equipment:${index}-${safeVaultCardId(item.title)}`,
    family: "item",
    title: item.title,
    subtitle: "Starting equipment",
    summary: item.detail ?? `${item.title} is included in this Character Vault loadout.`,
    tags: ["item", "equipment", "loadout"],
    actions: [{
      id: "use-item",
      kind: "procedure",
      label: `Use ${item.title}`,
      steps: [item.detail ?? `Use ${item.title} according to the exact-edition equipment rules.`]
    }],
    sourceReference: loadoutSource(profile)
  });
});

const magicItemFamily = (category: string): CardFamily => category === "weapon" ? "weapon" : "item";

export const generateDndMagicItemCards = (
  profile: DndOptimizedBuildProfile
): CardDefinition[] => profile.magicItems.map((item, index) => {
  const resources = item.maximumCharges !== undefined
    ? [{
        id: "charges",
        label: "Charges",
        maximum: item.maximumCharges,
        initial: item.maximumCharges,
        refresh: "manual" as const,
        unit: "charges",
        notes: item.recharge
      }]
    : item.consumable
      ? [{ id: "uses", label: "Uses", maximum: 1, initial: 1, refresh: "none" as const, unit: "uses" }]
      : [];
  const steps = [
    item.effectSummary,
    item.synergyNote,
    ...(item.requiresAttunement ? [`Attunement required${item.attunementPrerequisite ? `: ${item.attunementPrerequisite}` : "."}`] : []),
    ...(item.recharge ? [`Recharge: ${item.recharge}.`] : [])
  ];
  return buildVaultCard(profile, {
    id: `item:magic:${index}-${safeVaultCardId(item.id)}`,
    family: magicItemFamily(item.category),
    title: item.name,
    subtitle: `${item.rarity.replaceAll("-", " ")} ${item.category.replaceAll("-", " ")}`,
    summary: item.effectSummary,
    detail: item.synergyNote,
    tags: ["item", "magic-item", item.rarity, item.category, item.requiresAttunement ? "attunement" : "no-attunement"],
    actions: [{ id: "use-item", kind: "procedure", label: `Use ${item.name}`, steps }],
    resources,
    source: item.source
  });
});