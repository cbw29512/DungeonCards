import type { DndAbilityScores, DndCharacterRecord } from "../types/dndCharacter";
import { dndAbilityModifier, dndFixedHitPoints } from "../utils/dndCharacterRecord";
import { getDndPregenBuildSlot } from "../utils/dndPregenCatalog";
import { getDndFullCasterSlots } from "./dndCasterProgression";
import {
  attainedBardFeatures,
  bardCantrips,
  bardPreparedSpells2024,
  bardResources,
  bardicInspirationDie,
  dndBardLevels
} from "./dndBardPregenShared";

const preparedCounts = [4, 5, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 17, 18, 18, 19, 20, 21, 22];

const scoresForLevel = (level: number): DndAbilityScores => {
  const scores = { str: 8, dex: 14, con: 13, int: 10, wis: 13, cha: 17 };
  if (level >= 4) scores.cha += 2;
  if (level >= 8) { scores.cha += 1; scores.con += 1; }
  if (level >= 12) scores.dex += 2;
  if (level >= 16) scores.con += 2;
  if (level >= 19) scores.wis += 1;
  return scores;
};

const advancementForLevel = (level: number): string[] => [
  "Acolyte Origin Feat: Magic Initiate (Cleric) — Guidance, Thaumaturgy, Bless; Charisma is the spellcasting ability",
  "Human Versatile Origin Feat: Skilled — Acrobatics, Investigation, Thieves' Tools",
  ...attainedBardFeatures(level, [
    [4, "Level 4 Ability Score Improvement: Charisma +2"],
    [8, "Level 8 Ability Score Improvement: Charisma +1, Constitution +1"],
    [12, "Level 12 Ability Score Improvement: Dexterity +2"],
    [16, "Level 16 Ability Score Improvement: Constitution +2"],
    [19, "Level 19 Boon of Spell Recall: Wisdom +1; a level 1–4 spell may preserve its slot when a d4 matches the slot level"]
  ])
];

const classFeaturesForLevel = (level: number): string[] => [
  `Bardic Inspiration (${bardicInspirationDie(level)}): Bonus Action; another creature within 60 feet gains a die it can add after failing a D20 Test within 1 hour`,
  "Spellcasting: Charisma is the spellcasting ability; the Bard table determines prepared spells",
  ...attainedBardFeatures(level, [
    [2, "Expertise: double Proficiency Bonus for Performance and Persuasion checks"],
    [2, "Jack of All Trades: add half Proficiency Bonus to ability checks that do not already include Proficiency Bonus"],
    [3, "Bard Subclass — College of Lore"],
    [4, "Ability Score Improvement"],
    [5, "Font of Inspiration: Bardic Inspiration refreshes on a Short or Long Rest; a spell slot can restore one use"],
    [7, "Countercharm: Reaction; reroll a failed save against Charmed or Frightened with Advantage for a creature within 30 feet"],
    [8, "Ability Score Improvement"],
    [9, "Expertise: double Proficiency Bonus for Perception and Insight checks"],
    [10, "Magical Secrets: new and replacement prepared spells may come from Bard, Cleric, Druid, or Wizard lists"],
    [12, "Ability Score Improvement"],
    [16, "Ability Score Improvement"],
    [18, "Superior Inspiration: when Initiative is rolled with fewer than two uses, regain uses until two remain"],
    [19, "Epic Boon — Boon of Spell Recall"],
    [20, "Words of Creation: Power Word Heal and Power Word Kill are always prepared and can each target a second nearby creature"]
  ])
];

const subclassFeaturesForLevel = (level: number): string[] => attainedBardFeatures(level, [
  [3, "Bonus Proficiencies: gain Arcana, History, and Medicine proficiency"],
  [3, "Cutting Words: Reaction; after a visible creature within 60 feet rolls damage or succeeds on a check or attack, expend Bardic Inspiration and subtract the die"],
  [6, "Magical Discoveries: Counterspell and Fireball are always prepared outside the Bard prepared-spell count"],
  [14, "Peerless Skill: after failing an ability check or attack roll, add Bardic Inspiration; the use is not expended if the roll still fails"]
]);

const skillsForLevel = (level: number): string[] => [
  "Acrobatics", "Deception", "Insight", "Investigation", "Perception", "Performance", "Persuasion", "Religion", "Stealth",
  ...(level >= 3 ? ["Arcana", "History", "Medicine"] : [])
];

