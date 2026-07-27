import type {
  DndAbilityScores,
  DndCharacterRecord
} from "../types/dndCharacter";
import type {
  DndAdvancementChoice,
  DndOptimizedBuildProfile
} from "../types/dndCharacterVault";
import type { RulesetId } from "../types/ruleCards";
import { dndFixedHitPoints } from "../utils/dndCharacterRecord";
import { dndFighterPregenRecords } from "./dndFighterPregens";
import { fighterMagicItemsForLevel } from "./dndVaultMagicItems";

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
  choice("srd-5.1-2014", "fighter-4-strength", 4, "ability-score", "Strength +2", "Raises accuracy, weapon damage, Athletics, and carrying capacity.", { str: 2 }),
  choice("srd-5.1-2014", "fighter-6-strength", 6, "ability-score", "Strength +2", "Reaches the normal Strength maximum before tier two ends.", { str: 2 }),
  choice("srd-5.1-2014", "fighter-8-constitution", 8, "ability-score", "Constitution +2", "Adds Hit Points and improves endurance saves.", { con: 2 }),
  choice("srd-5.1-2014", "fighter-12-constitution", 12, "ability-score", "Constitution +2", "Maximizes front-line durability for three-attack rounds.", { con: 2 }),
  choice("srd-5.1-2014", "fighter-14-balanced", 14, "ability-score", "Constitution +1, Dexterity +1", "Rounds two odd scores while improving Hit Points and Initiative.", { con: 1, dex: 1 }),
  choice("srd-5.1-2014", "fighter-16-wisdom", 16, "ability-score", "Wisdom +2", "Strengthens a common high-level defensive weakness: Wisdom saves.", { wis: 2 }),
  choice("srd-5.1-2014", "fighter-19-dexterity", 19, "ability-score", "Dexterity +2", "Improves Initiative and ranged fallback accuracy.", { dex: 2 })
].filter((entry) => entry.gainedAtLevel <= level);

const choices2024 = (level: number): DndAdvancementChoice[] => [
  choice("srd-5.2.1-2024", "soldier-savage-attacker", 1, "feat", "Savage Attacker", "Improves one weapon-damage roll each turn and rewards repeated attacks."),
  choice("srd-5.2.1-2024", "human-skilled", 1, "feat", "Skilled", "Adds Medicine, Persuasion, and Smith's Tools for strong exploration utility."),
  choice("srd-5.2.1-2024", "fighter-4-great-weapon-master", 4, "feat", "Great Weapon Master", "Adds Strength, proficiency-bonus damage with a Heavy weapon once per turn, and a critical-hit or takedown follow-up attack.", { str: 1 }, "Level 4+, Strength 13+"),
  choice("srd-5.2.1-2024", "fighter-6-strength", 6, "ability-score", "Strength +2", "Reaches Strength 20 before the third attack arrives.", { str: 2 }),
  choice("srd-5.2.1-2024", "fighter-8-heavy-armor-master", 8, "feat", "Heavy Armor Master", "Adds Constitution and reduces incoming bludgeoning, piercing, and slashing damage while wearing Heavy Armor.", { con: 1 }, "Level 4+, Heavy Armor training"),
  choice("srd-5.2.1-2024", "fighter-12-resilient-wisdom", 12, "feat", "Resilient (Wisdom)", "Adds Wisdom-save proficiency before high-level charm, fear, and control effects become routine.", { wis: 1 }, "Choose an ability without saving-throw proficiency"),
  choice("srd-5.2.1-2024", "fighter-14-speedy", 14, "feat", "Speedy", "Raises Dexterity, increases Speed by 10 feet, and improves movement through threatened spaces.", { dex: 1 }, "Level 4+, Dexterity or Constitution 13+"),
  choice("srd-5.2.1-2024", "fighter-16-constitution", 16, "ability-score", "Constitution +2", "Raises durability to Constitution 18 before tier four.", { con: 2 }),
  choice("srd-5.2.1-2024", "boon-combat-prowess", 19, "feat", "Boon of Combat Prowess", "Converts one missed attack per turn into a hit and raises Wisdom to 14 for stronger perception and saves.", { wis: 1 }, "Level 19+")
].filter((entry) => entry.gainedAtLevel <= level);

