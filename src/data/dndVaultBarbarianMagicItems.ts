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
  id: `${ruleset}-barbarian-${id}`,
  name,
  rarity,
  minimumLevel,
  source: sourceFor(ruleset),
  ...options
});

export const barbarianMagicItemsForLevel = (
  ruleset: RulesetId,
  level: number
): DndMagicItemSelection[] => {
  const common = [
    item(ruleset, "potion-healing", "Potion of Healing", "common", 2, {
      category: "potion", requiresAttunement: false, attunedByDefault: false, consumable: true,
      effectSummary: "Restores 2d4 + 2 Hit Points.",
      synergyNote: "Provides recovery when Rage resistance is not enough to stay standing."
    }),
    item(ruleset, "potion-climbing", "Potion of Climbing", "common", 11, {
      category: "potion", requiresAttunement: false, attunedByDefault: false, consumable: true,
      effectSummary: "Grants a Climb Speed equal to Speed for 1 hour and improves Athletics checks made to climb.",
      synergyNote: "Uses the Barbarian's excellent Athletics while solving vertical encounters without attunement."
    })
  ];

  const wingedBoots = item(ruleset, "winged-boots", "Winged Boots", "uncommon", 11, {
    category: "wondrous-item", requiresAttunement: true, attunedByDefault: true, consumable: false,
    maximumCharges: ruleset === "srd-5.2.1-2024" ? 4 : undefined,
    recharge: ruleset === "srd-5.2.1-2024"
      ? "Regains 1d4 expended charges daily at dawn."
      : "Regains 2 hours of flying capability for every 12 hours not in use.",
    effectSummary: ruleset === "srd-5.2.1-2024"
      ? "Spend 1 charge as a Magic action to gain a 30-foot Fly Speed for 1 hour."
      : "Provides a Fly Speed equal to walking Speed for up to 4 total hours.",
    synergyNote: "Lets a melee Rage build reach flying enemies and elevated objectives."
  });

  const uncommon = [
    item(ruleset, "weapon-plus-1", "Weapon, +1", "uncommon", 5, {
      category: "weapon", requiresAttunement: false, attunedByDefault: false, consumable: false,
      effectSummary: "Adds +1 to attack and damage rolls with the primary greataxe.",
      synergyNote: "Improves every Reckless, Rage, Frenzy, and critical-hit sequence."
    }),
    wingedBoots,
    item(ruleset, "bag-holding", "Bag of Holding", "uncommon", 11, {
      category: "wondrous-item", requiresAttunement: false, attunedByDefault: false, consumable: false,
      effectSummary: "Stores up to 500 pounds of equipment in extradimensional space.",
      synergyNote: "Carries backup weapons and adventuring gear without sacrificing mobility."
    }),
    item(ruleset, "stone-good-luck", "Stone of Good Luck", "uncommon", 17, {
      category: "wondrous-item", requiresAttunement: true, attunedByDefault: false, consumable: false,
      effectSummary: "Grants +1 to ability checks and saving throws while carried and attuned.",
      synergyNote: "Can replace a mobility attunement when a difficult saving-throw day is expected."
    })
  ];

  const rare = [
    item(ruleset, "bracers-defense", "Bracers of Defense", "rare", 11, {
      category: "wondrous-item", requiresAttunement: true, attunedByDefault: true, consumable: false,
      effectSummary: "Grants +2 Armor Class while wearing no armor and using no Shield.",
      synergyNote: "Directly improves Barbarian Unarmored Defense without blocking a two-handed weapon."
    }),
    item(ruleset, "ring-protection", "Ring of Protection", "rare", 17, {
      category: "ring", requiresAttunement: true, attunedByDefault: false, consumable: false,
      effectSummary: "Grants +1 Armor Class and +1 to saving throws while worn and attuned.",
      synergyNote: "Provides a defensive attunement swap when flight or Strength replacement is unnecessary."
    }),
    item(ruleset, "weapon-plus-2", "Weapon, +2", "rare", 17, {
      category: "weapon", requiresAttunement: false, attunedByDefault: false, consumable: false,
      effectSummary: "Adds +2 to attack and damage rolls with the primary greataxe.",
      synergyNote: "Keeps tier-four Reckless attacks accurate against high Armor Class."
    })
  ];

  const veryRare = [
    item(ruleset, "belt-fire-giant", "Belt of Fire Giant Strength", "very-rare", 17, {
      category: "wondrous-item", requiresAttunement: true, attunedByDefault: true, consumable: false,
      effectSummary: "Sets Strength to 25 while worn unless the character's unmodified Strength is already 25 or higher.",
      synergyNote: "Maximizes attacks, damage, Athletics, Rage checks, and Strength saves throughout tier four."
    })
  ];

  if (level === 1) return [];
  if (level <= 4) return common.slice(0, 1);
  if (level <= 10) return [...common.slice(0, 1), ...uncommon.slice(0, 1)];
  if (level <= 16) return [...common, ...uncommon.slice(0, 3), ...rare.slice(0, 1)];
  return [...common, ...uncommon, ...rare, ...veryRare];
};
