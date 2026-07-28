import type {
  DndAbilityScores,
  DndCharacterRecord
} from "../types/dndCharacter";
import {
  dndAbilityModifier,
  dndFixedHitPoints
} from "../utils/dndCharacterRecord";
import { getDndPregenBuildSlot } from "../utils/dndPregenCatalog";
import {
  attainedRogueFeatures,
  dndRogueLevels,
  rogueAttackNotes,
  rogueResources,
  rogueSneakAttackFormula
} from "./dndRoguePregenShared";

const scoresForLevel = (level: number): DndAbilityScores => {
  const scores = { str: 9, dex: 16, con: 14, int: 11, wis: 13, cha: 15 };
  if (level >= 4) scores.dex += 2;
  if (level >= 8) scores.dex += 2;
  if (level >= 10) scores.con += 2;
  if (level >= 12) { scores.wis += 1; scores.cha += 1; }
  if (level >= 16) scores.con += 2;
  if (level >= 19) scores.wis += 2;
  return scores;
};

const advancementForLevel = (level: number): string[] => attainedRogueFeatures(level, [
  [4, "Level 4 Ability Score Improvement: Dexterity +2"],
  [8, "Level 8 Ability Score Improvement: Dexterity +2"],
  [10, "Level 10 Ability Score Improvement: Constitution +2"],
  [12, "Level 12 Ability Score Improvement: Wisdom +1, Charisma +1"],
  [16, "Level 16 Ability Score Improvement: Constitution +2"],
  [19, "Level 19 Ability Score Improvement: Wisdom +2"]
]);

const classFeaturesForLevel = (level: number): string[] => attainedRogueFeatures(level, [
  [1, "Expertise: double Proficiency Bonus for Stealth and Thieves' Tools checks"],
  [1, `Sneak Attack: once per turn, add ${rogueSneakAttackFormula(level)} damage with a Finesse or ranged weapon when its trigger is met`],
  [1, "Thieves' Cant"],
  [2, "Cunning Action: take Dash, Disengage, or Hide as a Bonus Action"],
  [4, "Ability Score Improvement"],
  [5, "Uncanny Dodge: use a Reaction to halve one visible attack's damage"],
  [6, "Expertise: double Proficiency Bonus for Perception and Investigation checks"],
  [7, "Evasion: Dexterity-save effects deal no damage on a success and half on a failure"],
  [8, "Ability Score Improvement"],
  [10, "Ability Score Improvement"],
  [11, "Reliable Talent: proficient ability checks treat a d20 roll of 9 or lower as 10"],
  [12, "Ability Score Improvement"],
  [14, "Blindsense: locate hidden or invisible creatures within 10 feet while able to hear"],
  [15, "Slippery Mind: gain Wisdom saving throw proficiency"],
  [16, "Ability Score Improvement"],
  [18, "Elusive: attacks cannot have Advantage against you while you are not Incapacitated"],
  [19, "Ability Score Improvement"],
  [20, "Stroke of Luck: turn one missed attack into a hit or failed ability check into a 20; refresh on a Short or Long Rest"]
]);

const subclassFeaturesForLevel = (level: number): string[] => attainedRogueFeatures(level, [
  [3, "Fast Hands: Cunning Action can make a Sleight of Hand check, use Thieves' Tools, or use an object"],
  [3, "Second-Story Work: climbing costs no extra movement and running jumps gain Dexterity modifier feet"],
  [9, "Supreme Sneak: Advantage on Stealth checks when moving no more than half Speed that turn"],
  [13, "Use Magic Device: ignore class, species, and level requirements when using magic items"],
  [17, "Thief's Reflexes: take a second turn at Initiative minus 10 during the first combat round when not surprised"]
]);

const makeRecord = (level: number): DndCharacterRecord => {
  const slot = getDndPregenBuildSlot("srd-5.1-2014", "rogue", "thief", level);
  if (!slot) throw new Error(`Missing 2014 Rogue build slot at level ${level}.`);
  const abilityScores = scoresForLevel(level);
  const dexterityModifier = dndAbilityModifier(abilityScores.dex);
  return {
    id: `${slot.id}-mira-quickstep`,
    buildSlotId: slot.id,
    ruleset: slot.ruleset,
    name: "Mira Quickstep",
    classId: "rogue",
    className: "Rogue",
    subclassId: "thief",
    subclassName: "Thief",
    subclassUnlockLevel: 3,
    level,
    species: "Human",
    background: "Charlatan",
    abilityScores,
    hitDie: 8,
    maximumHitPoints: dndFixedHitPoints(8, level, abilityScores.con),
    armorClass: 11 + dexterityModifier,
    speedFeet: 30,
    savingThrowProficiencies: level >= 15 ? ["dex", "int", "wis"] : ["dex", "int"],
    skillProficiencies: ["Acrobatics", "Deception", "Investigation", "Perception", "Sleight of Hand", "Stealth"],
    languages: ["Common", "Elvish", "Thieves' Cant"],
    toolProficiencies: ["Thieves' Tools", "Disguise Kit", "Forgery Kit"],
    senses: level >= 14 ? ["Normal vision", "Blindsense 10 ft. while able to hear"] : ["Normal vision"],
    attacks: [
      { id: "rapier", name: "Rapier", attackAbility: "dex", proficient: true, damageFormula: `1d8+${dexterityModifier}`, damageType: "piercing", rangeOrReach: "5 ft.", notes: rogueAttackNotes(level) },
      { id: "shortbow", name: "Shortbow", attackAbility: "dex", proficient: true, damageFormula: `1d6+${dexterityModifier}`, damageType: "piercing", rangeOrReach: "80/320 ft.", notes: rogueAttackNotes(level, " Ammunition; 20 arrows carried.") },
      { id: "dagger", name: "Dagger", attackAbility: "dex", proficient: true, damageFormula: `1d4+${dexterityModifier}`, damageType: "piercing", rangeOrReach: "5 ft. or 20/60 ft.", notes: rogueAttackNotes(level, " Finesse, light, thrown; 2 carried.") }
    ],
    resources: rogueResources(slot.ruleset, level),
    spellcastingExpected: false,
    spellcasting: { kind: "none" },
    classFeatures: classFeaturesForLevel(level),
    subclassFeatures: subclassFeaturesForLevel(level),
    advancementChoices: advancementForLevel(level),
    equipment: ["Leather Armor", "Rapier", "Shortbow", "20 Arrows", "2 Daggers", "Thieves' Tools", "Burglar's Pack", "Disguise Kit", "Forgery Kit", "Fine Clothes"],
    currencyGp: 15,
    notes: [
      "Human ability increases are included in the listed scores.",
      "Charlatan supplies Deception, Sleight of Hand, Disguise Kit, Forgery Kit, and False Identity.",
      "Expertise applies to Stealth and Thieves' Tools at level 1, then Perception and Investigation at level 6.",
      "Apply Sneak Attack only once per turn, even when more than one attack hits."
    ],
    sources: [
      { label: "2014 Basic Rules — Rogue and Thief", url: "https://www.dndbeyond.com/sources/dnd/basic-rules-2014/classes", scope: "public-srd" },
      { label: "2014 Basic Rules — Human", url: "https://www.dndbeyond.com/sources/dnd/basic-rules-2014/races", scope: "public-srd" },
      { label: "2014 Basic Rules — Charlatan", url: "https://www.dndbeyond.com/sources/dnd/basic-rules-2014/personality-and-background", scope: "public-srd" }
    ],
    printableSummaryReady: true
  };
};

export const dndRoguePregens2014: DndCharacterRecord[] = dndRogueLevels.map(makeRecord);
