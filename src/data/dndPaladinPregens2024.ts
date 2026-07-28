import type { DndAbilityScores, DndCharacterRecord } from "../types/dndCharacter";
import { dndAbilityModifier, dndFixedHitPoints } from "../utils/dndCharacterRecord";
import { getDndPregenBuildSlot } from "../utils/dndPregenCatalog";
import { getDndHalfCasterSlots2024 } from "./dndCasterProgression";
import {
  attainedPaladinFeatures,
  devotionOathSpells,
  dndPaladinLevels,
  paladinAttackCount,
  paladinPreparedSpells,
  paladinResources
} from "./dndPaladinPregenShared";

const preparedCounts = [2, 3, 4, 5, 6, 6, 7, 7, 9, 9, 10, 10, 11, 11, 12, 12, 14, 14, 15, 15];

const scoresForLevel = (level: number): DndAbilityScores => {
  const scores = { str: 17, dex: 10, con: 15, int: 8, wis: 12, cha: 14 };
  if (level >= 4) scores.cha += 2;
  if (level >= 8) scores.str += 2;
  if (level >= 12) { scores.str += 1; scores.cha += 1; }
  if (level >= 16) scores.cha += 2;
  if (level >= 19) scores.cha += 1;
  return scores;
};

const advancementForLevel = (level: number): string[] => [
  "Soldier Origin Feat: Savage Attacker",
  "Human Versatile Origin Feat: Skilled (Medicine, Perception, Smith's Tools)",
  ...attainedPaladinFeatures(level, [
    [4, "Level 4 Ability Score Improvement: Charisma +2"],
    [8, "Level 8 Ability Score Improvement: Strength +2"],
    [12, "Level 12 Ability Score Improvement: Strength +1, Charisma +1"],
    [16, "Level 16 Ability Score Improvement: Charisma +2"],
    [19, "Level 19 Boon of Truesight: Charisma +1 and Truesight 60 feet"]
  ])
];

const classFeaturesForLevel = (level: number): string[] => attainedPaladinFeatures(level, [
  [1, "Lay on Hands: Bonus Action; restore HP from a pool equal to five times Paladin level or spend 5 points to remove Poisoned"],
  [1, "Spellcasting: the Paladin table determines prepared Paladin spells"],
  [1, "Weapon Mastery: use the mastery properties of two proficient weapon kinds; choices can change after a Long Rest"],
  [2, "Fighting Style — Dueling: +2 weapon damage while wielding a one-handed melee weapon and no other weapon"],
  [2, "Paladin's Smite: Divine Smite is always prepared and can be cast once per Long Rest without a spell slot"],
  [3, "Channel Divinity: two uses; regain one on a Short Rest and all on a Long Rest"],
  [3, "Divine Sense: expend Channel Divinity to detect celestials, fiends, and undead within 60 feet"],
  [4, "Ability Score Improvement"],
  [5, "Extra Attack: make two attacks with the Attack action"],
  [5, "Faithful Steed: Find Steed is always prepared and can be cast once per Long Rest without a spell slot"],
  [6, "Aura of Protection: you and allies within 10 feet add your Charisma modifier to saving throws while you are conscious"],
  [8, "Ability Score Improvement"],
  [9, "Abjure Foes: expend Channel Divinity to Frighten and restrict selected creatures within 60 feet"],
  [10, "Aura of Courage: you and allies within 10 feet cannot be Frightened while you are conscious"],
  [11, "Radiant Strikes: melee weapon and Unarmed Strike hits deal an extra 1d8 radiant damage"],
  [11, "Channel Divinity: three uses"],
  [12, "Ability Score Improvement"],
  [14, "Restoring Touch: spend 5 Lay on Hands points to remove selected conditions"],
  [16, "Ability Score Improvement"],
  [18, "Aura Expansion: Aura of Protection, Courage, and Devotion expand to 30 feet"],
  [19, "Epic Boon — Boon of Truesight"]
]);

const subclassFeaturesForLevel = (level: number): string[] => attainedPaladinFeatures(level, [
  [3, "Oath Spells: always prepare the exact-level Oath of Devotion spells outside the normal prepared count"],
  [3, "Sacred Weapon: expend Channel Divinity during the Attack action; for 10 minutes add Charisma modifier to attack rolls, deal radiant damage if desired, and emit light"],
  [7, "Aura of Devotion: you and allies within the aura cannot be Charmed while you are conscious"],
  [15, "Smite of Protection: after casting Divine Smite, you and allies in your auras gain Half Cover until the start of your next turn"],
  [20, "Holy Nimbus: Bonus Action; for 10 minutes emit sunlight, damage hostile creatures near you, and grant saving-throw Advantage against fiends and undead"]
]);

