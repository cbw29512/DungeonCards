import type {
  DndMagicItemRarity,
  DndMagicItemSelection
} from "../types/dndCharacterVault";
import type { RulesetId } from "../types/ruleCards";

const sourceFor = (ruleset: RulesetId) => ({
  label: ruleset === "srd-5.1-2014" ? "2014 Basic Rules — Magic Items" : "2024 Free Rules — Magic Items A–Z",
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
  id: `${ruleset}-cleric-${id}`,
  name,
  rarity,
  minimumLevel,
  source: sourceFor(ruleset),
  ...options
});

export const clericMagicItemsForLevel = (
  ruleset: RulesetId,
  level: number
): DndMagicItemSelection[] => {
  const common = [
    item(ruleset, "potion-healing", "Potion of Healing", "common", 2, {
      category: "potion", requiresAttunement: false, attunedByDefault: false, consumable: true,
      effectSummary: "Restores 2d4 + 2 Hit Points without using a spell slot.",
      synergyNote: "Preserves prepared healing and spell slots for allies who need larger recovery."
    }),
    item(ruleset, "scroll-healing-word", "Spell Scroll (Healing Word)", "common", 11, {
      category: "scroll", requiresAttunement: false, attunedByDefault: false, consumable: true,
      effectSummary: "Provides one emergency Healing Word cast from a consumable scroll.",
      synergyNote: "Returns a distant unconscious ally to the fight without spending a prepared-slot resource."
    })
  ];

  const uncommon = [
    item(ruleset, "pearl-power", "Pearl of Power", "uncommon", 5, {
      category: "wondrous-item", requiresAttunement: true, attunedByDefault: level < 17, consumable: false,
      maximumCharges: 1, recharge: "Regains its use daily at dawn.",
      effectSummary: "Uses a Magic action to restore one expended spell slot of level 3 or lower.",
      synergyNote: "Recovers Spirit Guardians, Revivify, or another critical low-level slot."
    }),
    item(ruleset, "sentinel-shield", "Sentinel Shield", "uncommon", 11, {
      category: "armor", requiresAttunement: false, attunedByDefault: false, consumable: false,
      effectSummary: "Grants Advantage on Initiative and Wisdom (Perception) checks while held.",
      synergyNote: "Helps the healer act before allies take additional damage."
    }),
    item(ruleset, "bag-holding", "Bag of Holding", "uncommon", 11, {
      category: "wondrous-item", requiresAttunement: false, attunedByDefault: false, consumable: false,
      effectSummary: "Stores up to 500 pounds of supplies in extradimensional space.",
      synergyNote: "Keeps diamonds, holy supplies, healer's kits, and backup equipment organized."
    }),
    item(ruleset, "winged-boots", "Winged Boots", "uncommon", 17, {
      category: "wondrous-item", requiresAttunement: true, attunedByDefault: false, consumable: false,
      maximumCharges: ruleset === "srd-5.2.1-2024" ? 4 : undefined,
      recharge: ruleset === "srd-5.2.1-2024"
        ? "Regains 1d4 expended charges daily at dawn."
        : "Regains 2 hours of flying capability for every 12 hours not in use.",
      effectSummary: "Provides controlled flight when attuned.",
      synergyNote: "Serves as an attunement swap for encounters where vertical positioning is essential."
    })
  ];

  const rare = [
    item(ruleset, "staff-healing", "Staff of Healing", "rare", 11, {
      category: "staff", requiresAttunement: true, attunedByDefault: true, consumable: false,
      maximumCharges: 10, recharge: "Regains 1d6 + 4 expended charges daily at dawn.",
      effectSummary: "Casts Cure Wounds, Lesser Restoration, and Mass Cure Wounds by expending charges.",
      synergyNote: "Expands Life Domain healing without consuming the Cleric's spell slots."
    }),
    item(ruleset, "necklace-prayer-beads", "Necklace of Prayer Beads", "rare", 17, {
      category: "wondrous-item", requiresAttunement: true, attunedByDefault: true, consumable: false,
      maximumCharges: 4, recharge: "Each expended bead regains its use daily at dawn.",
      effectSummary: "Prepared set: two Curing beads, one Blessing bead, and one Summons bead.",
      synergyNote: "Adds fast healing, support, and a high-impact divine request without using prepared slots."
    }),
    item(ruleset, "ring-protection", "Ring of Protection", "rare", 17, {
      category: "ring", requiresAttunement: true, attunedByDefault: false, consumable: false,
      effectSummary: "Grants +1 Armor Class and +1 to saving throws while worn and attuned.",
      synergyNote: "Provides a defensive attunement alternative when extra healing or flight is unnecessary."
    })
  ];

  const veryRare = [
    item(ruleset, "spellguard-shield", "Spellguard Shield", "very-rare", 17, {
      category: "armor", requiresAttunement: true, attunedByDefault: true, consumable: false,
      effectSummary: "Grants Advantage on saves against spells and magical effects; spell attacks against the wielder have Disadvantage.",
      synergyNote: "Protects concentration and keeps the party's healer functioning against enemy casters."
    })
  ];

  if (level === 1) return [];
  if (level <= 4) return common.slice(0, 1);
  if (level <= 10) return [...common.slice(0, 1), ...uncommon.slice(0, 1)];
  if (level <= 16) return [...common, ...uncommon.slice(0, 3), ...rare.slice(0, 1)];
  return [...common, ...uncommon, ...rare, ...veryRare];
};
