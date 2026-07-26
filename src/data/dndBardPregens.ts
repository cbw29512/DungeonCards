import type { DndAbilityScores, DndCharacterRecord, DndCharacterResource } from "../types/dndCharacter";
import type { RulesetId } from "../types/ruleCards";
import { dndAbilityModifier, dndFixedHitPoints } from "../utils/dndCharacterRecord";
import { getDndPregenBuildSlot } from "../utils/dndPregenCatalog";
import { getDndFullCasterSlots } from "./dndCasterProgression";

const levels = Array.from({ length: 20 }, (_, index) => index + 1);
const attained = (level: number, entries: Array<[number, string]>): string[] =>
  entries.filter(([unlock]) => level >= unlock).map(([, value]) => value);

const cantrips2014 = (level: number): string[] => [
  "Vicious Mockery",
  "Mage Hand",
  ...(level >= 4 ? ["Minor Illusion"] : []),
  ...(level >= 10 ? ["Prestidigitation"] : [])
];

const bardSpells2014 = (level: number): string[] => attained(level, [
  [1, "Charm Person"], [1, "Detect Magic"], [1, "Healing Word"], [1, "Thunderwave"],
  [2, "Dissonant Whispers"], [3, "Invisibility"], [4, "Suggestion"], [5, "Hypnotic Pattern"],
  [6, "Dispel Magic"], [7, "Polymorph"], [8, "Dimension Door"], [9, "Greater Restoration"],
  [10, "Fireball"], [10, "Wall of Force"], [11, "Mass Suggestion"], [13, "Forcecage"],
  [14, "Teleport"], [14, "Heal"], [15, "Dominate Monster"], [17, "True Polymorph"],
  [18, "Wish"], [18, "Mass Heal"]
]);

const loreSecrets2014 = (level: number): string[] => level >= 6 ? ["Counterspell", "Revivify"] : [];
const knownCounts2014 = [4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 15, 16, 18, 19, 19, 20, 22, 22, 22];

const cantrips2024 = (level: number): string[] => [
  "Vicious Mockery",
  "Mage Hand",
  ...(level >= 4 ? ["Minor Illusion"] : []),
  ...(level >= 10 ? ["Prestidigitation"] : []),
  "Guidance (Magic Initiate: Cleric)",
  "Sacred Flame (Magic Initiate: Cleric)"
];

const bardSpells2024 = (level: number): string[] => attained(level, [
  [1, "Charm Person"], [1, "Color Spray"], [1, "Dissonant Whispers"], [1, "Healing Word"],
  [2, "Detect Magic"], [3, "Invisibility"], [4, "Suggestion"], [5, "Hypnotic Pattern"],
  [5, "Dispel Magic"], [6, "Mass Healing Word"], [7, "Polymorph"], [8, "Dimension Door"],
  [9, "Greater Restoration"], [9, "Synaptic Static"], [10, "Fireball"], [11, "Mass Suggestion"],
  [13, "Forcecage"], [15, "Dominate Monster"], [17, "True Polymorph"], [18, "Foresight"],
  [19, "Wish"], [20, "Mass Heal"]
]);

const extraSpells2024 = (level: number): string[] => [
  "Bless (Magic Initiate: Cleric)",
  ...(level >= 6 ? ["Counterspell (Magical Discoveries)", "Revivify (Magical Discoveries)"] : []),
  ...(level >= 20 ? ["Power Word Heal (Words of Creation)", "Power Word Kill (Words of Creation)"] : [])
];
const preparedCounts2024 = [4, 5, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 17, 18, 18, 19, 20, 21, 22];

const scores2014 = (level: number): DndAbilityScores => {
  const scores = { str: 9, dex: 15, con: 14, int: 13, wis: 11, cha: 16 };
  if (level >= 4) scores.cha += 2;
  if (level >= 8) scores.cha += 2;
  if (level >= 12) scores.dex += 2;
  if (level >= 16) scores.con += 2;
  if (level >= 19) scores.dex += 2;
  return scores;
};

