import type { DndAbilityScores, DndCharacterRecord } from "../types/dndCharacter";
import { dndAbilityModifier, dndFixedHitPoints } from "../utils/dndCharacterRecord";
import { getDndPregenBuildSlot } from "../utils/dndPregenCatalog";
import { getDndFullCasterSlots } from "./dndCasterProgression";
import {
  attainedBardFeatures,
  bardCantrips,
  bardResources,
  bardSpellsKnown2014,
  bardicInspirationDie,
  dndBardLevels
} from "./dndBardPregenShared";

const knownCounts = [4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 15, 16, 18, 19, 19, 20, 22, 22, 22];

const scoresForLevel = (level: number): DndAbilityScores => {
  const scores = { str: 8, dex: 16, con: 14, int: 12, wis: 10, cha: 16 };
  if (level >= 4) scores.cha += 2;
  if (level >= 8) scores.cha += 2;
  if (level >= 12) scores.dex += 2;
  if (level >= 16) scores.con += 2;
  if (level >= 19) scores.dex += 2;
  return scores;
};

const advancementForLevel = (level: number): string[] => attainedBardFeatures(level, [
  [4, "Level 4 Ability Score Improvement: Charisma +2"],
  [8, "Level 8 Ability Score Improvement: Charisma +2"],
  [12, "Level 12 Ability Score Improvement: Dexterity +2"],
  [16, "Level 16 Ability Score Improvement: Constitution +2"],
  [19, "Level 19 Ability Score Improvement: Dexterity +2"]
]);

const classFeaturesForLevel = (level: number): string[] => [
  `Bardic Inspiration (${bardicInspirationDie(level)}): Bonus Action; grant one creature within 60 feet a die for an ability check, attack roll, or saving throw`,
  "Spellcasting: Charisma is the spellcasting ability; Bard spells are learned rather than prepared",
  ...attainedBardFeatures(level, [
    [2, "Jack of All Trades: add half Proficiency Bonus to ability checks that do not already include Proficiency Bonus"],
    [2, "Song of Rest (d6): allies who spend Hit Dice during a Short Rest regain an extra d6 HP"],
    [3, "Expertise: double Proficiency Bonus for Performance and Persuasion checks"],
    [4, "Ability Score Improvement"],
    [5, "Font of Inspiration: Bardic Inspiration refreshes on a Short or Long Rest"],
    [6, "Countercharm: Action; until the end of your next turn, nearby allies who can hear you have Advantage on saves against Charmed and Frightened"],
    [8, "Ability Score Improvement"],
    [9, "Song of Rest improves to d8"],
    [10, "Expertise: double Proficiency Bonus for Perception and Insight checks"],
    [10, "Magical Secrets: learn two spells from any class within the Bard spells-known count"],
    [12, "Ability Score Improvement"],
    [13, "Song of Rest improves to d10"],
    [14, "Magical Secrets: learn two additional spells from any class"],
    [15, "Bardic Inspiration improves to d12"],
    [16, "Ability Score Improvement"],
    [17, "Song of Rest improves to d12"],
    [18, "Magical Secrets: learn two additional spells from any class"],
    [19, "Ability Score Improvement"],
    [20, "Superior Inspiration: when Initiative is rolled with no Bardic Inspiration uses, regain one use"]
  ])
];

const subclassFeaturesForLevel = (level: number): string[] => attainedBardFeatures(level, [
  [3, "Bonus Proficiencies: gain Arcana, History, and Investigation proficiency"],
  [3, "Cutting Words: Reaction; expend Bardic Inspiration to subtract its roll from a visible creature's attack, ability check, or damage roll within 60 feet"],
  [6, "Additional Magical Secrets: Counterspell and Fireball count as Bard spells and do not count against spells known"],
  [14, "Peerless Skill: after an ability check roll but before the outcome, expend Bardic Inspiration and add the die"]
]);

const skillsForLevel = (level: number): string[] => [
  "Acrobatics", "Deception", "Insight", "Perception", "Performance", "Persuasion", "Stealth",
  ...(level >= 3 ? ["Arcana", "History", "Investigation"] : [])
];

