import type {
  DndAbilityScores,
  DndCharacterRecord
} from "../types/dndCharacter";
import {
  dndAbilityModifier,
  dndFixedHitPoints,
  dndProficiencyBonus
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
  const scores = { str: 8, dex: 17, con: 15, int: 13, wis: 12, cha: 10 };
  if (level >= 4) scores.dex += 2;
  if (level >= 8) { scores.dex += 1; scores.con += 1; }
  if (level >= 10) scores.con += 2;
  if (level >= 12) scores.wis += 2;
  if (level >= 16) scores.int += 2;
  if (level >= 19) scores.int += 1;
  return scores;
};

const advancementForLevel = (level: number): string[] => [
  "Criminal Origin Feat: Alert",
  "Human Versatile Origin Feat: Skilled (Arcana, Medicine, Navigator's Tools)",
  ...attainedRogueFeatures(level, [
    [4, "Level 4 Ability Score Improvement: Dexterity +2"],
    [8, "Level 8 Ability Score Improvement: Dexterity +1, Constitution +1"],
    [10, "Level 10 Ability Score Improvement: Constitution +2"],
    [12, "Level 12 Ability Score Improvement: Wisdom +2"],
    [16, "Level 16 Ability Score Improvement: Intelligence +2"],
    [19, "Level 19 Boon of the Night Spirit: Intelligence +1; shadow invisibility and broad damage resistance in dim light or darkness"]
  ])
];

const classFeaturesForLevel = (level: number): string[] => attainedRogueFeatures(level, [
  [1, "Expertise: double Proficiency Bonus for Sleight of Hand and Stealth checks"],
  [1, `Sneak Attack: once per turn, add ${rogueSneakAttackFormula(level)} damage with a Finesse or ranged weapon when its trigger is met`],
  [1, "Thieves' Cant and one additional language"],
  [1, "Weapon Mastery: use the mastery properties of two proficient weapon kinds"],
  [2, "Cunning Action: take Dash, Disengage, or Hide as a Bonus Action"],
  [3, "Steady Aim: Bonus Action for Advantage on the next attack when stationary; Speed becomes 0 for the turn"],
  [4, "Ability Score Improvement"],
  [5, "Cunning Strike: trade Sneak Attack dice for Poison, Trip, or Withdraw"],
  [5, "Uncanny Dodge: use a Reaction to halve one visible attack's damage"],
  [6, "Expertise: double Proficiency Bonus for Perception and Investigation checks"],
  [7, "Evasion: Dexterity-save effects deal no damage on a success and half on a failure"],
  [7, "Reliable Talent: proficient skill and tool checks treat a d20 roll of 9 or lower as 10"],
  [8, "Ability Score Improvement"],
  [10, "Ability Score Improvement"],
  [11, "Improved Cunning Strike: apply up to two Cunning Strike effects to one Sneak Attack"],
  [12, "Ability Score Improvement"],
  [14, "Devious Strikes: add Daze, Knock Out, and Obscure Cunning Strike options"],
  [15, "Slippery Mind: gain Wisdom and Charisma saving throw proficiencies"],
  [16, "Ability Score Improvement"],
  [18, "Elusive: attacks cannot have Advantage against you while you are not Incapacitated"],
  [19, "Epic Boon — Boon of the Night Spirit"],
  [20, "Stroke of Luck: turn one failed D20 Test into a 20; refresh on a Short or Long Rest"]
]);

const subclassFeaturesForLevel = (level: number): string[] => attainedRogueFeatures(level, [
  [3, "Fast Hands: as a Bonus Action, pick a lock, disarm a trap, pick a pocket, Utilize an object, or activate a qualifying magic item"],
  [3, "Second-Story Work: gain a Climb Speed equal to Speed and calculate jump distance with Dexterity"],
  [9, "Supreme Sneak — Stealth Attack: spend 1d6 Sneak Attack damage to preserve Invisible when ending behind strong cover"],
  [13, "Use Magic Device: four attunement slots, charge preservation, and broad spell-scroll access using Intelligence"],
  [17, "Thief's Reflexes: take a second turn at Initiative minus 10 during the first combat round"]
]);