const makeRecord = (level: number): DndCharacterRecord => {
  const slot = getDndPregenBuildSlot("srd-5.2.1-2024", "paladin", "oath-devotion", level);
  if (!slot) throw new Error(`Missing 2024 Paladin / Devotion build slot at level ${level}.`);
  const abilityScores = scoresForLevel(level);
  const strengthModifier = dndAbilityModifier(abilityScores.str);
  const charismaModifier = dndAbilityModifier(abilityScores.cha);
  const preparedCount = preparedCounts[level - 1];
  const oathSpells = devotionOathSpells(slot.ruleset, level);
  const alwaysPrepared = [
    ...(level >= 2 ? ["Divine Smite"] : []),
    ...(level >= 5 ? ["Find Steed"] : []),
    ...oathSpells
  ];
  return {
    id: `${slot.id}-cassian-brightward`, buildSlotId: slot.id, ruleset: slot.ruleset,
    name: "Cassian Brightward", classId: "paladin", className: "Paladin",
    subclassId: "oath-devotion", subclassName: "Oath of Devotion", subclassUnlockLevel: 3, level,
    species: "Human", background: "Soldier", abilityScores, hitDie: 10,
    maximumHitPoints: dndFixedHitPoints(10, level, abilityScores.con), armorClass: 18, speedFeet: 30,
    savingThrowProficiencies: ["wis", "cha"],
    skillProficiencies: ["Athletics", "Insight", "Intimidation", "Medicine", "Perception", "Persuasion"],
    languages: ["Common", "Celestial"],
    toolProficiencies: ["Dice Set", "Smith's Tools"],
    senses: level >= 19 ? ["Truesight 60 ft."] : ["Normal vision"],
    attacks: [
      { id: "longsword", name: "Longsword", attackAbility: "str", proficient: true, damageFormula: `1d8+${strengthModifier + 2}`, damageType: "slashing", rangeOrReach: "5 ft.", notes: `Dueling style; Sap mastery; wielded with Shield. Attack action: ${paladinAttackCount(level)} attack${paladinAttackCount(level) === 1 ? "" : "s"}.${level >= 11 ? " Radiant Strikes adds 1d8 radiant to every hit." : ""}` },
      { id: "javelin", name: "Javelin", attackAbility: "str", proficient: true, damageFormula: `1d6+${strengthModifier}`, damageType: "piercing", rangeOrReach: "5 ft. or 30/120 ft.", notes: "Thrown; Slow mastery; 5 carried." }
    ],
    resources: paladinResources(slot.ruleset, level, charismaModifier),
    spellcastingExpected: true,
    spellcasting: {
      kind: "prepared", ability: "cha", cantrips: [],
      spells: [...new Set([...paladinPreparedSpells(slot.ruleset, level, preparedCount), ...alwaysPrepared])],
      slotsByLevel: getDndHalfCasterSlots2024(level),
      notes: `Paladin table Prepared Spells: ${preparedCount}. Class and Oath features add ${alwaysPrepared.length} always-prepared spells outside that count.`
    },
    classFeatures: classFeaturesForLevel(level), subclassFeatures: subclassFeaturesForLevel(level),
    advancementChoices: advancementForLevel(level),
    equipment: ["Chain Mail", "Shield", "Longsword", "5 Javelins", "Priest's Pack", "Holy Symbol", "Soldier Background Equipment", "Dice Set", "Smith's Tools"],
    currencyGp: 14,
    notes: [
      "Soldier supplies Savage Attacker, Athletics, Intimidation, a gaming set, and the selected Strength and Constitution increases.",
      "Human grants Resourceful, Skillful (Insight), and Versatile; Skilled supplies Medicine, Perception, and Smith's Tools.",
      "Aura bonuses use the current Charisma modifier and expand to 30 feet at level 18.",
      "Divine Smite and Find Steed free casts are tracked separately from spell slots."
    ],
    sources: [
      { label: "2024 Free Rules — Paladin and Oath of Devotion", url: "https://www.dndbeyond.com/sources/dnd/br-2024/character-classes", scope: "public-srd" },
      { label: "2024 Free Rules — Character Origins", url: "https://www.dndbeyond.com/sources/dnd/br-2024/character-origins", scope: "public-srd" },
      { label: "2024 Free Rules — Feats", url: "https://www.dndbeyond.com/sources/dnd/br-2024/feats", scope: "public-srd" },
      { label: "2024 Free Rules — Equipment", url: "https://www.dndbeyond.com/sources/dnd/br-2024/equipment", scope: "public-srd" }
    ],
    printableSummaryReady: true
  };
};

export const dndPaladinPregens2024: DndCharacterRecord[] = dndPaladinLevels.map(makeRecord);
