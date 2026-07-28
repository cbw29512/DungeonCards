import type {
  DndAdvancementChoice,
  DndOptimizedBuildProfile
} from "../types/dndCharacterVault";
import type { RulesetId } from "../types/ruleCards";
import { dndRangerPregenRecords } from "./dndRangerPregens";
import { rangerMagicItemsForLevel } from "./dndVaultRangerMagicItems";

const sourceFor = (ruleset: RulesetId, kind: "class" | "feat") => ({
  label: ruleset === "srd-5.1-2014"
    ? `2014 Basic Rules — ${kind === "class" ? "Ranger" : "Customization Options"}`
    : `2024 Free Rules — ${kind === "class" ? "Ranger" : "Feats"}`,
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
  choice("srd-5.1-2014", "ranger-4-dexterity", 4, "ability-score", "Dexterity +2", "Improves ranged accuracy, damage, Armor Class, Initiative, and stealth.", { dex: 2 }),
  choice("srd-5.1-2014", "ranger-8-dexterity-wisdom", 8, "ability-score", "Dexterity +1, Wisdom +1", "Reaches Dexterity 20 while improving spells, tracking, and perception.", { dex: 1, wis: 1 }),
  choice("srd-5.1-2014", "ranger-12-wisdom-constitution", 12, "ability-score", "Wisdom +1, Constitution +1", "Rounds two defensive and spellcasting scores.", { wis: 1, con: 1 }),
  choice("srd-5.1-2014", "ranger-16-constitution-wisdom", 16, "ability-score", "Constitution +1, Wisdom +1", "Improves Hit Points, concentration, and Ranger spell DCs.", { con: 1, wis: 1 }),
  choice("srd-5.1-2014", "ranger-19-wisdom-constitution", 19, "ability-score", "Wisdom +1, Constitution +1", "Reaches Wisdom 20 and raises tier-four durability.", { wis: 1, con: 1 })
].filter((entry) => entry.gainedAtLevel <= level);

const choices2024 = (level: number): DndAdvancementChoice[] => [
  choice("srd-5.2.1-2024", "soldier-savage-attacker", 1, "feat", "Savage Attacker", "Improves one weapon-damage roll per turn before Hunter's Mark and Hunter damage are added."),
  choice("srd-5.2.1-2024", "human-skilled", 1, "feat", "Skilled", "Adds Medicine, Nature, and Thieves' Tools for exploration and party utility."),
  choice("srd-5.2.1-2024", "ranger-4-dexterity", 4, "ability-score", "Dexterity +2", "Improves ranged attacks, Armor Class, Initiative, and stealth.", { dex: 2 }),
  choice("srd-5.2.1-2024", "ranger-8-dexterity", 8, "ability-score", "Dexterity +2", "Reaches Dexterity 20 before tier-three combat.", { dex: 2 }),
  choice("srd-5.2.1-2024", "ranger-12-wisdom", 12, "ability-score", "Wisdom +2", "Improves spells, Favored Enemy support, Tireless, and Nature's Veil.", { wis: 2 }),
  choice("srd-5.2.1-2024", "ranger-16-wisdom", 16, "ability-score", "Wisdom +2", "Prepares Wisdom for the level-19 Epic Boon increase.", { wis: 2 }),
  choice("srd-5.2.1-2024", "boon-dimensional-travel", 19, "feat", "Boon of Dimensional Travel", "Reaches Wisdom 20 and adds a 30-foot teleport after the Attack or Magic action.", { wis: 1 }, "Level 19+")
].filter((entry) => entry.gainedAtLevel <= level);

export const dndVaultRangerProfiles: DndOptimizedBuildProfile[] = dndRangerPregenRecords.map((character) => {
  const is2024 = character.ruleset === "srd-5.2.1-2024";
  return {
    id: `vault-v2-${character.id}`,
    buildSlotId: character.buildSlotId,
    ruleset: character.ruleset,
    classId: character.classId,
    subclassId: character.subclassId,
    level: character.level,
    role: "striker",
    complexity: character.level <= 4 ? "beginner" : character.level <= 10 ? "standard" : "advanced",
    buildGoal: "Mark a priority target, maintain safe ranged pressure, and provide scouting, tracking, and exploration magic between fights.",
    optimizationNotes: [
      "Dexterity reaches 20 first because consistent weapon hits deliver Hunter's Mark and Hunter subclass damage.",
      "Wisdom follows for spellcasting, perception, tracking, and the 2024 Ranger's limited-use features.",
      is2024
        ? "Boon of Dimensional Travel completes Wisdom 20 and adds repositioning after the Ranger's main action."
        : "The public 2014 SRD feat selection is declined in favor of direct ranged, concentration, and spellcasting improvements.",
      "Magic items prioritize ranged damage, stealth, accuracy, saving throws, and exploration carrying capacity."
    ],
    tactics: [
      "Mark the most durable target before spending limited burst or control resources.",
      "Use terrain, range, and stealth to force enemies to spend movement before reaching the party.",
      "Use Colossus Slayer after an ally has damaged the target, or switch to Horde Breaker in the 2024 build when enemies cluster.",
      "Preserve concentration by staying at range and using defensive reactions or movement before taking unnecessary attacks."
    ],
    advancementChoices: is2024 ? choices2024(character.level) : choices2014(character.level),
    magicItems: rangerMagicItemsForLevel(character.ruleset, character.level),
    character,
    sheetVersion: 2,
    reviewStatus: "verified",
    reviewedAt: "2026-07-27"
  };
});

export const getDndVaultRangerProfile = (
  ruleset: RulesetId,
  level: number
): DndOptimizedBuildProfile | undefined => dndVaultRangerProfiles.find((profile) => (
  profile.ruleset === ruleset && profile.level === level
));