const makeRecord = (level: number): DndCharacterRecord => {
  const slot = getDndPregenBuildSlot("srd-5.1-2014", "bard", "college-lore", level);
  if (!slot) throw new Error(`Missing 2014 Bard / Lore build slot at level ${level}.`);
  const abilityScores = scoresForLevel(level);
  const dexterityModifier = dndAbilityModifier(abilityScores.dex);
  const charismaModifier = dndAbilityModifier(abilityScores.cha);
  return {
    id: `${slot.id}-lyra-silverstring`, buildSlotId: slot.id, ruleset: slot.ruleset,
    name: "Lyra Silverstring", classId: "bard", className: "Bard",
    subclassId: "college-lore", subclassName: "College of Lore", subclassUnlockLevel: 3, level,
    species: "Half-Elf", background: "Entertainer", abilityScores, hitDie: 8,
    maximumHitPoints: dndFixedHitPoints(8, level, abilityScores.con),
    armorClass: (level >= 5 ? 12 : 11) + dexterityModifier, speedFeet: 30,
    savingThrowProficiencies: ["dex", "cha"], skillProficiencies: skillsForLevel(level),
    languages: ["Common", "Elvish", "Draconic"],
    toolProficiencies: ["Lute", "Flute", "Viol", "Drum", "Disguise Kit"],
    senses: ["Darkvision 60 ft."],
    attacks: [
      { id: "rapier", name: "Rapier", attackAbility: "dex", proficient: true, damageFormula: `1d8+${dexterityModifier}`, damageType: "piercing", rangeOrReach: "5 ft.", notes: "Finesse; use when a spell is unnecessary or conserving slots." },
      { id: "light-crossbow", name: "Light Crossbow", attackAbility: "dex", proficient: true, damageFormula: `1d8+${dexterityModifier}`, damageType: "piercing", rangeOrReach: "80/320 ft.", notes: "Loading, ammunition, two-handed; 20 bolts carried." }
    ],
    resources: bardResources(slot.ruleset, level, charismaModifier), spellcastingExpected: true,
    spellcasting: {
      kind: "known", ability: "cha", cantrips: bardCantrips(slot.ruleset, level),
      spells: bardSpellsKnown2014(level, knownCounts[level - 1]), slotsByLevel: getDndFullCasterSlots(level),
      notes: `Bard table Spells Known: ${knownCounts[level - 1]}.${level >= 6 ? " College of Lore adds Counterspell and Fireball outside that count." : ""}`
    },
    classFeatures: classFeaturesForLevel(level), subclassFeatures: subclassFeaturesForLevel(level),
    advancementChoices: advancementForLevel(level),
    equipment: [level >= 5 ? "Studded Leather" : "Leather Armor", "Rapier", "Light Crossbow", "20 Bolts", "Diplomat's Pack", "Lute", "Flute", "Viol", "Drum", "Disguise Kit", "Costume"],
    currencyGp: 15,
    notes: [
      "Half-Elf ability increases, Darkvision, Fey Ancestry, and Skill Versatility are included.",
      "Entertainer grants Acrobatics, Performance, Disguise Kit, one instrument, and By Popular Demand.",
      "College of Lore adds Arcana, History, and Investigation at level 3.",
      "Cutting Words and Bardic Inspiration spend the same tracked resource."
    ],
    sources: [
      { label: "2014 Basic Rules — Bard and College of Lore", url: "https://www.dndbeyond.com/sources/dnd/basic-rules-2014/classes", scope: "public-srd" },
      { label: "2014 Basic Rules — Half-Elf", url: "https://www.dndbeyond.com/sources/dnd/basic-rules-2014/races", scope: "public-srd" },
      { label: "2014 Basic Rules — Entertainer", url: "https://www.dndbeyond.com/sources/dnd/basic-rules-2014/personality-and-background", scope: "public-srd" }
    ],
    printableSummaryReady: true
  };
};

export const dndBardPregens2014: DndCharacterRecord[] = dndBardLevels.map(makeRecord);
