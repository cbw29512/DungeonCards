import type {
  DndAdvancementChoice,
  DndOptimizedBuildProfile
} from "../types/dndCharacterVault";
import type { RulesetId } from "../types/ruleCards";
import { dndWizardPregenRecords } from "./dndWizardPregens";
import { wizardMagicItemsForLevel } from "./dndVaultWizardMagicItems";

const sourceFor = (ruleset: RulesetId, kind: "class" | "feat") => ({
  label: ruleset === "srd-5.1-2014"
    ? `2014 Basic Rules — ${kind === "class" ? "Wizard" : "Customization Options"}`
    : `2024 Free Rules — ${kind === "class" ? "Wizard" : "Feats"}`,
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
  choice("srd-5.1-2014", "wizard-4-intelligence", 4, "ability-score", "Intelligence +2", "Raises spell attacks, save DC, prepared spells, and knowledge skills.", { int: 2 }),
  choice("srd-5.1-2014", "wizard-8-intelligence", 8, "ability-score", "Intelligence +2", "Reaches Intelligence 20 before tier three.", { int: 2 }),
  choice("srd-5.1-2014", "wizard-12-constitution", 12, "ability-score", "Constitution +2", "Improves Hit Points and concentration saves.", { con: 2 }),
  choice("srd-5.1-2014", "wizard-16-dexterity", 16, "ability-score", "Dexterity +2", "Improves Armor Class, Initiative, and Dexterity saves.", { dex: 2 }),
  choice("srd-5.1-2014", "wizard-19-wisdom", 19, "ability-score", "Wisdom +2", "Improves perception and mental defense at tier four.", { wis: 2 })
].filter((entry) => entry.gainedAtLevel <= level);

const choices2024 = (level: number): DndAdvancementChoice[] => [
  choice("srd-5.2.1-2024", "sage-magic-initiate", 1, "feat", "Magic Initiate (Wizard)", "Adds Message, Minor Illusion, and a free daily Shield cast while keeping Intelligence as the casting ability."),
  choice("srd-5.2.1-2024", "human-skilled", 1, "feat", "Skilled", "Adds Nature, Medicine, and Religion for broad one-shot problem solving."),
  choice("srd-5.2.1-2024", "wizard-4-intelligence", 4, "ability-score", "Intelligence +2", "Raises spell attacks, save DC, and prepared-spell effectiveness.", { int: 2 }),
  choice("srd-5.2.1-2024", "wizard-8-intelligence-constitution", 8, "ability-score", "Intelligence +1, Constitution +1", "Reaches Intelligence 20 while improving durability.", { int: 1, con: 1 }),
  choice("srd-5.2.1-2024", "wizard-12-constitution", 12, "ability-score", "Constitution +2", "Improves Hit Points and concentration saves.", { con: 2 }),
  choice("srd-5.2.1-2024", "wizard-16-dexterity", 16, "ability-score", "Dexterity +2", "Improves Armor Class, Initiative, and Dexterity saves.", { dex: 2 }),
  choice("srd-5.2.1-2024", "boon-spell-recall", 19, "feat", "Boon of Spell Recall", "Adds Wisdom and can preserve a level 1–4 spell slot when the d4 result matches the slot level.", { wis: 1 }, "Level 19+")
].filter((entry) => entry.gainedAtLevel <= level);

export const dndVaultWizardProfiles: DndOptimizedBuildProfile[] = dndWizardPregenRecords.map((character) => {
  const is2024 = character.ruleset === "srd-5.2.1-2024";
  return {
    id: `vault-v2-${character.id}`,
    buildSlotId: character.buildSlotId,
    ruleset: character.ruleset,
    classId: character.classId,
    subclassId: character.subclassId,
    level: character.level,
    role: "controller",
    complexity: character.level <= 4 ? "beginner" : character.level <= 10 ? "standard" : "advanced",
    buildGoal: "Control the battlefield, protect allies with Sculpt Spells, and end priority threats with reliable Evocation damage.",
    optimizationNotes: [
      "Intelligence reaches 20 first because save DC and prepared-spell quality drive every combat tier.",
      is2024
        ? "Constitution and Dexterity follow before Boon of Spell Recall improves slot efficiency at level 19."
        : "The public 2014 SRD feat selection is declined in favor of direct ability improvements for spellcasting and concentration.",
      "Magic items prioritize extra spells, slot recovery, defenses, and Evocation synergy."
    ],
    tactics: [
      "Open with control when it removes more enemy turns than direct damage would.",
      "Use Sculpt Spells to place area damage aggressively without catching allies.",
      "Keep Shield or Counterspell available when one enemy action could break concentration or drop the Wizard.",
      "Use Overchannel only when maximum damage is likely to end the encounter or remove a decisive threat."
    ],
    advancementChoices: is2024 ? choices2024(character.level) : choices2014(character.level),
    magicItems: wizardMagicItemsForLevel(character.ruleset, character.level),
    character,
    sheetVersion: 2,
    reviewStatus: "verified",
    reviewedAt: "2026-07-27"
  };
});

export const getDndVaultWizardProfile = (
  ruleset: RulesetId,
  level: number
): DndOptimizedBuildProfile | undefined => dndVaultWizardProfiles.find((profile) => (
  profile.ruleset === ruleset && profile.level === level
));
