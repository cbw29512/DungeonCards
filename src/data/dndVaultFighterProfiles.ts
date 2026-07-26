import { dndFighterPregenRecords } from "./dndFighterPregens";
import { fighterMagicItemsForLevel } from "./dndVaultMagicItems";
import type {
  DndAdvancementChoice,
  DndOptimizedBuildProfile
} from "../types/dndCharacterVault";
import type { RulesetId } from "../types/ruleCards";

const sourceFor = (ruleset: RulesetId, kind: "class" | "feat") => ({
  label: ruleset === "srd-5.1-2014"
    ? `2014 Basic Rules — ${kind === "class" ? "Fighter" : "Customization Options"}`
    : `2024 Free Rules — ${kind === "class" ? "Fighter" : "Feats"}`,
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
  abilityChanges?: DndAdvancementChoice["abilityChanges"]
): DndAdvancementChoice => ({
  id: `${ruleset}-${id}`,
  gainedAtLevel,
  kind,
  name,
  source: sourceFor(ruleset, kind === "feat" ? "feat" : "class"),
  synergyNote,
  abilityChanges
});

const choices2014 = (level: number): DndAdvancementChoice[] => [
  choice("srd-5.1-2014", "fighter-4-strength", 4, "ability-score", "Strength +2", "Raises accuracy, weapon damage, Athletics, and carrying capacity.", { str: 2 }),
  choice("srd-5.1-2014", "fighter-6-strength", 6, "ability-score", "Strength +2", "Reaches the normal Strength maximum before tier two ends.", { str: 2 }),
  choice("srd-5.1-2014", "fighter-8-constitution", 8, "ability-score", "Constitution +2", "Adds Hit Points and improves concentration-breaking and endurance saves.", { con: 2 }),
  choice("srd-5.1-2014", "fighter-12-constitution", 12, "ability-score", "Constitution +2", "Maximizes front-line durability for three-attack rounds.", { con: 2 }),
  choice("srd-5.1-2014", "fighter-14-balanced", 14, "ability-score", "Constitution +1, Dexterity +1", "Rounds two odd scores while improving Hit Points, Initiative, and Dexterity saves.", { con: 1, dex: 1 }),
  choice("srd-5.1-2014", "fighter-16-wisdom", 16, "ability-score", "Wisdom +2", "Strengthens a common high-level defensive weakness: Wisdom saves.", { wis: 2 }),
  choice("srd-5.1-2014", "fighter-19-dexterity", 19, "ability-score", "Dexterity +2", "Improves Initiative and ranged fallback accuracy without weakening the shield build.", { dex: 2 })
].filter((entry) => entry.gainedAtLevel <= level);

const choices2024 = (level: number): DndAdvancementChoice[] => [
  choice("srd-5.2.1-2024", "soldier-savage-attacker", 1, "feat", "Savage Attacker", "Improves one weapon-damage roll each turn and rewards the Champion's repeated attacks."),
  choice("srd-5.2.1-2024", "human-skilled", 1, "feat", "Skilled", "Adds Medicine, Persuasion, and Smith's Tools so the combat specialist remains useful between fights."),
  choice("srd-5.2.1-2024", "fighter-4-strength", 4, "ability-score", "Strength +2", "Improves attack accuracy, damage, and Strength checks.", { str: 2 }),
  choice("srd-5.2.1-2024", "fighter-6-balanced", 6, "ability-score", "Strength +1, Constitution +1", "Rounds both primary combat scores before Extra Attack scaling accelerates.", { str: 1, con: 1 }),
  choice("srd-5.2.1-2024", "fighter-8-constitution", 8, "ability-score", "Constitution +2", "Improves durability and Constitution saves.", { con: 2 }),
  choice("srd-5.2.1-2024", "fighter-12-constitution", 12, "ability-score", "Constitution +2", "Supports sustained front-line pressure during three-attack turns.", { con: 2 }),
  choice("srd-5.2.1-2024", "fighter-14-wisdom", 14, "ability-score", "Wisdom +2", "Protects the build against disabling mental effects.", { wis: 2 }),
  choice("srd-5.2.1-2024", "fighter-16-dexterity", 16, "ability-score", "Dexterity +2", "Improves Initiative and ranged backup attacks.", { dex: 2 }),
  choice("srd-5.2.1-2024", "boon-combat-prowess", 19, "feat", "Boon of Combat Prowess", "Converts one missed attack per turn into a hit and makes four-attack turns exceptionally reliable.", { dex: 1 })
].filter((entry) => entry.gainedAtLevel <= level);

export const dndVaultFighterProfiles: DndOptimizedBuildProfile[] = dndFighterPregenRecords.map((character) => {
  const is2024 = character.ruleset === "srd-5.2.1-2024";
  return {
    id: `vault-v2-${character.id}`,
    buildSlotId: character.buildSlotId,
    ruleset: character.ruleset,
    classId: character.classId,
    subclassId: character.subclassId,
    level: character.level,
    role: is2024 ? "striker" : "defender",
    complexity: character.level <= 4 ? "beginner" : character.level <= 10 ? "standard" : "advanced",
    buildGoal: is2024
      ? "Deliver reliable multiattack pressure, exploit expanded critical range, and reach any priority target."
      : "Hold the front line with a shield, steady Armor Class, reliable attacks, and strong recovery.",
    optimizationNotes: [
      is2024 ? "Strength is maximized first so every Extra Attack remains accurate." : "Strength and Constitution are maximized before secondary defenses.",
      "Wisdom and mobility weaknesses are addressed before high-level control effects become common.",
      "Magic items prioritize accuracy, durability, flight, and one emergency control option."
    ],
    tactics: [
      "Start adjacent to the most dangerous enemy that can reach a vulnerable ally.",
      "Use Action Surge when removing a priority target this round materially reduces incoming damage.",
      "Use Second Wind before dropping into a range where one enemy turn could knock the character unconscious.",
      is2024 ? "Use mastery swaps and Studied Attacks to preserve accuracy when the first attack misses." : "Keep the shield equipped unless a ranged target cannot be reached safely."
    ],
    advancementChoices: is2024 ? choices2024(character.level) : choices2014(character.level),
    magicItems: fighterMagicItemsForLevel(character.ruleset, character.level),
    character,
    sheetVersion: 2,
    reviewStatus: "verified",
    reviewedAt: "2026-07-26"
  };
});

export const getDndVaultFighterProfile = (
  ruleset: RulesetId,
  level: number
): DndOptimizedBuildProfile | undefined => dndVaultFighterProfiles.find((profile) => (
  profile.ruleset === ruleset && profile.level === level
));