const makeRecord = (level: number): DndCharacterRecord => {
  const slot = getDndPregenBuildSlot("srd-5.2.1-2024", "rogue", "thief", level);
  if (!slot) throw new Error(`Missing 2024 Rogue build slot at level ${level}.`);
  const abilityScores = scoresForLevel(level);
  const dexterityModifier = dndAbilityModifier(abilityScores.dex);
  const cunningStrikeDc = 8 + dexterityModifier + dndProficiencyBonus(level);
  return {
    id: `${slot.id}-tamsin-lockmere`,
    buildSlotId: slot.id,
    ruleset: slot.ruleset,
    name: "Tamsin Lockmere",
    classId: "rogue",
    className: "Rogue",
    subclassId: "thief",
    subclassName: "Thief",
    subclassUnlockLevel: 3,
    level,
    species: "Human",
    background: "Criminal",
    abilityScores,
    hitDie: 8,
    maximumHitPoints: dndFixedHitPoints(8, level, abilityScores.con),
    armorClass: 11 + dexterityModifier,
    speedFeet: 30,
    savingThrowProficiencies: level >= 15 ? ["dex", "int", "wis", "cha"] : ["dex", "int"],
    skillProficiencies: ["Acrobatics", "Arcana", "Deception", "Insight", "Investigation", "Medicine", "Perception", "Sleight of Hand", "Stealth", "Survival"],
    languages: ["Common", "Elvish", "Thieves' Cant"],
    toolProficiencies: ["Thieves' Tools", "Navigator's Tools"],
    senses: ["Normal vision"],
    attacks: [
      { id: "shortbow", name: "Shortbow", attackAbility: "dex", proficient: true, damageFormula: `1d6+${dexterityModifier}`, damageType: "piercing", rangeOrReach: "80/320 ft.", notes: rogueAttackNotes(level, " Vex mastery; 20 arrows carried.") },
      { id: "shortsword", name: "Shortsword", attackAbility: "dex", proficient: true, damageFormula: `1d6+${dexterityModifier}`, damageType: "piercing", rangeOrReach: "5 ft.", notes: rogueAttackNotes(level, " Finesse, light; Vex mastery.") },
      { id: "dagger", name: "Dagger", attackAbility: "dex", proficient: true, damageFormula: `1d4+${dexterityModifier}`, damageType: "piercing", rangeOrReach: "5 ft. or 20/60 ft.", notes: rogueAttackNotes(level, " Finesse, light, thrown; Nick mastery; 2 carried.") }
    ],
    resources: rogueResources(slot.ruleset, level),
    spellcastingExpected: false,
    spellcasting: { kind: "none" },
    classFeatures: [
      ...classFeaturesForLevel(level),
      ...(level >= 5 ? [`Cunning Strike save DC: ${cunningStrikeDc}`] : [])
    ],
    subclassFeatures: subclassFeaturesForLevel(level),
    advancementChoices: advancementForLevel(level),
    equipment: ["Leather Armor", "Shortsword", "Shortbow", "20 Arrows", "2 Daggers", "Thieves' Tools", "Burglar's Pack", "Criminal Background Equipment", "Navigator's Tools"],
    currencyGp: 8,
    notes: [
      "Criminal grants Alert, Sleight of Hand, Stealth, Thieves' Tools, and Dexterity/Constitution/Intelligence ability options; selected increases are included.",
      "Human grants Resourceful, Skillful (Insight), and Versatile; Skilled supplies Arcana, Medicine, and Navigator's Tools.",
      "Expertise applies to Sleight of Hand and Stealth at level 1, then Perception and Investigation at level 6.",
      "Shortbow and Dagger are the default Weapon Mastery choices; they can change after a Long Rest.",
      ...(level >= 13 ? ["Use Magic Device permits four attuned items, but the Vault preset keeps three attuned by default for compatibility with the shared tracker."] : [])
    ],
    sources: [
      { label: "2024 Free Rules — Rogue and Thief", url: "https://www.dndbeyond.com/sources/dnd/br-2024/character-classes", scope: "public-srd" },
      { label: "2024 Free Rules — Character Origins", url: "https://www.dndbeyond.com/sources/dnd/br-2024/character-origins", scope: "public-srd" },
      { label: "2024 Free Rules — Feats", url: "https://www.dndbeyond.com/sources/dnd/br-2024/feats", scope: "public-srd" },
      { label: "2024 Free Rules — Equipment", url: "https://www.dndbeyond.com/sources/dnd/br-2024/equipment", scope: "public-srd" }
    ],
    printableSummaryReady: true
  };
};

export const dndRoguePregens2024: DndCharacterRecord[] = dndRogueLevels.map(makeRecord);
