import type { DndAbilityScores, DndCharacterRecord } from "../types/dndCharacter";
import { dndAbilityModifier, dndFixedHitPoints } from "../utils/dndCharacterRecord";
import { getDndPregenBuildSlot } from "../utils/dndPregenCatalog";
import { getDndFullCasterSlots } from "./dndCasterProgression";
import {
  attainedWizardFeatures,
  dndWizardLevels,
  wizardCantrips,
  wizardPreparedSpells,
  wizardResources
} from "./dndWizardPregenShared";

const scoresForLevel = (level: number): DndAbilityScores => {
  const scores = { str: 8, dex: 16, con: 14, int: 16, wis: 12, cha: 10 };
  if (level >= 4) scores.int += 2;
  if (level >= 8) scores.int += 2;
  if (level >= 12) scores.con += 2;
  if (level >= 16) scores.dex += 2;
  if (level >= 19) scores.wis += 2;
  return scores;
};

const advancementForLevel = (level: number): string[] => attainedWizardFeatures(level, [
  [4, "Level 4 Ability Score Improvement: Intelligence +2"],
  [8, "Level 8 Ability Score Improvement: Intelligence +2"],
  [12, "Level 12 Ability Score Improvement: Constitution +2"],
  [16, "Level 16 Ability Score Improvement: Dexterity +2"],
  [19, "Level 19 Ability Score Improvement: Wisdom +2"]
]);

const classFeaturesForLevel = (level: number): string[] => [
  "Spellcasting: Intelligence is the spellcasting ability; prepare Wizard level + Intelligence modifier spells from the spellbook",
  "Ritual Casting: cast a ritual-tagged Wizard spell from the spellbook without preparing it",
  "Arcane Recovery: once per day after a Short Rest, recover spell slots totaling up to half Wizard level rounded up; no slot above level 5",
  ...attainedWizardFeatures(level, [
    [2, "Arcane Tradition — School of Evocation"],
    [4, "Ability Score Improvement"], [8, "Ability Score Improvement"], [12, "Ability Score Improvement"],
    [16, "Ability Score Improvement"],
    [18, "Spell Mastery: Magic Missile and Scorching Ray are always prepared and can be cast at their lowest level without a slot"],
    [19, "Ability Score Improvement"],
    [20, "Signature Spells: Fireball and Counterspell are always prepared; cast each once at level 3 per Short or Long Rest without a slot"]
  ])
];

const subclassFeaturesForLevel = (level: number): string[] => attainedWizardFeatures(level, [
  [2, "Evocation Savant: copying Evocation spells into the spellbook costs half the normal gold and time"],
  [2, "Sculpt Spells: protect up to 1 + spell level visible creatures inside an Evocation spell; they automatically save and take no damage"],
  [6, "Potent Cantrip: a creature that succeeds on a save against a damaging cantrip still takes half damage"],
  [10, "Empowered Evocation: add Intelligence modifier to one damage roll of a Wizard Evocation spell"],
  [14, "Overchannel: maximize damage for a level 1–5 Wizard spell; repeated uses before a Long Rest inflict escalating Necrotic damage"]
]);

const makeRecord = (level: number): DndCharacterRecord => {
  const slot = getDndPregenBuildSlot("srd-5.1-2014", "wizard", "school-evocation", level);
  if (!slot) throw new Error(`Missing 2014 Wizard / Evocation build slot at level ${level}.`);
  const abilityScores = scoresForLevel(level);
  const dexterityModifier = dndAbilityModifier(abilityScores.dex);
  const preparedCount = level + dndAbilityModifier(abilityScores.int);
  return {
    id: `${slot.id}-aelar-ashquill`,
    buildSlotId: slot.id,
    ruleset: slot.ruleset,
    name: "Aelar Ashquill",
    classId: "wizard",
    className: "Wizard",
    subclassId: "school-evocation",
    subclassName: "School of Evocation",
    subclassUnlockLevel: 2,
    level,
    species: "High Elf",
    background: "Sage",
    abilityScores,
    hitDie: 6,
    maximumHitPoints: dndFixedHitPoints(6, level, abilityScores.con),
    armorClass: 13 + dexterityModifier,
    speedFeet: 30,
    savingThrowProficiencies: ["int", "wis"],
    skillProficiencies: ["Arcana", "History", "Investigation", "Insight"],
    languages: ["Common", "Elvish", "Draconic", "Dwarvish"],
    toolProficiencies: [],
    senses: ["Darkvision 60 ft."],
    attacks: [
      { id: "light-crossbow", name: "Light Crossbow", attackAbility: "dex", proficient: true, damageFormula: `1d8+${dexterityModifier}`, damageType: "piercing", rangeOrReach: "80/320 ft.", notes: "Loading, ammunition, two-handed; 20 bolts carried." },
      { id: "dagger", name: "Dagger", attackAbility: "dex", proficient: true, damageFormula: `1d4+${dexterityModifier}`, damageType: "piercing", rangeOrReach: "5 ft. or 20/60 ft.", notes: "Finesse, light, thrown." }
    ],
    resources: wizardResources(slot.ruleset, level),
    spellcastingExpected: true,
    spellcasting: {
      kind: "prepared",
      ability: "int",
      cantrips: wizardCantrips(slot.ruleset, level),
      spells: wizardPreparedSpells(level, preparedCount),
      slotsByLevel: getDndFullCasterSlots(level),
      notes: `Prepared Wizard spells: ${preparedCount}. Spellbook contains at least ${6 + (level - 1) * 2} leveled spells before found or copied additions.`
    },
    classFeatures: classFeaturesForLevel(level),
    subclassFeatures: subclassFeaturesForLevel(level),
    advancementChoices: advancementForLevel(level),
    equipment: ["Spellbook", "Arcane Focus", "Component Pouch", "Dagger", "Light Crossbow", "20 Bolts", "Scholar's Pack", "Fine Clothes", "Bottle of Ink", "Quill"],
    currencyGp: 10,
    notes: [
      "High Elf ability increases and Minor Illusion cantrip are included.",
      "Mage Armor is assumed in the listed Armor Class; without it, AC is 10 + Dexterity modifier.",
      "Sage grants Arcana, History, two languages, and Researcher.",
      "The selected prepared list favors simple battlefield control, defense, mobility, and Evocation damage."
    ],
    sources: [
      { label: "2014 Basic Rules — Wizard and School of Evocation", url: "https://www.dndbeyond.com/sources/dnd/basic-rules-2014/classes", scope: "public-srd" },
      { label: "2014 Basic Rules — High Elf", url: "https://www.dndbeyond.com/sources/dnd/basic-rules-2014/races", scope: "public-srd" },
      { label: "2014 Basic Rules — Sage", url: "https://www.dndbeyond.com/sources/dnd/basic-rules-2014/personality-and-background", scope: "public-srd" }
    ],
    printableSummaryReady: true
  };
};

export const dndWizardPregens2014: DndCharacterRecord[] = dndWizardLevels.map(makeRecord);
