import type {
  DndMagicItemRarity,
  DndMagicItemSelection
} from "../types/dndCharacterVault";
import type { RulesetId } from "../types/ruleCards";

const sourceFor = (ruleset: RulesetId) => ({
  label: ruleset === "srd-5.1-2014"
    ? "2014 Basic Rules — Magic Items"
    : "2024 Free Rules — Magic Items A–Z",
  url: ruleset === "srd-5.1-2014"
    ? "https://www.dndbeyond.com/sources/dnd/basic-rules-2014/magic-items"
    : "https://www.dndbeyond.com/sources/dnd/br-2024/magic-items-a-z",
  scope: "public-srd" as const
});

const item = (
  ruleset: RulesetId,
  id: string,
  name: string,
  rarity: DndMagicItemRarity,
  minimumLevel: number,
  options: Omit<DndMagicItemSelection, "id" | "name" | "rarity" | "minimumLevel" | "source">
): DndMagicItemSelection => ({
  id: `${ruleset}-paladin-${id}`,
  name,
  rarity,
  minimumLevel,
  source: sourceFor(ruleset),
  ...options
});

export const paladinMagicItemsForLevel = (
  ruleset: RulesetId,
  level: number
): DndMagicItemSelection[] => {
  const common = [
    item(ruleset, "potion-healing", "Potion of Healing", "common", 2, {
      category: "potion", requiresAttunement: false, attunedByDefault: false, consumable: true,
      effectSummary: "Restores 2d4 + 2 Hit Points.",
      synergyNote: "Preserves Lay on Hands for emergency ally recovery or condition removal."
    }),
    item(ruleset, "potion-climbing", "Potion of Climbing", "common", 11, {
      category: "potion", requiresAttunement: false, attunedByDefault: false, consumable: true,
      effectSummary: "Temporarily improves climbing movement and climbing checks.",
      synergyNote: "Solves vertical access without spending prepared spells or abandoning heavy armor."
    })
  ];

  const uncommon = [
    item(ruleset, "weapon-plus-1", "Weapon, +1", "uncommon", 5, {
      category: "weapon", requiresAttunement: false, attunedByDefault: false, consumable: false,
      effectSummary: "Adds +1 to attack and damage rolls with the selected one-handed weapon.",
      synergyNote: "Improves the accuracy of attacks that can deliver Divine Smite."
    }),
    item(ruleset, "sentinel-shield", "Sentinel Shield", "uncommon", 11, {
      category: "armor", requiresAttunement: false, attunedByDefault: false, consumable: false,
      effectSummary: "Grants Advantage on Initiative and Perception checks while wielded.",
      synergyNote: "Helps the Paladin establish aura position before enemies act."
    }),
    item(ruleset, "cloak-protection", "Cloak of Protection", "uncommon", 11, {
      category: "wondrous-item", requiresAttunement: true, attunedByDefault: true, consumable: false,
      effectSummary: "Grants +1 Armor Class and +1 to saving throws.",
      synergyNote: "Stacks naturally with heavy armor and Aura of Protection."
    }),
    item(ruleset, "bag-holding", "Bag of Holding", "uncommon", 17, {
      category: "wondrous-item", requiresAttunement: false, attunedByDefault: false, consumable: false,
      effectSummary: "Stores a large amount of equipment in extradimensional space.",
      synergyNote: "Keeps ritual, mount, and party-support gear accessible without overloading the front line."
    })
  ];

  const rare = [
    item(ruleset, "ring-protection", "Ring of Protection", "rare", 11, {
      category: "ring", requiresAttunement: true, attunedByDefault: true, consumable: false,
      effectSummary: "Grants +1 Armor Class and +1 to saving throws.",
      synergyNote: "Reinforces the Paladin's defensive aura anchor role."
    }),
    item(ruleset, "weapon-plus-2", "Weapon, +2", "rare", 17, {
      category: "weapon", requiresAttunement: false, attunedByDefault: false, consumable: false,
      effectSummary: "Adds +2 to attack and damage rolls with the selected one-handed weapon.",
      synergyNote: "Maintains hit reliability against tier-four defenses and protects smite efficiency."
    }),
    item(ruleset, "amulet-health", "Amulet of Health", "rare", 17, {
      category: "wondrous-item", requiresAttunement: true, attunedByDefault: false, consumable: false,
      effectSummary: "Sets Constitution to 19 while worn.",
      synergyNote: "Offers an alternate attunement package for Hit Points and concentration saves."
    })
  ];

  const veryRare = [
    item(ruleset, "armor-plus-2", "Armor, +2", "very-rare", 17, {
      category: "armor", requiresAttunement: false, attunedByDefault: false, consumable: false,
      effectSummary: "Adds +2 Armor Class to the selected suit of armor.",
      synergyNote: "Raises front-line durability without consuming an attunement slot."
    })
  ];

  if (level === 1) return [];
  if (level <= 4) return common.slice(0, 1);
  if (level <= 10) return [...common.slice(0, 1), ...uncommon.slice(0, 1)];
  if (level <= 16) return [...common, ...uncommon.slice(0, 3), ...rare.slice(0, 1)];
  return [...common, ...uncommon, ...rare, ...veryRare];
};