const choices2014 = (level: number): string[] => attained(level, [
  [4, "Level 4 Ability Score Improvement: Charisma +2"],
  [8, "Level 8 Ability Score Improvement: Charisma +2"],
  [12, "Level 12 Ability Score Improvement: Dexterity +2"],
  [16, "Level 16 Ability Score Improvement: Constitution +2"],
  [19, "Level 19 Ability Score Improvement: Dexterity +2"]
]);

const scores2024 = (level: number): DndAbilityScores => {
  const scores = { str: 8, dex: 14, con: 13, int: 13, wis: 10, cha: 17 };
  if (level >= 4) scores.cha += 2;
  if (level >= 8) { scores.cha += 1; scores.con += 1; }
  if (level >= 12) scores.dex += 2;
  if (level >= 16) scores.con += 2;
  if (level >= 19) scores.int += 1;
  return scores;
};

const choices2024 = (level: number): string[] => [
  "Acolyte Origin Feat: Magic Initiate (Cleric) — Guidance, Sacred Flame, Bless; Charisma is the spellcasting ability",
  "Human Versatile Origin Feat: Musician",
  "Human Skillful: Performance proficiency",
  ...attained(level, [
    [4, "Level 4 Ability Score Improvement: Charisma +2"],
    [8, "Level 8 Ability Score Improvement: Charisma +1, Constitution +1"],
    [12, "Level 12 Ability Score Improvement: Dexterity +2"],
    [16, "Level 16 Ability Score Improvement: Constitution +2"],
    [19, "Level 19 Boon of Spell Recall: Intelligence +1; once per Long Rest cast a prepared level 1–4 spell without expending a slot"]
  ])
];

const inspirationDie = (level: number): string => level >= 15 ? "d12" : level >= 10 ? "d10" : level >= 5 ? "d8" : "d6";

const features2014 = (level: number): string[] => [
  `Bardic Inspiration ${inspirationDie(level)}: Bonus Action; another creature within 60 feet can add the die to one ability check, attack roll, or saving throw within 10 minutes`,
  "Spellcasting: Charisma; Bard spells are known rather than prepared",
  ...attained(level, [
    [2, "Jack of All Trades: add half Proficiency Bonus, rounded down, to unproficient ability checks"],
    [2, "Song of Rest d6: friendly creatures spending Hit Dice during a Short Rest regain an extra d6"],
    [3, "Expertise: double Proficiency Bonus for Performance and Persuasion"],
    [4, "Ability Score Improvement"],
    [5, "Font of Inspiration: Bardic Inspiration refreshes on a Short or Long Rest"],
    [6, "Countercharm: Action; until the end of your next turn, allies within 30 feet who can hear you have Advantage against Charmed and Frightened saves"],
    [8, "Ability Score Improvement"],
    [9, "Song of Rest d8"],
    [10, "Expertise: double Proficiency Bonus for Perception and Arcana"],
    [10, "Magical Secrets: Fireball and Wall of Force count as Bard spells and are included in Spells Known"],
    [12, "Ability Score Improvement"],
    [13, "Song of Rest d10"],
    [14, "Magical Secrets: Teleport and Heal count as Bard spells and are included in Spells Known"],
    [16, "Ability Score Improvement"],
    [17, "Song of Rest d12"],
    [18, "Magical Secrets: Wish and Mass Heal count as Bard spells and are included in Spells Known"],
    [19, "Ability Score Improvement"],
    [20, "Superior Inspiration: when rolling Initiative with no Bardic Inspiration uses, regain one use"]
  ])
];

