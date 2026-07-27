import type { DndOptimizedBuildProfile } from "../types/dndCharacterVault";
import type { RulesetId } from "../types/ruleCards";
import { dndClericPregenRecords } from "./dndClericPregens";
import {
  clericChoices2014,
  clericChoices2024,
  optimizeCleric2014,
  optimizeCleric2024
} from "./dndVaultClericAdvancement";
import { clericMagicItemsForLevel } from "./dndVaultClericMagicItems";

export const dndVaultClericProfiles: DndOptimizedBuildProfile[] = dndClericPregenRecords.map((baseCharacter) => {
  const is2024 = baseCharacter.ruleset === "srd-5.2.1-2024";
  const character = is2024 ? optimizeCleric2024(baseCharacter) : optimizeCleric2014(baseCharacter);
  return {
    id: `vault-v2-${character.id}`,
    buildSlotId: character.buildSlotId,
    ruleset: character.ruleset,
    classId: character.classId,
    subclassId: character.subclassId,
    level: character.level,
    role: "support",
    complexity: character.level <= 4 ? "standard" : "advanced",
    buildGoal: is2024
      ? "Maintain decisive concentration spells, stabilize allies efficiently, and preserve spell slots through Channel Divinity and magic-item healing."
      : "Keep Wisdom-maximized Cleric control active while using Life Domain healing and high Constitution to survive the front line.",
    optimizationNotes: [
      is2024
        ? "War Caster and Resilient (Constitution) protect Spirit Guardians, Bless, and other Concentration spells."
        : "Wisdom reaches 20 first; later ASIs raise Constitution to 20 because the public 2014 feat set does not improve this role more than raw durability.",
      "The item package recovers slots, adds charge-based healing, improves initiative, and protects the healer from hostile magic.",
      "Healing Word and emergency resources are reserved for unconscious or endangered allies; spell slots are not spent merely to top off safe characters."
    ],
    tactics: [
      "Open with Bless when several allies need accuracy and saving-throw support; use Spirit Guardians when sustained close-range control will decide the fight.",
      "Use Preserve Life or Staff of Healing charges before spending high-level spell slots on routine recovery.",
      "Use Healing Word to restore an unconscious ally at range while keeping the Action available for a cantrip, Dodge, or another tactical choice.",
      is2024
        ? "War Caster and Constitution-save proficiency make concentration reliable, but move behind the party when enemies can focus multiple attacks on the healer."
        : "Use the shield and heavy armor to hold safe midline positioning rather than competing with dedicated melee strikers."
    ],
    advancementChoices: is2024
      ? clericChoices2024(character.level)
      : clericChoices2014(character.level),
    magicItems: clericMagicItemsForLevel(character.ruleset, character.level),
    character,
    sheetVersion: 2,
    reviewStatus: "verified",
    reviewedAt: "2026-07-27"
  };
});

export const getDndVaultClericProfile = (
  ruleset: RulesetId,
  level: number
): DndOptimizedBuildProfile | undefined => dndVaultClericProfiles.find((profile) => (
  profile.ruleset === ruleset && profile.level === level
));
