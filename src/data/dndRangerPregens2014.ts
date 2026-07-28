import type { DndAbilityScores, DndCharacterRecord } from "../types/dndCharacter";
import { dndAbilityModifier, dndFixedHitPoints } from "../utils/dndCharacterRecord";
import { getDndPregenBuildSlot } from "../utils/dndPregenCatalog";
import { getDndHalfCasterSlots2014 } from "./dndCasterProgression";
import {
  attainedRangerFeatures,
  dndRangerLevels,
  rangerAttackCount,
  rangerSpellCount2014,
  rangerSpells2014
} from "./dndRangerPregenShared";

const scoresForLevel = (level: number): DndAbilityScores => {
  const scores = { str: 10, dex: 17, con: 14, int: 8, wis: 16, cha: 10 };
  if (level >= 4) scores.dex += 2;
  if (level >= 8) { scores.dex += 1; scores.wis += 1; }
  if (level >= 12) { scores.wis += 1; scores.con += 1; }
  if (level >= 16) { scores.con += 1; scores.wis += 1; }
  if (level >= 19) { scores.wis += 1; scores.con += 1; }
  return scores;
};

const advancementForLevel = (level: number): string[] => attainedRangerFeatures(level, [
  [4, "Level 4 Ability Score Improvement: Dexterity +2"],
  [8, "Level 8 Ability Score Improvement: Dexterity +1, Wisdom +1"],
  [12, "Level 12 Ability Score Improvement: Wisdom +1, Constitution +1"],
  [16, "Level 16 Ability Score Improvement: Constitution +1, Wisdom +1"],
  [19, "Level 19 Ability Score Improvement: Wisdom +1, Constitution +1"]
]);

const classFeaturesForLevel = (level: number): string[] => attainedRangerFeatures(level, [
  [1, "Favored Enemy — Undead: Advantage on Survival checks to track them and Intelligence checks to recall information about them"],
  [1, "Natural Explorer — Forest: double Proficiency Bonus for related Intelligence and Wisdom checks plus travel benefits in favored terrain"],
  [2, "Fighting Style — Defense: +1 Armor Class while wearing armor"],
  [2, "Spellcasting: Wisdom is the spellcasting ability; Ranger spells are learned rather than prepared"],
  [3, "Primeval Awareness: expend a spell slot to sense selected creature types within 1 mile, or 6 miles in favored terrain"],
  [3, "Ranger Archetype — Hunter"],
  [4, "Ability Score Improvement"],
  [5, "Extra Attack: make two attacks with the Attack action"],
  [6, "Favored Enemy — Dragons and associated Draconic language"],
  [6, "Natural Explorer — Coast"],
  [8, "Ability Score Improvement"],
  [8, "Land's Stride: ignore nonmagical difficult plant terrain and gain protection against magical plants"],
  [10, "Natural Explorer — Mountain"],
  [10, "Hide in Plain Sight: spend 1 minute creating camouflage for a +10 Stealth bonus while stationary"],
  [12, "Ability Score Improvement"],
  [14, "Favored Enemy — Fiends and associated Infernal language"],
  [14, "Vanish: Hide as a Bonus Action and cannot be tracked nonmagically unless desired"],
  [16, "Ability Score Improvement"],
  [18, "Feral Senses: attack unseen creatures without Disadvantage and locate non-hidden invisible creatures within 30 feet"],
  [19, "Ability Score Improvement"],
  [20, "Foe Slayer: once per turn, add Wisdom modifier to an attack or damage roll against a favored enemy"]
]);

const subclassFeaturesForLevel = (level: number): string[] => attainedRangerFeatures(level, [
  [3, "Hunter's Prey — Colossus Slayer: once per turn, deal +1d8 weapon damage to a target missing any Hit Points"],
  [7, "Defensive Tactics — Multiattack Defense: after a creature hits you, gain +4 AC against its later attacks that turn"],
  [11, "Multiattack — Volley: Action; make one ranged attack against every creature within 10 feet of a point in weapon range"],
  [15, "Superior Hunter's Defense — Evasion: Dexterity-save effects deal no damage on a success and half on a failure"]
]);