const lore2014 = (level: number): string[] => attained(level, [
  [3, "Bonus Proficiencies: Arcana, History, and Investigation"],
  [3, "Cutting Words: Reaction; expend Bardic Inspiration to subtract the die from a visible creature’s attack roll, ability check, or damage roll within 60 feet"],
  [6, "Additional Magical Secrets: Counterspell and Revivify are known and do not count against the Bard table’s Spells Known"],
  [14, "Peerless Skill: when making an ability check, expend Bardic Inspiration and add the die to the result"]
]);

const features2024 = (level: number): string[] => [
  `Bardic Inspiration ${inspirationDie(level)}: Bonus Action; a creature within 60 feet can add the die after failing a d20 Test during the next hour`,
  "Spellcasting: Charisma; the Bard table determines the number of prepared Bard spells",
  "Human Resourceful: gain Heroic Inspiration whenever you finish a Long Rest",
  "Musician: after a Short or Long Rest, grant Heroic Inspiration to allies up to your Proficiency Bonus",
  ...attained(level, [
    [2, "Expertise: double Proficiency Bonus for Performance and Persuasion"],
    [2, "Jack of All Trades: add half Proficiency Bonus, rounded down, to unproficient ability checks"],
    [4, "Ability Score Improvement"],
    [5, "Font of Inspiration: Bardic Inspiration refreshes on a Short or Long Rest; expend a spell slot to regain one use"],
    [7, "Countercharm: Reaction after you or a creature within 30 feet fails a save against Charmed or Frightened; reroll with Advantage"],
    [8, "Ability Score Improvement"],
    [9, "Expertise: double Proficiency Bonus for Arcana and Perception"],
    [10, "Magical Secrets: when preparing or replacing Bard spells, choose from the Bard, Cleric, Druid, or Wizard lists"],
    [12, "Ability Score Improvement"],
    [16, "Ability Score Improvement"],
    [18, "Superior Inspiration: on Initiative, restore Bardic Inspiration until you have two uses if you have fewer"],
    [19, "Epic Boon — Boon of Spell Recall"],
    [20, "Words of Creation: Power Word Heal and Power Word Kill are always prepared; each can also target a second creature within 10 feet of the first"]
  ])
];

const lore2024 = (level: number): string[] => attained(level, [
  [3, "Bonus Proficiencies: Deception, History, and Investigation"],
  [3, "Cutting Words: Reaction; when a visible creature within 60 feet deals damage or succeeds on an ability check or attack roll, expend Bardic Inspiration and subtract the die"],
  [6, "Magical Discoveries: Counterspell and Revivify are always prepared and can be replaced by Cleric, Druid, or Wizard spells when gaining a Bard level"],
  [14, "Peerless Skill: after failing an ability check or attack roll, expend Bardic Inspiration and add the die; retain the use if the roll still fails"]
]);

const bardResources = (level: number, charisma: number, ruleset: RulesetId): DndCharacterResource[] => [
  {
    id: "bardic-inspiration",
    name: `Bardic Inspiration ${inspirationDie(level)}`,
    maximum: Math.max(1, dndAbilityModifier(charisma)),
    refresh: level >= 5 ? "short-rest" : "long-rest",
    notes: ruleset === "srd-5.2.1-2024" && level >= 5
      ? "Also regain one use by expending a spell slot."
      : undefined
  },
  ...(ruleset === "srd-5.2.1-2024" ? [
    { id: "resourceful", name: "Heroic Inspiration — Resourceful", maximum: 1, refresh: "long-rest" as const },
    { id: "magic-initiate-bless", name: "Magic Initiate — Bless free cast", maximum: 1, refresh: "long-rest" as const, notes: "Bless remains prepared and can also be cast with spell slots." }
  ] : [])
];

