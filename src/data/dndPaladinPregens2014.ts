import type { DndAbilityScores, DndCharacterRecord } from "../types/dndCharacter";
import { dndAbilityModifier, dndFixedHitPoints } from "../utils/dndCharacterRecord";
import { getDndPregenBuildSlot } from "../utils/dndPregenCatalog";
import { getDndHalfCasterSlots2014 } from "./dndCasterProgression";
import {
  attainedPaladinFeatures,
  devotionOathSpells,
  dndPaladinLevels,
  paladinAttackCount,
  paladinPreparedSpells,
  paladinResources
} from "./dndPaladinPregenShared";

const scoresForLevel = (level: number): DndAbilityScores => {
  const scores = { str: 16, dex: 10, con: 14, int: 8, wis: 12, cha: 16 };
  if (level >= 4) scores.cha += 2;
  if (level >= 8) scores.cha += 2;
  if (level >= 12) scores.str += 2;
  if (level >= 16) scores.str += 2;
  if (level >= 19) scores.con += 2;
  return scores;
};

const advancementForLevel = (level: number): string[] => attainedPaladinFeatures(level, [
  [4, "Level 4 Ability Score Improvement: Charisma +2"],
  [8, "Level 8 Ability Score Improvement: Charisma +2"],
  [12, "Level 12 Ability Score Improvement: Strength +2"],
  [16, "Level 16 Ability Score Improvement: Strength +2"],
  [19, "Level 19 Ability Score Improvement: Constitution +2"]
]);

const classFeaturesForLevel = (level: number): string[] => attainedPaladinFeatures(level, [
  [1, "Divine Sense: detect celestials, fiends, undead, and desecrated or consecrated places within 60 feet"],
  [1, "Lay on Hands: Action; restore HP from a pool equal to five times Paladin level or spend 5 points to cure disease or poison"],
  [2, "Fighting Style — Dueling: +2 weapon damage while wielding a one-handed melee weapon and no other weapon"],
  [2, "Spellcasting: prepare Paladin spells equal to Charisma modifier + half Paladin level rounded down"],
  [2, "Divine Smite: after a melee weapon hit, expend a spell slot for extra radiant damage"],
  [3, "Divine Health: immune to disease"],
  [3, "Sacred Oath — Oath of Devotion"],
  [4, "Ability Score Improvement"],
  [5, "Extra Attack: make two attacks with the Attack action"],
  [6, "Aura of Protection: you and friendly creatures within 10 feet add your Charisma modifier to saving throws"],
  [8, "Ability Score Improvement"],
  [10, "Aura of Courage: you and friendly creatures within 10 feet cannot be Frightened while you are conscious"],
  [11, "Improved Divine Smite: every melee weapon hit deals an extra 1d8 radiant damage"],
  [12, "Ability Score Improvement"],
  [14, "Cleansing Touch: Action; end one spell on yourself or a willing creature"],
  [16, "Ability Score Improvement"],
  [18, "Aura Improvements: Aura of Protection and Aura of Courage expand to 30 feet"],
  [19, "Ability Score Improvement"]
]);

const subclassFeaturesForLevel = (level: number): string[] => attainedPaladinFeatures(level, [
  [3, "Oath Spells: always prepare the exact-level Oath of Devotion spells outside the normal prepared count"],
  [3, "Channel Divinity — Sacred Weapon: add Charisma modifier to one weapon's attack rolls for 1 minute and make it magical"],
  [3, "Channel Divinity — Turn the Unholy: fiends and undead within 30 feet save or become Turned for 1 minute"],
  [7, "Aura of Devotion: you and friendly creatures within 10 feet cannot be Charmed while you are conscious"],
  [15, "Purity of Spirit: remain under the effects of Protection from Evil and Good"],
  [20, "Holy Nimbus: for 1 minute, emit bright light, damage hostile creatures that start near you, and gain Advantage on saves against fiend and undead spells"]
]);

