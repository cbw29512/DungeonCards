import type {
  DndAdvancementChoice,
  DndOptimizedBuildProfile
} from "../types/dndCharacterVault";
import type { RulesetId } from "../types/ruleCards";
import { dndBardPregenRecords } from "./dndBardPregens";
import { bardMagicItemsForLevel } from "./dndVaultBardMagicItems";

const sourceFor = (ruleset: RulesetId, kind: "class" | "feat") => ({
  label: ruleset === "srd-5.1-2014"
    ? `2014 Basic Rules — ${kind === "class" ? "Bard" : "Customization Options"}`
    : `2024 Free Rules — ${kind === "class" ? "Bard" : "Feats"}`,
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
  choice("srd-5.1-2014", "bard-4-charisma", 4, "ability-score", "Charisma +2", "Improves spell attacks, save DC, Inspiration uses, and social skills.", { cha: 2 }),
  choice("srd-5.1-2014", "bard-8-charisma", 8, "ability-score", "Charisma +2", "Reaches Charisma 20 before Magical Secrets.", { cha: 2 }),
  choice("srd-5.1-2014", "bard-12-dexterity", 12, "ability-score", "Dexterity +2", "Improves Armor Class, Initiative, Dexterity saves, and finesse attacks.", { dex: 2 }),
  choice("srd-5.1-2014", "bard-16-constitution", 16, "ability-score", "Constitution +2", "Improves Hit Points and concentration saves.", { con: 2 }),
  choice("srd-5.1-2014", "bard-19-dexterity", 19, "ability-score", "Dexterity +2", "Reaches Dexterity 20 for tier-four defense and Initiative.", { dex: 2 })
].filter((entry) => entry.gainedAtLevel <= level);

const choices2024 = (level: number): DndAdvancementChoice[] => [
  choice("srd-5.2.1-2024", "acolyte-magic-initiate", 1, "feat", "Magic Initiate (Cleric)", "Adds Guidance, Thaumaturgy, and a free daily Bless cast using Charisma."),
  choice("srd-5.2.1-2024", "human-skilled", 1, "feat", "Skilled", "Adds Acrobatics, Investigation, and Thieves' Tools for one-shot utility."),
  choice("srd-5.2.1-2024", "bard-4-charisma", 4, "ability-score", "Charisma +2", "Raises spell attacks, save DC, Inspiration uses, and social checks.", { cha: 2 }),
  choice("srd-5.2.1-2024", "bard-8-charisma-constitution", 8, "ability-score", "Charisma +1, Constitution +1", "Reaches Charisma 20 while improving durability.", { cha: 1, con: 1 }),
  choice("srd-5.2.1-2024", "bard-12-dexterity", 12, "ability-score", "Dexterity +2", "Improves Armor Class, Initiative, and Dexterity saves.", { dex: 2 }),
  choice("srd-5.2.1-2024", "bard-16-constitution", 16, "ability-score", "Constitution +2", "Improves Hit Points and concentration saves.", { con: 2 }),
  choice("srd-5.2.1-2024", "boon-spell-recall", 19, "feat", "Boon of Spell Recall", "Adds Wisdom and can preserve a level 1–4 spell slot when the d4 matches its level.", { wis: 1 }, "Level 19+")
].filter((entry) => entry.gainedAtLevel <= level);

export const dndVaultBardProfiles: DndOptimizedBuildProfile[] = dndBardPregenRecords.map((character) => {
  const is2024 = character.ruleset === "srd-5.2.1-2024";
  return {
    id: `vault-v2-${character.id}`,
    buildSlotId: character.buildSlotId,
    ruleset: character.ruleset,
    classId: character.classId,
    subclassId: character.subclassId,
    level: character.level,
    role: "support",
    complexity: character.level <= 4 ? "beginner" : character.level <= 10 ? "standard" : "advanced",
    buildGoal: "Control the encounter, rescue failed rolls, cover missing skills, and use Magical Secrets to fill critical party gaps.",
    optimizationNotes: [
      "Charisma reaches 20 first because it improves spellcasting, Inspiration uses, and the Bard's social role.",
      "Dexterity and Constitution then improve concentration, Initiative, Armor Class, and survivability.",
      is2024
        ? "Boon of Spell Recall improves slot efficiency while the Lore and Words spells remain outside the prepared count."
        : "The 2014 Lore discoveries remain outside spells known, while later Magical Secrets replace normal known-spell selections.",
      "Magic items prioritize extra spell access, slot recovery, concentration, and broad utility."
    ],
    tactics: [
      "Open with a control spell when it can deny more enemy actions than direct damage would.",
      "Keep one Bardic Inspiration use available for Cutting Words against a decisive hit or damage roll.",
      "Use Healing Word to return a fallen ally to action while preserving the Action for a cantrip or other task.",
      "Use Magical Secrets for effects the rest of the party cannot reliably provide."
    ],
    advancementChoices: is2024 ? choices2024(character.level) : choices2014(character.level),
    magicItems: bardMagicItemsForLevel(character.ruleset, character.level),
    character,
    sheetVersion: 2,
    reviewStatus: "verified",
    reviewedAt: "2026-07-27"
  };
});

export const getDndVaultBardProfile = (
  ruleset: RulesetId,
  level: number
): DndOptimizedBuildProfile | undefined => dndVaultBardProfiles.find((profile) => (
  profile.ruleset === ruleset && profile.level === level
));
