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
  id: `${ruleset}-bard-${id}`,
  name,
  rarity,
  minimumLevel,
  source: sourceFor(ruleset),
  ...options
});

export const bardMagicItemsForLevel = (
  ruleset: RulesetId,
  level: number
): DndMagicItemSelection[] => {
  const common = [
    item(ruleset, "potion-healing", "Potion of Healing", "common", 2, {
      category: "potion", requiresAttunement: false, attunedByDefault: false, consumable: true,
      effectSummary: "Restores 2d4 + 2 Hit Points.",
      synergyNote: "Preserves Healing Word and other spell slots for allies who need immediate support."
    }),
    item(ruleset, "potion-climbing", "Potion of Climbing", "common", 11, {
      category: "potion", requiresAttunement: false, attunedByDefault: false, consumable: true,
      effectSummary: "Temporarily improves climbing movement and climbing checks.",
      synergyNote: "Solves exploration obstacles without spending mobility magic."
    })
  ];

  const uncommon = [
    item(ruleset, "doss-lute", "Instrument of the Bards — Doss Lute", "uncommon", 5, {
      category: "wondrous-item", requiresAttunement: true, attunedByDefault: true, consumable: false,
      effectSummary: "Functions as a Bard focus and provides stored enchantment, protection, and mobility magic.",
      synergyNote: "Directly expands the Bard's support toolkit while preserving prepared or known spells."
    }),
    item(ruleset, "pearl-power", "Pearl of Power", "uncommon", 11, {
      category: "wondrous-item", requiresAttunement: true, attunedByDefault: true, consumable: false,
      effectSummary: "Recovers one expended spell slot of level 3 or lower once per day.",
      synergyNote: "Restores a control spell, emergency heal, or Font of Inspiration fuel."
    }),
    item(ruleset, "cloak-protection", "Cloak of Protection", "uncommon", 11, {
      category: "wondrous-item", requiresAttunement: true, attunedByDefault: true, consumable: false,
      effectSummary: "Grants +1 Armor Class and +1 to saving throws.",
      synergyNote: "Improves concentration and fragile light-armor defenses."
    }),
    item(ruleset, "bag-holding", "Bag of Holding", "uncommon", 17, {
      category: "wondrous-item", requiresAttunement: false, attunedByDefault: false, consumable: false,
      effectSummary: "Stores a large amount of equipment in extradimensional space.",
      synergyNote: "Keeps instruments, disguises, scrolls, and investigative tools accessible."
    })
  ];

  const rare = [
    item(ruleset, "ring-protection", "Ring of Protection", "rare", 11, {
      category: "ring", requiresAttunement: true, attunedByDefault: false, consumable: false,
      effectSummary: "Grants +1 Armor Class and +1 to saving throws.",
      synergyNote: "Offers a defensive alternative when the instrument or slot-recovery item is less important."
    }),
    item(ruleset, "wand-fireballs", "Wand of Fireballs", "rare", 17, {
      category: "wand", requiresAttunement: true, attunedByDefault: false, consumable: false,
      maximumCharges: 7, recharge: "Regains 1d6 + 1 expended charges daily at dawn.",
      effectSummary: "Spends charges to cast Fireball without using the Bard's spell slots.",
      synergyNote: "Extends the College of Lore's level-6 damage discovery."
    }),
    item(ruleset, "amulet-health", "Amulet of Health", "rare", 17, {
      category: "wondrous-item", requiresAttunement: true, attunedByDefault: false, consumable: false,
      effectSummary: "Sets Constitution to 19 while worn.",
      synergyNote: "Improves Hit Points and concentration saves for a support caster."
    })
  ];

  const veryRare = [
    item(ruleset, "tome-leadership", "Tome of Leadership and Influence", "very-rare", 17, {
      category: "wondrous-item", requiresAttunement: false, attunedByDefault: false, consumable: true,
      effectSummary: "After dedicated study, permanently raises Charisma and its maximum by 2.",
      synergyNote: "Improves spellcasting, Bardic Inspiration uses, social checks, and College features."
    })
  ];

  if (level === 1) return [];
  if (level <= 4) return common.slice(0, 1);
  if (level <= 10) return [...common.slice(0, 1), ...uncommon.slice(0, 1)];
  if (level <= 16) return [...common, ...uncommon.slice(0, 3), ...rare.slice(0, 1)];
  return [...common, ...uncommon, ...rare, ...veryRare];
};