const makeRecord = (level: number): DndCharacterRecord => {
  const slot = getDndPregenBuildSlot("srd-5.1-2014", "ranger", "hunter", level);
  if (!slot) throw new Error(`Missing 2014 Ranger / Hunter build slot at level ${level}.`);
  const abilityScores = scoresForLevel(level);
  const dexterityModifier = dndAbilityModifier(abilityScores.dex);
  const armorClass = (level >= 5 ? 12 : 11) + dexterityModifier + (level >= 2 ? 1 : 0);
  const spellcasting = level === 1 ? { kind: "none" as const } : {
    kind: "known" as const,
    ability: "wis" as const,
    cantrips: [],
    spells: rangerSpells2014(level),
    slotsByLevel: getDndHalfCasterSlots2014(level),
    notes: `Ranger table Spells Known: ${rangerSpellCount2014(level)}.`
  };
  return {
    id: `${slot.id}-eirwen-greenarrow`, buildSlotId: slot.id, ruleset: slot.ruleset,
    name: "Eirwen Greenarrow", classId: "ranger", className: "Ranger",
    subclassId: "hunter", subclassName: "Hunter", subclassUnlockLevel: 3, level,
    species: "Wood Elf", background: "Outlander", abilityScores, hitDie: 10,
    maximumHitPoints: dndFixedHitPoints(10, level, abilityScores.con), armorClass, speedFeet: 35,
    savingThrowProficiencies: ["str", "dex"],
    skillProficiencies: ["Animal Handling", "Athletics", "Perception", "Stealth", "Survival"],
    languages: ["Common", "Elvish", "Giant", ...(level >= 6 ? ["Draconic"] : []), ...(level >= 14 ? ["Infernal"] : [])],
    toolProficiencies: ["Flute"], senses: ["Darkvision 60 ft."],
    attacks: [
      { id: "longbow", name: "Longbow", attackAbility: "dex", proficient: true, damageFormula: `1d8+${dexterityModifier}`, damageType: "piercing", rangeOrReach: "150/600 ft.", notes: `Ammunition, heavy, two-handed; 20 arrows carried. Attack action: ${rangerAttackCount(level)} attack${rangerAttackCount(level) === 1 ? "" : "s"}.${level >= 3 ? " Colossus Slayer can add 1d8 once per turn." : ""}` },
      { id: "shortsword", name: "Shortsword", attackAbility: "dex", proficient: true, damageFormula: `1d6+${dexterityModifier}`, damageType: "piercing", rangeOrReach: "5 ft.", notes: "Finesse, light; two carried for close combat." }
    ],
    resources: [], spellcastingExpected: level >= 2, spellcasting,
    classFeatures: classFeaturesForLevel(level), subclassFeatures: subclassFeaturesForLevel(level),
    advancementChoices: advancementForLevel(level),
    equipment: [level >= 5 ? "Studded Leather" : "Leather Armor", "Longbow", "20 Arrows", "2 Shortswords", "Explorer's Pack", "Hunting Trap", "Flute", "Traveler's Clothes", "Trophy from an Animal"],
    currencyGp: 10,
    notes: [
      "Wood Elf Dexterity and Wisdom increases, Fleet of Foot, Mask of the Wild, Darkvision, and Fey Ancestry are included.",
      "Outlander grants Athletics, Survival, one instrument, one language, and Wanderer.",
      "Defense Fighting Style is included in Armor Class from level 2 onward.",
      "Hunter's Mark is a learned spell from level 2 and spends normal spell slots."
    ],
    sources: [
      { label: "2014 Basic Rules — Ranger and Hunter", url: "https://www.dndbeyond.com/sources/dnd/basic-rules-2014/classes", scope: "public-srd" },
      { label: "2014 Basic Rules — Wood Elf", url: "https://www.dndbeyond.com/sources/dnd/basic-rules-2014/races", scope: "public-srd" },
      { label: "2014 Basic Rules — Outlander", url: "https://www.dndbeyond.com/sources/dnd/basic-rules-2014/personality-and-background", scope: "public-srd" }
    ],
    printableSummaryReady: true
  };
};

export const dndRangerPregens2014: DndCharacterRecord[] = dndRangerLevels.map(makeRecord);
