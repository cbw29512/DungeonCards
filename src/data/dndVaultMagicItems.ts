import type {
  DndMagicItemSelection,
  DndMagicItemRarity
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
  id: `${ruleset}-${id}`,
  name,
  rarity,
  minimumLevel,
  source: sourceFor(ruleset),
  ...options
});

export const fighterMagicItemsForLevel = (
  ruleset: RulesetId,
  level: number
): DndMagicItemSelection[] => {
  const common = [
    item(ruleset, "potion-healing", "Potion of Healing", "common", 2, {
      category: "potion", requiresAttunement: false, attunedByDefault: false, consumable: true,
      effectSummary: "Restores a small amount of Hit Points as a combat-ready consumable.",
      synergyNote: "Provides emergency recovery without spending Second Wind."
    }),
    item(ruleset, "potion-climbing", "Potion of Climbing", "common", 11, {
      category: "potion", requiresAttunement: false, attunedByDefault: false, consumable: true,
      effectSummary: "Temporarily improves climbing and difficult vertical movement.",
      synergyNote: "Lets the melee build reach elevated enemies without using an attunement slot."
    })
  ];

  const uncommon = [
    item(ruleset, "weapon-plus-1", "Weapon, +1", "uncommon", 5, {
      category: "weapon", requiresAttunement: false, attunedByDefault: false, consumable: false,
      effectSummary: "Adds a +1 bonus to attack and damage rolls with the selected primary weapon.",
      synergyNote: "Improves Champion accuracy and increases the value of every Extra Attack."
    }),
    item(ruleset, "adamantine-armor", "Adamantine Armor", "uncommon", 11, {
      category: "armor", requiresAttunement: false, attunedByDefault: false, consumable: false,
      effectSummary: "Turns incoming Critical Hits into normal hits while the armor is worn.",
      synergyNote: "Reduces burst damage against a front-line character."
    }),
    item(ruleset, "bag-holding", "Bag of Holding", "uncommon", 11, {
      category: "wondrous-item", requiresAttunement: false, attunedByDefault: false, consumable: false,
      effectSummary: "Stores a large amount of gear in extradimensional space.",
      synergyNote: "Keeps tools, backup weapons, and adventuring gear available without overloading the build."
    }),
    item(ruleset, "winged-boots", "Winged Boots", "uncommon", 17, {
      category: "wondrous-item", requiresAttunement: true, attunedByDefault: true, consumable: false,
      maximumCharges: 4, recharge: "Regains expended charges at dawn.",
      effectSummary: "Spends charges to provide a temporary Fly Speed.",
      synergyNote: "Solves the high-level melee problem of unreachable flying enemies."
    })
  ];

  const rare = [
    item(ruleset, "ring-protection", "Ring of Protection", "rare", 11, {
      category: "ring", requiresAttunement: true, attunedByDefault: true, consumable: false,
      effectSummary: "Improves Armor Class and saving throws while attuned.",
      synergyNote: "Reinforces the build's front-line durability and weak mental saves."
    }),
    item(ruleset, "weapon-plus-2", "Weapon, +2", "rare", 17, {
      category: "weapon", requiresAttunement: false, attunedByDefault: false, consumable: false,
      effectSummary: "Adds a +2 bonus to attack and damage rolls with the selected primary weapon.",
      synergyNote: "Maintains reliable accuracy against high-AC tier-four enemies."
    }),
    item(ruleset, "bead-force", "Bead of Force", "rare", 17, {
      category: "wondrous-item", requiresAttunement: false, attunedByDefault: false, consumable: true,
      effectSummary: "Creates a compact force blast and briefly contains creatures caught inside.",
      synergyNote: "Adds an emergency control option to a class with little native area control."
    })
  ];

  const veryRare = [
    item(ruleset, "frost-brand", "Frost Brand", "very-rare", 17, {
      category: "weapon", requiresAttunement: true, attunedByDefault: true, consumable: false,
      effectSummary: "Adds cold damage to weapon hits and grants protection against fire while held.",
      synergyNote: "Adds repeatable damage to every attack while covering a common elemental threat."
    })
  ];

  if (level === 1) return [];
  if (level <= 4) return common.slice(0, 1);
  if (level <= 10) return [...common.slice(0, 1), ...uncommon.slice(0, 1)];
  if (level <= 16) return [...common.slice(0, 2), ...uncommon.slice(0, 3), ...rare.slice(0, 1)];
  return [...common, ...uncommon, ...rare, ...veryRare];
};
