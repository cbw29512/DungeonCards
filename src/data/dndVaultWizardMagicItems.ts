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
  id: `${ruleset}-wizard-${id}`,
  name,
  rarity,
  minimumLevel,
  source: sourceFor(ruleset),
  ...options
});

export const wizardMagicItemsForLevel = (
  ruleset: RulesetId,
  level: number
): DndMagicItemSelection[] => {
  const common = [
    item(ruleset, "potion-healing", "Potion of Healing", "common", 2, {
      category: "potion", requiresAttunement: false, attunedByDefault: false, consumable: true,
      effectSummary: "Restores 2d4 + 2 Hit Points.",
      synergyNote: "Provides emergency recovery when spell slots must remain available for control."
    }),
    item(ruleset, "potion-climbing", "Potion of Climbing", "common", 11, {
      category: "potion", requiresAttunement: false, attunedByDefault: false, consumable: true,
      effectSummary: "Temporarily improves climbing movement and climbing checks.",
      synergyNote: "Preserves teleportation and flight spells for encounters rather than exploration."
    })
  ];

  const uncommon = [
    item(ruleset, "wand-magic-missiles", "Wand of Magic Missiles", "uncommon", 5, {
      category: "wand", requiresAttunement: false, attunedByDefault: false, consumable: false,
      maximumCharges: 7, recharge: "Regains 1d6 + 1 expended charges daily at dawn.",
      effectSummary: "Spends charges to cast Magic Missile without using the Wizard's spell slots.",
      synergyNote: "Adds dependable force damage while preserving prepared slots for control and defense."
    }),
    item(ruleset, "pearl-power", "Pearl of Power", "uncommon", 11, {
      category: "wondrous-item", requiresAttunement: true, attunedByDefault: true, consumable: false,
      effectSummary: "Recovers one expended spell slot of level 3 or lower once per day.",
      synergyNote: "Extends the Evoker's strongest low-level defensive or damage resources."
    }),
    item(ruleset, "cloak-protection", "Cloak of Protection", "uncommon", 11, {
      category: "wondrous-item", requiresAttunement: true, attunedByDefault: true, consumable: false,
      effectSummary: "Grants +1 Armor Class and +1 to saving throws.",
      synergyNote: "Improves fragile Wizard defenses without consuming actions or spell slots."
    }),
    item(ruleset, "bag-holding", "Bag of Holding", "uncommon", 17, {
      category: "wondrous-item", requiresAttunement: false, attunedByDefault: false, consumable: false,
      effectSummary: "Stores a large amount of equipment in extradimensional space.",
      synergyNote: "Keeps ritual components, spellbooks, and situational gear accessible."
    })
  ];

  const rare = [
    item(ruleset, "wand-fireballs", "Wand of Fireballs", "rare", 11, {
      category: "wand", requiresAttunement: true, attunedByDefault: true, consumable: false,
      maximumCharges: 7, recharge: "Regains 1d6 + 1 expended charges daily at dawn.",
      effectSummary: "Spends charges to cast Fireball without using the Wizard's spell slots.",
      synergyNote: "Pairs directly with Sculpt Spells and the Evoker's damage features."
    }),
    item(ruleset, "ring-protection", "Ring of Protection", "rare", 17, {
      category: "ring", requiresAttunement: true, attunedByDefault: false, consumable: false,
      effectSummary: "Grants +1 Armor Class and +1 to saving throws.",
      synergyNote: "Offers an alternative attunement package when survival matters more than offense."
    }),
    item(ruleset, "amulet-health", "Amulet of Health", "rare", 17, {
      category: "wondrous-item", requiresAttunement: true, attunedByDefault: false, consumable: false,
      effectSummary: "Sets Constitution to 19 while worn.",
      synergyNote: "Improves Hit Points and concentration saves for a high-level controller."
    })
  ];

  const veryRare = [
    item(ruleset, "staff-power", "Staff of Power", "very-rare", 17, {
      category: "staff", requiresAttunement: true, attunedByDefault: false, consumable: false,
      maximumCharges: 20, recharge: "Regains 2d8 + 4 expended charges daily at dawn.",
      effectSummary: "Provides defensive bonuses, stored spells, and a powerful magical weapon.",
      synergyNote: "Serves as a tier-four alternative to the default wand-and-defense attunement package."
    })
  ];

  if (level === 1) return [];
  if (level <= 4) return common.slice(0, 1);
  if (level <= 10) return [...common.slice(0, 1), ...uncommon.slice(0, 1)];
  if (level <= 16) return [...common, ...uncommon.slice(0, 3), ...rare.slice(0, 1)];
  return [...common, ...uncommon, ...rare, ...veryRare];
};