const optimizedScores2024 = (level: number): DndAbilityScores => {
  const scores = { str: 17, dex: 13, con: 15, int: 10, wis: 12, cha: 8 };
  if (level >= 4) scores.str += 1;
  if (level >= 6) scores.str += 2;
  if (level >= 8) scores.con += 1;
  if (level >= 12) scores.wis += 1;
  if (level >= 14) scores.dex += 1;
  if (level >= 16) scores.con += 2;
  if (level >= 19) scores.wis += 1;
  return scores;
};

const optimizedCharacter2024 = (character: DndCharacterRecord): DndCharacterRecord => {
  const abilityScores = optimizedScores2024(character.level);
  const greatWeaponMaster = character.level >= 4
    ? " Great Weapon Master adds Proficiency Bonus damage to one Heavy-weapon hit made as part of the Attack action each turn; Hew can grant a Bonus Action attack after a critical hit or takedown."
    : "";
  return {
    ...character,
    abilityScores,
    maximumHitPoints: dndFixedHitPoints(10, character.level, abilityScores.con),
    speedFeet: character.level >= 14 ? 40 : 30,
    savingThrowProficiencies: character.level >= 12 ? ["str", "con", "wis"] : ["str", "con"],
    attacks: character.attacks.map((attack) => attack.id === "greatsword"
      ? { ...attack, notes: `${attack.notes ?? ""}${greatWeaponMaster}`.trim() }
      : attack),
    advancementChoices: choices2024(character.level).map((entry) => `Level ${entry.gainedAtLevel}: ${entry.name} — ${entry.synergyNote}`),
    notes: [
      ...character.notes,
      "Vault v2 optimization replaces generic later ASIs with Great Weapon Master, Heavy Armor Master, Resilient (Wisdom), and Speedy.",
      ...(character.level >= 8 ? ["Heavy Armor Master reduces qualifying bludgeoning, piercing, and slashing damage while Heavy Armor is worn."] : []),
      ...(character.level >= 12 ? ["Resilient (Wisdom) adds Wisdom saving throw proficiency."] : []),
      ...(character.level >= 14 ? ["Speedy increases walking Speed to 40 feet."] : [])
    ]
  };
};

export const dndVaultFighterProfiles: DndOptimizedBuildProfile[] = dndFighterPregenRecords.map((baseCharacter) => {
  const is2024 = baseCharacter.ruleset === "srd-5.2.1-2024";
  const character = is2024 ? optimizedCharacter2024(baseCharacter) : baseCharacter;
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
      ? "Deliver reliable greatsword pressure, exploit the Champion critical range, and reach priority targets."
      : "Hold the front line with a shield, steady Armor Class, reliable attacks, and strong recovery.",
    optimizationNotes: [
      is2024
        ? "Great Weapon Master and Strength 20 are prioritized before durability and mental-save defenses."
        : "The public 2014 SRD feat selection is intentionally declined because its available Grappler option is weaker for this shield defender than the selected ASIs.",
      "Wisdom and mobility weaknesses are addressed before high-level control and flying enemies become common.",
      "Magic items prioritize accuracy, durability, flight, and one emergency control option."
    ],
    tactics: [
      "Start adjacent to the most dangerous enemy that can reach a vulnerable ally.",
      "Use Action Surge when removing a priority target this round materially reduces incoming damage.",
      "Use Second Wind before one enemy turn could reasonably knock the character unconscious.",
      is2024
        ? "Apply Great Weapon Master damage to the first qualifying hit, then use Graze and Studied Attacks to preserve pressure after misses."
        : "Keep the shield equipped unless a ranged target cannot be reached safely."
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
