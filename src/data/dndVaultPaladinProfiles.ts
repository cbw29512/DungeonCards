import type {
  DndAdvancementChoice,
  DndOptimizedBuildProfile
} from "../types/dndCharacterVault";
import type { RulesetId } from "../types/ruleCards";
import { dndPaladinPregenRecords } from "./dndPaladinPregens";
import { paladinMagicItemsForLevel } from "./dndVaultPaladinMagicItems";

const sourceFor = (ruleset: RulesetId, kind: "class" | "feat") => ({
  label: ruleset === "srd-5.1-2014"
    ? `2014 Basic Rules — ${kind === "class" ? "Paladin" : "Customization Options"}`
    : `2024 Free Rules — ${kind === "class" ? "Paladin" : "Feats"}`,
  url: ruleset === "srd-5.1-2014"
    ? "https://www.dndbeyond.com/sources/dnd/basic-rules-2014/classes"
    : kind === "class"
      ? "https://www.dndbeyond.com/sources/dnd/br-2024/character-classes"
      : "https://www.dndbeyond.com/sources/dnd/br-2024/feats",
  scope: "public-srd" as const
});

const choice = (
  ruleset: RulesetId,
  id: string,
  gainedAtLevel: number,
  kind: DndAdvancementChoice["kind"],
  name: string,
  synergyNote: string,
  abilityChanges?: DndAdvancementChoice["abilityChanges"],
  prerequisiteNote?: string
): DndAdvancementChoice => ({
  id: `${ruleset}-${id}`,
  gainedAtLevel,
  kind,
  name,
  source: sourceFor(ruleset, kind === "feat" ? "feat" : "class"),
  synergyNote,
  abilityChanges,
  prerequisiteNote
});

const choices2014 = (level: number): DndAdvancementChoice[] => [
  choice("srd-5.1-2014", "paladin-4-charisma", 4, "ability-score", "Charisma +2", "Improves Aura of Protection, prepared spells, spell DCs, and Sacred Weapon.", { cha: 2 }),
  choice("srd-5.1-2014", "paladin-8-charisma", 8, "ability-score", "Charisma +2", "Reaches Charisma 20 before Aura of Courage and tier-three saves.", { cha: 2 }),
  choice("srd-5.1-2014", "paladin-12-strength", 12, "ability-score", "Strength +2", "Improves attack accuracy and damage for reliable smite delivery.", { str: 2 }),
  choice("srd-5.1-2014", "paladin-16-strength", 16, "ability-score", "Strength +2", "Reaches Strength 20 before tier-four defenses.", { str: 2 }),
  choice("srd-5.1-2014", "paladin-19-constitution", 19, "ability-score", "Constitution +2", "Adds Hit Points and improves concentration saves.", { con: 2 })
].filter((entry) => entry.gainedAtLevel <= level);

const choices2024 = (level: number): DndAdvancementChoice[] => [
  choice("srd-5.2.1-2024", "soldier-savage-attacker", 1, "feat", "Savage Attacker", "Improves one weapon-damage roll per turn before smite damage is added."),
  choice("srd-5.2.1-2024", "human-skilled", 1, "feat", "Skilled", "Adds Medicine, Perception, and Smith's Tools for broader party utility."),
  choice("srd-5.2.1-2024", "paladin-4-charisma", 4, "ability-score", "Charisma +2", "Improves spells and the Paladin's future aura bonus.", { cha: 2 }),
  choice("srd-5.2.1-2024", "paladin-8-strength", 8, "ability-score", "Strength +2", "Raises weapon accuracy before tier-three combat.", { str: 2 }),
  choice("srd-5.2.1-2024", "paladin-12-strength-charisma", 12, "ability-score", "Strength +1, Charisma +1", "Reaches Strength 20 while advancing the aura and spellcasting score.", { str: 1, cha: 1 }),
  choice("srd-5.2.1-2024", "paladin-16-charisma", 16, "ability-score", "Charisma +2", "Prepares Charisma for the level-19 Epic Boon increase.", { cha: 2 }),
  choice("srd-5.2.1-2024", "boon-truesight", 19, "feat", "Boon of Truesight", "Reaches Charisma 20 and gains Truesight 60 feet.", { cha: 1 }, "Level 19+")
].filter((entry) => entry.gainedAtLevel <= level);

export const dndVaultPaladinProfiles: DndOptimizedBuildProfile[] = dndPaladinPregenRecords.map((character) => {
  const is2024 = character.ruleset === "srd-5.2.1-2024";
  return {
    id: `vault-v2-${character.id}`,
    buildSlotId: character.buildSlotId,
    ruleset: character.ruleset,
    classId: character.classId,
    subclassId: character.subclassId,
    level: character.level,
    role: "defender",
    complexity: character.level <= 4 ? "beginner" : character.level <= 10 ? "standard" : "advanced",
    buildGoal: "Anchor the front line, keep allies inside protective auras, and convert confirmed weapon hits into decisive radiant damage.",
    optimizationNotes: [
      "Charisma rises early because Aura of Protection can improve every nearby ally's saving throws.",
      "Strength reaches 20 next so attacks reliably deliver smites and Radiant Strikes.",
      is2024
        ? "Boon of Truesight finishes Charisma 20 while solving invisibility and illusion problems at tier four."
        : "The public 2014 SRD feat selection is declined in favor of direct aura, attack, and durability improvements.",
      "Magic items prioritize attack accuracy, initiative, Armor Class, saving throws, and attunement efficiency."
    ],
    tactics: [
      "Position so the largest number of allies remain inside Aura of Protection before committing to a target.",
      "Use Lay on Hands to return a fallen ally to action; preserve larger healing spends for moments when spells are unavailable.",
      "Confirm the weapon hit before spending a spell slot or free Divine Smite use.",
      "Use Sacred Weapon before a sustained fight where its attack bonus will matter across several rounds."
    ],
    advancementChoices: is2024 ? choices2024(character.level) : choices2014(character.level),
    magicItems: paladinMagicItemsForLevel(character.ruleset, character.level),
    character,
    sheetVersion: 2,
    reviewStatus: "verified",
    reviewedAt: "2026-07-27"
  };
});

export const getDndVaultPaladinProfile = (
  ruleset: RulesetId,
  level: number
): DndOptimizedBuildProfile | undefined => dndVaultPaladinProfiles.find((profile) => (
  profile.ruleset === ruleset && profile.level === level
));
