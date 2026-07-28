import type {
  DndAdvancementChoice,
  DndOptimizedBuildProfile
} from "../types/dndCharacterVault";
import type { RulesetId } from "../types/ruleCards";
import { dndRoguePregenRecords } from "./dndRoguePregens";
import { rogueMagicItemsForLevel } from "./dndVaultRogueMagicItems";

const sourceFor = (ruleset: RulesetId, kind: "class" | "feat") => ({
  label: ruleset === "srd-5.1-2014"
    ? `2014 Basic Rules — ${kind === "class" ? "Rogue" : "Customization Options"}`
    : `2024 Free Rules — ${kind === "class" ? "Rogue" : "Feats"}`,
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
  choice("srd-5.1-2014", "rogue-4-dexterity", 4, "ability-score", "Dexterity +2", "Improves accuracy, damage, Armor Class, Initiative, and core Rogue skills.", { dex: 2 }),
  choice("srd-5.1-2014", "rogue-8-dexterity", 8, "ability-score", "Dexterity +2", "Reaches Dexterity 20 before tier three.", { dex: 2 }),
  choice("srd-5.1-2014", "rogue-10-constitution", 10, "ability-score", "Constitution +2", "Adds Hit Points before high-level area damage becomes common.", { con: 2 }),
  choice("srd-5.1-2014", "rogue-12-wisdom-charisma", 12, "ability-score", "Wisdom +1, Charisma +1", "Rounds two odd scores for perception, saves, deception, and social play.", { wis: 1, cha: 1 }),
  choice("srd-5.1-2014", "rogue-16-constitution", 16, "ability-score", "Constitution +2", "Raises durability while preserving the scout and face role.", { con: 2 }),
  choice("srd-5.1-2014", "rogue-19-wisdom", 19, "ability-score", "Wisdom +2", "Improves Perception and the Wisdom saves gained through Slippery Mind.", { wis: 2 })
].filter((entry) => entry.gainedAtLevel <= level);

const choices2024 = (level: number): DndAdvancementChoice[] => [
  choice("srd-5.2.1-2024", "criminal-alert", 1, "feat", "Alert", "Adds Proficiency Bonus to Initiative and enables tactical Initiative swaps."),
  choice("srd-5.2.1-2024", "human-skilled", 1, "feat", "Skilled", "Adds Arcana, Medicine, and Navigator's Tools for broad one-shot utility."),
  choice("srd-5.2.1-2024", "rogue-4-dexterity", 4, "ability-score", "Dexterity +2", "Raises primary attacks, defenses, Initiative, and Thief skills.", { dex: 2 }),
  choice("srd-5.2.1-2024", "rogue-8-dexterity-constitution", 8, "ability-score", "Dexterity +1, Constitution +1", "Reaches Dexterity 20 and improves Hit Points.", { dex: 1, con: 1 }),
  choice("srd-5.2.1-2024", "rogue-10-constitution", 10, "ability-score", "Constitution +2", "Strengthens survivability before tier three.", { con: 2 }),
  choice("srd-5.2.1-2024", "rogue-12-wisdom", 12, "ability-score", "Wisdom +2", "Improves Perception and a common control-save weakness.", { wis: 2 }),
  choice("srd-5.2.1-2024", "rogue-16-intelligence", 16, "ability-score", "Intelligence +2", "Improves Investigation, Arcana, and Use Magic Device spell-scroll checks.", { int: 2 }),
  choice("srd-5.2.1-2024", "boon-night-spirit", 19, "feat", "Boon of the Night Spirit", "Adds Intelligence and powerful stealth and durability benefits in dim light or darkness.", { int: 1 }, "Level 19+")
].filter((entry) => entry.gainedAtLevel <= level);

export const dndVaultRogueProfiles: DndOptimizedBuildProfile[] = dndRoguePregenRecords.map((character) => {
  const is2024 = character.ruleset === "srd-5.2.1-2024";
  return {
    id: `vault-v2-${character.id}`,
    buildSlotId: character.buildSlotId,
    ruleset: character.ruleset,
    classId: character.classId,
    subclassId: character.subclassId,
    level: character.level,
    role: "scout",
    complexity: character.level <= 4 ? "beginner" : character.level <= 10 ? "standard" : "advanced",
    buildGoal: is2024
      ? "Land one dependable Sneak Attack each round, manipulate positioning with Cunning Strike, and dominate infiltration."
      : "Land one dependable Sneak Attack each round while scouting, bypassing obstacles, and avoiding return fire.",
    optimizationNotes: [
      "Dexterity reaches 20 first because one accurate Sneak Attack matters more than spreading ability increases.",
      is2024
        ? "Later Intelligence supports Use Magic Device scroll checks after Constitution and Wisdom defenses are secured."
        : "The public 2014 SRD feat selection is declined in favor of ability improvements that directly support the Thief.",
      "Magic items prioritize accuracy, stealth, tools, saving throws, and vertical access."
    ],
    tactics: [
      "Start from cover or beside an ally who can satisfy the Sneak Attack trigger.",
      "Use Cunning Action to Hide or Disengage rather than remaining exposed after attacking.",
      is2024
        ? "Use Vex or Steady Aim to establish Advantage, then spend Sneak Attack dice on Cunning Strike only when control is worth more than damage."
        : "Hold Uncanny Dodge for the largest visible attack and use Evasion to stay active through area damage.",
      "Use Fast Hands during exploration and combat whenever a tool or object can solve the problem faster than another attack."
    ],
    advancementChoices: is2024 ? choices2024(character.level) : choices2014(character.level),
    magicItems: rogueMagicItemsForLevel(character.ruleset, character.level),
    character,
    sheetVersion: 2,
    reviewStatus: "verified",
    reviewedAt: "2026-07-27"
  };
});

export const getDndVaultRogueProfile = (
  ruleset: RulesetId,
  level: number
): DndOptimizedBuildProfile | undefined => dndVaultRogueProfiles.find((profile) => (
  profile.ruleset === ruleset && profile.level === level
));