const makeRecord = (level: number): DndCharacterRecord => {
  const slot = getDndPregenBuildSlot("srd-5.1-2014", "paladin", "oath-devotion", level);
  if (!slot) throw new Error(`Missing 2014 Paladin / Devotion build slot at level ${level}.`);
  const abilityScores = scoresForLevel(level);
  const strengthModifier = dndAbilityModifier(abilityScores.str);
  const charismaModifier = dndAbilityModifier(abilityScores.cha);
  const preparedCount = Math.max(1, Math.floor(level / 2) + charismaModifier);
  const oathSpells = devotionOathSpells(slot.ruleset, level);
  const spellcasting = level === 1 ? { kind: "none" as const } : {
    kind: "prepared" as const,
    ability: "cha" as const,
    cantrips: [],
    spells: [...new Set([...paladinPreparedSpells(slot.ruleset, level, preparedCount), ...oathSpells])],
    slotsByLevel: getDndHalfCasterSlots2014(level),
    notes: `Prepared Paladin spells: ${preparedCount}. Oath of Devotion adds ${oathSpells.length} always-prepared spells outside that count.`
  };
  return {
    id: `${slot.id}-seraphina-valebright`, buildSlotId: slot.id, ruleset: slot.ruleset,
    name: "Seraphina Valebright", classId: "paladin", className: "Paladin",
    subclassId: "oath-devotion", subclassName: "Oath of Devotion", subclassUnlockLevel: 3, level,
    species: "Half-Elf", background: "Noble", abilityScores, hitDie: 10,
    maximumHitPoints: dndFixedHitPoints(10, level, abilityScores.con), armorClass: 18, speedFeet: 30,
    savingThrowProficiencies: ["wis", "cha"],
    skillProficiencies: ["Athletics", "History", "Insight", "Medicine", "Perception", "Persuasion"],
    languages: ["Common", "Elvish", "Celestial"], toolProficiencies: ["Dragonchess Set"],
    senses: ["Darkvision 60 ft."],
    attacks: [
      { id: "longsword", name: "Longsword", attackAbility: "str", proficient: true, damageFormula: `1d8+${strengthModifier + 2}`, damageType: "slashing", rangeOrReach: "5 ft.", notes: `Dueling style; wielded with Shield. Attack action: ${paladinAttackCount(level)} attack${paladinAttackCount(level) === 1 ? "" : "s"}.${level >= 11 ? " Improved Divine Smite adds 1d8 radiant to every hit." : ""}` },
      { id: "javelin", name: "Javelin", attackAbility: "str", proficient: true, damageFormula: `1d6+${strengthModifier}`, damageType: "piercing", rangeOrReach: "5 ft. or 30/120 ft.", notes: "Thrown; 5 carried." }
    ],
    resources: paladinResources(slot.ruleset, level, charismaModifier),
    spellcastingExpected: level >= 2, spellcasting,
    classFeatures: classFeaturesForLevel(level), subclassFeatures: subclassFeaturesForLevel(level),
    advancementChoices: advancementForLevel(level),
    equipment: ["Chain Mail", "Shield", "Longsword", "5 Javelins", "Priest's Pack", "Holy Symbol", "Fine Clothes", "Signet Ring", "Scroll of Pedigree", "Dragonchess Set"],
    currencyGp: 25,
    notes: [
      "Half-Elf ability increases, Darkvision, Fey Ancestry, Skill Versatility, and two bonus languages are included.",
      "Noble grants History, Persuasion, a gaming set, one language, and Position of Privilege.",
      "Aura bonuses use the current Charisma modifier and expand to 30 feet at level 18.",
      "Use Divine Smite after confirming a hit; spell-slot cards track the cost."
    ],
    sources: [
      { label: "2014 Basic Rules — Paladin and Oath of Devotion", url: "https://www.dndbeyond.com/sources/dnd/basic-rules-2014/classes", scope: "public-srd" },
      { label: "2014 Basic Rules — Half-Elf", url: "https://www.dndbeyond.com/sources/dnd/basic-rules-2014/races", scope: "public-srd" },
      { label: "2014 Basic Rules — Noble", url: "https://www.dndbeyond.com/sources/dnd/basic-rules-2014/personality-and-background", scope: "public-srd" }
    ],
    printableSummaryReady: true
  };
};

export const dndPaladinPregens2014: DndCharacterRecord[] = dndPaladinLevels.map(makeRecord);