const makeRecord = (level: number): DndCharacterRecord => {
  const slot = getDndPregenBuildSlot("srd-5.2.1-2024", "bard", "college-lore", level);
  if (!slot) throw new Error(`Missing 2024 Bard / Lore build slot at level ${level}.`);
  const abilityScores = scoresForLevel(level);
  const dexterityModifier = dndAbilityModifier(abilityScores.dex);
  const charismaModifier = dndAbilityModifier(abilityScores.cha);
  const alwaysPrepared = ["Bless", ...(level >= 6 ? ["Counterspell", "Fireball"] : []), ...(level >= 20 ? ["Power Word Heal", "Power Word Kill"] : [])];
  return {
    id: `${slot.id}-mara-brightquill`, buildSlotId: slot.id, ruleset: slot.ruleset,
    name: "Mara Brightquill", classId: "bard", className: "Bard",
    subclassId: "college-lore", subclassName: "College of Lore", subclassUnlockLevel: 3, level,
    species: "Human", background: "Acolyte", abilityScores, hitDie: 8,
    maximumHitPoints: dndFixedHitPoints(8, level, abilityScores.con),
    armorClass: (level >= 5 ? 12 : 11) + dexterityModifier, speedFeet: 30,
    savingThrowProficiencies: ["dex", "cha"], skillProficiencies: skillsForLevel(level),
    languages: ["Common", "Celestial", "Elvish"],
    toolProficiencies: ["Lute", "Flute", "Viol", "Calligrapher's Supplies", "Thieves' Tools"],
    senses: ["Normal vision"],
    attacks: [
      { id: "dagger", name: "Dagger", attackAbility: "dex", proficient: true, damageFormula: `1d4+${dexterityModifier}`, damageType: "piercing", rangeOrReach: "5 ft. or 20/60 ft.", notes: "Finesse, light, thrown; use when conserving spells." },
      { id: "light-crossbow", name: "Light Crossbow", attackAbility: "dex", proficient: true, damageFormula: `1d8+${dexterityModifier}`, damageType: "piercing", rangeOrReach: "80/320 ft.", notes: "Loading, ammunition, two-handed; 20 bolts carried." }
    ],
    resources: bardResources(slot.ruleset, level, charismaModifier), spellcastingExpected: true,
    spellcasting: {
      kind: "prepared", ability: "cha", cantrips: bardCantrips(slot.ruleset, level),
      spells: [...bardPreparedSpells2024(level, preparedCounts[level - 1]), ...alwaysPrepared], slotsByLevel: getDndFullCasterSlots(level),
      notes: `Bard table Prepared Spells: ${preparedCounts[level - 1]}. Acolyte, College of Lore, and Words of Creation add ${alwaysPrepared.length} always-prepared spells outside that count.`
    },
    classFeatures: classFeaturesForLevel(level), subclassFeatures: subclassFeaturesForLevel(level),
    advancementChoices: advancementForLevel(level),
    equipment: [level >= 5 ? "Studded Leather" : "Leather Armor", "2 Daggers", "Light Crossbow", "20 Bolts", "Entertainer's Pack", "Lute", "Flute", "Viol", "Calligrapher's Supplies", "Thieves' Tools", "Prayer Book"],
    currencyGp: 19,
    notes: [
      "Acolyte supplies Magic Initiate (Cleric), Insight, Religion, Calligrapher's Supplies, and the selected Wisdom and Charisma increases.",
      "Human grants Resourceful, Skillful (Stealth), and Versatile; Skilled supplies Acrobatics, Investigation, and Thieves' Tools.",
      "College of Lore adds Arcana, History, and Medicine at level 3.",
      "Cutting Words and Bardic Inspiration spend the same tracked resource."
    ],
    sources: [
      { label: "2024 Free Rules — Bard and College of Lore", url: "https://www.dndbeyond.com/sources/dnd/br-2024/character-classes", scope: "public-srd" },
      { label: "2024 Free Rules — Human and Acolyte", url: "https://www.dndbeyond.com/sources/dnd/br-2024/character-origins", scope: "public-srd" },
      { label: "2024 Free Rules — Feats", url: "https://www.dndbeyond.com/sources/dnd/br-2024/feats", scope: "public-srd" },
      { label: "2024 Free Rules — Equipment", url: "https://www.dndbeyond.com/sources/dnd/br-2024/equipment", scope: "public-srd" }
    ],
    printableSummaryReady: true
  };
};

export const dndBardPregens2024: DndCharacterRecord[] = dndBardLevels.map(makeRecord);
