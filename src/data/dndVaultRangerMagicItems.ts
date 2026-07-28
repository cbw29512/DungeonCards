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
  id: `${ruleset}-ranger-${id}`,
  name,
  rarity,
  minimumLevel,
  source: sourceFor(ruleset),
  ...options
});

export const rangerMagicItemsForLevel = (
  ruleset: RulesetId,
  level: number
): DndMagicItemSelection[] => {
  const common = [
    item(ruleset, "potion-healing", "Potion of Healing", "common", 2, {
      category: "potion", requiresAttunement: false, attunedByDefault: false, consumable: true,
      effectSummary: "Restores 2d4 + 2 Hit Points.",
      synergyNote: "Preserves Cure Wounds and Goodberry for allies or later encounters."
    }),
    item(ruleset, "potion-climbing", "Potion of Climbing", "common", 11, {
      category: "potion", requiresAttunement: false, attunedByDefault: false, consumable: true,
      effectSummary: "Temporarily improves climbing movement and climbing checks.",
      synergyNote: "Supports scouting before Roving or when armor and terrain complicate a climb."
    })
  ];

  const uncommon = [
    item(ruleset, "bracers-archery", "Bracers of Archery", "uncommon", 5, {
      category: "wondrous-item", requiresAttunement: true, attunedByDefault: true, consumable: false,
      effectSummary: "Adds +2 damage to longbow and shortbow attacks.",
      synergyNote: "Improves every ranged hit without consuming spell concentration."
    }),
    item(ruleset, "cloak-elvenkind", "Cloak of Elvenkind", "uncommon", 11, {
      category: "wondrous-item", requiresAttunement: true, attunedByDefault: true, consumable: false,
      effectSummary: "Makes the wearer harder to see and improves hiding.",
      synergyNote: "Strengthens scouting and ranged ambush positioning."
    }),
    item(ruleset, "weapon-plus-1", "Weapon, +1", "uncommon", 11, {
      category: "weapon", requiresAttunement: false, attunedByDefault: false, consumable: false,
      effectSummary: "Adds +1 to attack and damage rolls with the selected longbow.",
      synergyNote: "Improves hit reliability for Hunter's Mark and Colossus Slayer damage."
    }),
    item(ruleset, "bag-holding", "Bag of Holding", "uncommon", 17, {
      category: "wondrous-item", requiresAttunement: false, attunedByDefault: false, consumable: false,
      effectSummary: "Stores a large amount of equipment in extradimensional space.",
      synergyNote: "Keeps ammunition, traps, food, and exploration gear available without overloading the scout."
    })
  ];

  const rare = [
    item(ruleset, "ring-protection", "Ring of Protection", "rare", 11, {
      category: "ring", requiresAttunement: true, attunedByDefault: true, consumable: false,
      effectSummary: "Grants +1 Armor Class and +1 to saving throws.",
      synergyNote: "Improves concentration, defenses, and survival while maintaining ranged pressure."
    }),
    item(ruleset, "weapon-plus-2", "Weapon, +2", "rare", 17, {
      category: "weapon", requiresAttunement: false, attunedByDefault: false, consumable: false,
      effectSummary: "Adds +2 to attack and damage rolls with the selected longbow.",
      synergyNote: "Maintains accuracy against tier-four Armor Classes."
    }),
    item(ruleset, "ring-evasion", "Ring of Evasion", "rare", 17, {
      category: "ring", requiresAttunement: true, attunedByDefault: false, consumable: false,
      maximumCharges: 3, recharge: "Regains 1d3 expended charges daily at dawn.",
      effectSummary: "Can convert failed Dexterity saves into successes.",
      synergyNote: "Provides an alternate defense package, especially for the 2024 Hunter."
    })
  ];

  const veryRare = [
    item(ruleset, "oathbow", "Oathbow", "very-rare", 17, {
      category: "weapon", requiresAttunement: true, attunedByDefault: false, consumable: false,
      effectSummary: "Designates a sworn enemy and greatly improves attacks and damage against it.",
      synergyNote: "Fits the Hunter's priority-target role and layers with Hunter's Mark when the encounter warrants it."
    })
  ];

  if (level === 1) return [];
  if (level <= 4) return common.slice(0, 1);
  if (level <= 10) return [...common.slice(0, 1), ...uncommon.slice(0, 1)];
  if (level <= 16) return [...common, ...uncommon.slice(0, 3), ...rare.slice(0, 1)];
  return [...common, ...uncommon, ...rare, ...veryRare];
};
