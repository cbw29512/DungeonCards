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
  id: `${ruleset}-rogue-${id}`,
  name,
  rarity,
  minimumLevel,
  source: sourceFor(ruleset),
  ...options
});

export const rogueMagicItemsForLevel = (
  ruleset: RulesetId,
  level: number
): DndMagicItemSelection[] => {
  const common = [
    item(ruleset, "potion-healing", "Potion of Healing", "common", 2, {
      category: "potion", requiresAttunement: false, attunedByDefault: false, consumable: true,
      effectSummary: "Restores 2d4 + 2 Hit Points.",
      synergyNote: "Provides emergency recovery without sacrificing the Rogue's build identity."
    }),
    item(ruleset, "potion-climbing", "Potion of Climbing", "common", 11, {
      category: "potion", requiresAttunement: false, attunedByDefault: false, consumable: true,
      effectSummary: "Temporarily improves climbing speed and climbing checks.",
      synergyNote: "Supports infiltration when Second-Story Work alone is not enough."
    })
  ];

  const uncommon = [
    item(ruleset, "weapon-plus-1", "Weapon, +1", "uncommon", 5, {
      category: "weapon", requiresAttunement: false, attunedByDefault: false, consumable: false,
      effectSummary: "Adds +1 to attack and damage rolls with the selected Sneak Attack weapon.",
      synergyNote: "Accuracy is especially valuable when the Rogue normally makes one priority attack."
    }),
    item(ruleset, "cloak-elvenkind", "Cloak of Elvenkind", "uncommon", 11, {
      category: "wondrous-item", requiresAttunement: true, attunedByDefault: true, consumable: false,
      effectSummary: "Makes the wearer harder to see and improves hiding.",
      synergyNote: "Strengthens the stealth loop that enables Advantage and safe positioning."
    }),
    item(ruleset, "gloves-thievery", "Gloves of Thievery", "uncommon", 11, {
      category: "wondrous-item", requiresAttunement: false, attunedByDefault: false, consumable: false,
      effectSummary: "Improves lockpicking and Sleight of Hand checks.",
      synergyNote: "Directly reinforces Fast Hands and the Thief's exploration role."
    }),
    item(ruleset, "bag-holding", "Bag of Holding", "uncommon", 17, {
      category: "wondrous-item", requiresAttunement: false, attunedByDefault: false, consumable: false,
      effectSummary: "Stores a large amount of equipment in extradimensional space.",
      synergyNote: "Keeps situational tools and recovered treasure accessible without overloading the scout."
    })
  ];

  const rare = [
    item(ruleset, "ring-protection", "Ring of Protection", "rare", 11, {
      category: "ring", requiresAttunement: true, attunedByDefault: true, consumable: false,
      effectSummary: "Grants +1 Armor Class and +1 to saving throws.",
      synergyNote: "Improves defenses without changing armor or compromising stealth."
    }),
    item(ruleset, "weapon-plus-2", "Weapon, +2", "rare", 17, {
      category: "weapon", requiresAttunement: false, attunedByDefault: false, consumable: false,
      effectSummary: "Adds +2 to attack and damage rolls with the selected Sneak Attack weapon.",
      synergyNote: "Preserves accuracy against tier-four Armor Classes."
    }),
    item(ruleset, "ring-evasion", "Ring of Evasion", "rare", 17, {
      category: "ring", requiresAttunement: true, attunedByDefault: true, consumable: false,
      maximumCharges: 3,
      recharge: "Regains 1d3 expended charges daily at dawn.",
      effectSummary: "Can convert failed Dexterity saves into successes.",
      synergyNote: "Makes the Rogue's strongest saving throw and Evasion package more dependable."
    })
  ];

  const veryRare = [
    item(ruleset, "carpet-flying", "Carpet of Flying", "very-rare", 17, {
      category: "wondrous-item", requiresAttunement: false, attunedByDefault: false, consumable: false,
      effectSummary: "Provides sustained flying transportation.",
      synergyNote: "Solves vertical access, extraction, and unreachable-target problems without consuming attunement."
    })
  ];

  if (level === 1) return [];
  if (level <= 4) return common.slice(0, 1);
  if (level <= 10) return [...common.slice(0, 1), ...uncommon.slice(0, 1)];
  if (level <= 16) return [...common, ...uncommon.slice(0, 3), ...rare.slice(0, 1)];
  return [...common, ...uncommon, ...rare, ...veryRare];
};