const make2014 = (level: number): DndCharacterRecord => {
  const slot = getDndPregenBuildSlot("srd-5.1-2014", "bard", "college-lore", level);
  if (!slot) throw new Error(`Missing 2014 Bard / Lore build slot at level ${level}.`);
  const abilityScores = scores2014(level);
  const dexterityModifier = dndAbilityModifier(abilityScores.dex);
  const tableSpells = bardSpells2014(level);
  const loreSecrets = loreSecrets2014(level);
  return {
    id: `${slot.id}-liora-brightsong`,
    buildSlotId: slot.id,
    ruleset: slot.ruleset,
    name: "Liora Brightsong",
    classId: "bard",
    className: "Bard",
    subclassId: "college-lore",
    subclassName: "College of Lore",
    subclassUnlockLevel: 3,
    level,
    species: "Human",
    background: "Entertainer",
    abilityScores,
    hitDie: 8,
    maximumHitPoints: dndFixedHitPoints(8, level, abilityScores.con),
    armorClass: 11 + dexterityModifier,
    speedFeet: 30,
    savingThrowProficiencies: ["dex", "cha"],
    skillProficiencies: level >= 3
      ? ["Acrobatics", "Performance", "Persuasion", "Insight", "Perception", "Arcana", "History", "Investigation"]
      : ["Acrobatics", "Performance", "Persuasion", "Insight", "Perception"],
    languages: ["Common", "Elvish"],
    toolProficiencies: ["Disguise Kit", "Lute", "Flute", "Viol"],
    senses: ["Normal vision"],
    attacks: [
      { id: "rapier", name: "Rapier", attackAbility: "dex", proficient: true, damageFormula: `1d8+${dexterityModifier}`, damageType: "piercing", rangeOrReach: "5 ft." },
      { id: "light-crossbow", name: "Light Crossbow", attackAbility: "dex", proficient: true, damageFormula: `1d8+${dexterityModifier}`, damageType: "piercing", rangeOrReach: "80/320 ft.", notes: "Loading, ammunition, two-handed; 20 bolts carried." },
      { id: "dagger", name: "Dagger", attackAbility: "dex", proficient: true, damageFormula: `1d4+${dexterityModifier}`, damageType: "piercing", rangeOrReach: "20/60 ft." }
    ],
    resources: bardResources(level, abilityScores.cha, slot.ruleset),
    spellcastingExpected: true,
    spellcasting: {
      kind: "known",
      ability: "cha",
      cantrips: cantrips2014(level),
      spells: [...tableSpells, ...loreSecrets],
      slotsByLevel: getDndFullCasterSlots(level),
      notes: `Bard table Spells Known: ${knownCounts2014[level - 1]}. College of Lore adds ${loreSecrets.length} Additional Magical Secrets outside that count.`
    },
    classFeatures: features2014(level),
    subclassFeatures: lore2014(level),
    advancementChoices: choices2014(level),
    equipment: ["Rapier", "Light Crossbow", "20 Bolts", "Leather Armor", "Dagger", "Entertainer's Pack", "Lute", "Flute", "Viol", "Disguise Kit", "Costume", "Admirer's Favor"],
    currencyGp: 15,
    notes: [
      "Human ability increases are included in the listed scores.",
      "Entertainer grants Acrobatics, Performance, Disguise Kit, one musical instrument, and By Popular Demand.",
      "Concentration applies to spells such as Invisibility, Suggestion, Hypnotic Pattern, Polymorph, and Wall of Force."
    ],
    sources: [
      { label: "2014 Basic Rules — Bard and College of Lore", url: "https://www.dndbeyond.com/sources/dnd/basic-rules-2014/classes", scope: "public-srd" },
      { label: "2014 Basic Rules — Human", url: "https://www.dndbeyond.com/sources/dnd/basic-rules-2014/races", scope: "public-srd" },
      { label: "2014 Basic Rules — Entertainer", url: "https://www.dndbeyond.com/sources/dnd/basic-rules-2014/personality-and-background", scope: "public-srd" }
    ],
    printableSummaryReady: true
  };
};

