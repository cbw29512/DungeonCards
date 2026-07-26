import type { DndAbilityScores, DndCharacterRecord } from "../types/dndCharacter";
import { dndAbilityModifier, dndFixedHitPoints } from "../utils/dndCharacterRecord";
import { getDndPregenBuildSlot } from "../utils/dndPregenCatalog";
import {
  attainedBarbarianFeatures,
  barbarianAttackCount,
  barbarianLevels,
  barbarianRageDamage,
  barbarianRageResource,
  barbarianUnarmoredAc
} from "./dndBarbarianPregenShared";

const abilityScores2014 = (level: number): DndAbilityScores => {
  const scores = { str: 16, dex: 14, con: 15, int: 9, wis: 13, cha: 11 };
  if (level >= 4) scores.str += 2;
  if (level >= 8) scores.str += 2;
  if (level >= 12) scores.con += 2;
  if (level >= 16) scores.con += 2;
  if (level >= 19) { scores.con += 1; scores.wis += 1; }
  if (level >= 20) { scores.str += 4; scores.con += 4; }
  return scores;
};

const choices2014 = (level: number): string[] => attainedBarbarianFeatures(level, [
  [4, "Level 4 Ability Score Improvement: Strength +2"],
  [8, "Level 8 Ability Score Improvement: Strength +2"],
  [12, "Level 12 Ability Score Improvement: Constitution +2"],
  [16, "Level 16 Ability Score Improvement: Constitution +2"],
  [19, "Level 19 Ability Score Improvement: Constitution +1, Wisdom +1"]
]);

const classFeatures2014 = (level: number): string[] => attainedBarbarianFeatures(level, [
  [1, "Rage: Bonus Action; Strength Advantage, +Rage damage, and resistance to bludgeoning, piercing, and slashing damage"],
  [1, "Unarmored Defense: AC equals 10 + Dexterity modifier + Constitution modifier"],
  [2, "Reckless Attack: gain Advantage on Strength melee attacks this turn; attacks against you gain Advantage until your next turn"],
  [2, "Danger Sense: Advantage on visible Dexterity saves while not blinded, deafened, or incapacitated"],
  [5, "Extra Attack: make two attacks with the Attack action"],
  [5, "Fast Movement: Speed increases by 10 feet while not wearing Heavy armor"],
  [7, "Feral Instinct: Advantage on Initiative; act while surprised by entering Rage first"],
  [9, "Brutal Critical: add one weapon damage die on a melee critical hit"],
  [11, "Relentless Rage: while raging, DC 10 Constitution save to remain at 1 HP; DC rises by 5 until a rest"],
  [13, "Brutal Critical: add two weapon damage dice on a melee critical hit"],
  [15, "Persistent Rage: Rage ends early only if unconscious or ended voluntarily"],
  [17, "Brutal Critical: add three weapon damage dice on a melee critical hit"],
  [18, "Indomitable Might: use Strength score when a Strength check total is lower"],
  [20, "Primal Champion: Strength and Constitution increase by 4, with maximums of 24"]
]);

const subclassFeatures2014 = (level: number): string[] => attainedBarbarianFeatures(level, [
  [3, "Frenzy: when entering Rage, choose Frenzy; on later turns make one melee weapon attack as a Bonus Action, then gain one Exhaustion level when Rage ends"],
  [6, "Mindless Rage: while raging, you cannot be charmed or frightened; existing effects are suspended"],
  [10, "Intimidating Presence: Action; one creature within 30 feet makes a Wisdom save against DC 8 + Proficiency Bonus + Charisma modifier or becomes frightened"],
  [14, "Retaliation: Reaction; after a creature within 5 feet damages you, make one melee weapon attack against it"]
]);

const makeBarbarian2014 = (level: number): DndCharacterRecord => {
  const slot = getDndPregenBuildSlot("srd-5.1-2014", "barbarian", "path-berserker", level);
  if (!slot) throw new Error(`Missing 2014 Barbarian build slot at level ${level}.`);
  const abilityScores = abilityScores2014(level);
  const strengthModifier = dndAbilityModifier(abilityScores.str);
  const rageDamage = barbarianRageDamage(level);
  return {
    id: `${slot.id}-thora-ashwalker`, buildSlotId: slot.id, ruleset: slot.ruleset,
    name: "Thora Ashwalker", classId: "barbarian", className: "Barbarian",
    subclassId: "path-berserker", subclassName: "Path of the Berserker", subclassUnlockLevel: 3,
    level, species: "Human", background: "Outlander", abilityScores, hitDie: 12,
    maximumHitPoints: dndFixedHitPoints(12, level, abilityScores.con),
    armorClass: barbarianUnarmoredAc(abilityScores), speedFeet: level >= 5 ? 40 : 30,
    savingThrowProficiencies: ["str", "con"],
    skillProficiencies: ["Athletics", "Intimidation", "Perception", "Survival"],
    languages: ["Common", "Dwarvish", "Orc"], toolProficiencies: ["Drum"], senses: ["Normal vision"],
    attacks: [
      { id: "greataxe", name: "Greataxe", attackAbility: "str", proficient: true, damageFormula: `1d12+${strengthModifier}`, damageType: "slashing", rangeOrReach: "5 ft.", notes: `Add +${rageDamage} damage while raging. Attack action: ${barbarianAttackCount(level)} attack${barbarianAttackCount(level) === 1 ? "" : "s"}.${level >= 3 ? " Frenzy can add one Bonus Action attack after the Rage-entry turn." : ""}` },
      { id: "javelin", name: "Javelin", attackAbility: "str", proficient: true, damageFormula: `1d6+${strengthModifier}`, damageType: "piercing", rangeOrReach: "30/120 ft.", notes: "Four carried." }
    ],
    resources: [barbarianRageResource(level, "2014")], spellcastingExpected: false, spellcasting: { kind: "none" },
    classFeatures: classFeatures2014(level), subclassFeatures: subclassFeatures2014(level), advancementChoices: choices2014(level),
    equipment: ["Greataxe", "2 Handaxes", "4 Javelins", "Explorer's Pack", "Staff", "Hunting Trap", "Traveler's Clothes", "Drum"], currencyGp: 10,
    notes: ["Human ability increases are included.", "Outlander grants Athletics, Survival, one instrument, one language, and Wanderer.", `Rage damage bonus is +${rageDamage}.`, `Attack action makes ${barbarianAttackCount(level)} attack${barbarianAttackCount(level) === 1 ? "" : "s"}.`],
    sources: [
      { label: "2014 Basic Rules — Barbarian and Path of the Berserker", url: "https://www.dndbeyond.com/sources/dnd/basic-rules-2014/classes", scope: "public-srd" },
      { label: "2014 Basic Rules — Human", url: "https://www.dndbeyond.com/sources/dnd/basic-rules-2014/races", scope: "public-srd" },
      { label: "2014 Basic Rules — Outlander", url: "https://www.dndbeyond.com/sources/dnd/basic-rules-2014/personality-and-background", scope: "public-srd" }
    ],
    printableSummaryReady: true
  };
};

export const dndBarbarian2014Pregens = barbarianLevels.map(makeBarbarian2014);