const make2024 = (level: number): DndCharacterRecord => {
  const slot = getDndPregenBuildSlot("srd-5.2.1-2024", "bard", "college-lore", level);
  if (!slot) throw new Error(`Missing 2024 Bard / Lore build slot at level ${level}.`);
  const abilityScores = scores2024(level);
  const dexterityModifier = dndAbilityModifier(abilityScores.dex);
  const bardSpells = bardSpells2024(level);
  const extras = extraSpells2024(level);
  return {
    id: `${slot.id}-ilyra-dawnquill`,
    buildSlotId: slot.id,
    ruleset: slot.ruleset,
    name: "Ilyra Dawnquill",
    classId: "bard",
    className: "Bard",
    subclassId: "college-lore",
    subclassName: "College of Lore",
    subclassUnlockLevel: 3,
    level,
    species: "Human",
    background: "Acolyte",
    abilityScores,
    hitDie: 8,
    maximumHitPoints: dndFixedHitPoints(8, level, abilityScores.con),
    armorClass: 11 + dexterityModifier,
    speedFeet: 30,
    savingThrowProficiencies: ["dex", "cha"],
    skillProficiencies: level >= 3
      ? ["Insight", "Religion", "Performance", "Persuasion", "Perception", "Arcana", "Deception", "History", "Investigation"]
      : ["Insight", "Religion", "Performance", "Persuasion", "Perception", "Arcana"],
    languages: ["Common", "Celestial", "Elvish"],
    toolProficiencies: ["Calligrapher's Supplies", "Lute", "Flute", "Viol"],
    senses: ["Normal vision"],
    attacks: [
      { id: "light-crossbow", name: "Light Crossbow", attackAbility: "dex", proficient: true, damageFormula: `1d8+${dexterityModifier}`, damageType: "piercing", rangeOrReach: "80/320 ft.", notes: "Loading, ammunition, two-handed; 20 bolts carried." },
      { id: "dagger", name: "Dagger", attackAbility: "dex", proficient: true, damageFormula: `1d4+${dexterityModifier}`, damageType: "piercing", rangeOrReach: "20/60 ft.", notes: "Nick mastery is unavailable without Weapon Mastery; two daggers carried." }
    ],
    resources: bardResources(level, abilityScores.cha, slot.ruleset),
    spellcastingExpected: true,
    spellcasting: {
      kind: "prepared",
      ability: "cha",
      cantrips: cantrips2024(level),
      spells: [...bardSpells, ...extras],
      slotsByLevel: getDndFullCasterSlots(level),
      notes: `Bard table Prepared Spells: ${preparedCounts2024[level - 1]}. Additional entries are always-prepared origin, Lore, or Words of Creation spells and do not consume that count.`
    },
    classFeatures: features2024(level),
    subclassFeatures: lore2024(level),
    advancementChoices: choices2024(level),
    equipment: ["Leather Armor", "2 Daggers", "Light Crossbow", "20 Bolts", "Lute", "Entertainer's Pack", "Quarterstaff", "Calligrapher's Supplies", "Book (prayers)", "Holy Symbol", "10 Sheets of Parchment", "Robe"],
    currencyGp: 27,
    notes: [
      "Acolyte supplies Magic Initiate (Cleric), Insight, Religion, Calligrapher's Supplies, and the selected Charisma/Intelligence increases.",
      "Human supplies Resourceful, Skillful (Performance), and Versatile (Musician).",
      "Magic Initiate spells use Charisma; Bless has one free Long-Rest cast and can also use Bard spell slots.",
      "Concentration applies to spells such as Bless, Invisibility, Suggestion, Hypnotic Pattern, Polymorph, and Wall of Force."
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

export const dndBardPregenRecords: DndCharacterRecord[] = [
  ...levels.map(make2014),
  ...levels.map(make2024)
];

export const getDndBardPregenRecord = (
  ruleset: RulesetId,
  level: number
): DndCharacterRecord | undefined => dndBardPregenRecords.find((record) => (
  record.ruleset === ruleset && record.level === level
));
