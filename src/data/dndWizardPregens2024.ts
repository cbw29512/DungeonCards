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

const preparedCounts = [4, 5, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 18, 19, 21, 22, 23, 24, 25];

const scoresForLevel = (level: number): DndAbilityScores => {
  const scores = { str: 8, dex: 14, con: 15, int: 17, wis: 12, cha: 10 };
  if (level >= 4) scores.int += 2;
  if (level >= 8) { scores.int += 1; scores.con += 1; }
  if (level >= 12) scores.con += 2;
  if (level >= 16) scores.dex += 2;
  if (level >= 19) scores.wis += 1;
  return scores;
};

const advancementForLevel = (level: number): string[] => [
  "Sage Origin Feat: Magic Initiate (Wizard) — Message, Minor Illusion, Shield; Intelligence is the spellcasting ability",
  "Human Versatile Origin Feat: Skilled (Nature, Medicine, Religion)",
  ...attainedWizardFeatures(level, [
    [4, "Level 4 Ability Score Improvement: Intelligence +2"],
    [8, "Level 8 Ability Score Improvement: Intelligence +1, Constitution +1"],
    [12, "Level 12 Ability Score Improvement: Constitution +2"],
    [16, "Level 16 Ability Score Improvement: Dexterity +2"],
    [19, "Level 19 Boon of Spell Recall: Wisdom +1; a level 1–4 spell may preserve its slot when a d4 matches the slot level"]
  ])
];

const classFeaturesForLevel = (level: number): string[] => [
  "Spellcasting: Intelligence is the spellcasting ability; the Wizard table determines prepared spells from the spellbook",
  "Ritual Adept: cast ritual-tagged Wizard spells from the spellbook without preparing them",
  "Arcane Recovery: once per day after a Short Rest, recover spell slots totaling up to half Wizard level rounded up; no slot above level 5",
  ...attainedWizardFeatures(level, [
    [2, "Scholar — Arcana Expertise: double Proficiency Bonus on Arcana checks"],
    [3, "Wizard Subclass — Evoker"],
    [4, "Ability Score Improvement"],
    [5, "Memorize Spell: after a Short Rest, replace one prepared Wizard spell with another eligible spell from the spellbook"],
    [8, "Ability Score Improvement"], [12, "Ability Score Improvement"], [16, "Ability Score Improvement"],
    [18, "Spell Mastery: Magic Missile and Scorching Ray are always prepared and can be cast at their lowest level without a slot"],
    [19, "Epic Boon — Boon of Spell Recall"],
    [20, "Signature Spells: Fireball and Counterspell are always prepared; cast each once at level 3 per Short or Long Rest without a slot"]
  ])
];

const subclassFeaturesForLevel = (level: number): string[] => attainedWizardFeatures(level, [
  [3, "Evocation Savant: add two Evocation spells of level 2 or lower to the spellbook and gain an Evocation spell whenever a new spell level unlocks"],
  [3, "Potent Cantrip: damaging cantrips still deal half damage when a creature succeeds on its saving throw"],
  [6, "Sculpt Spells: protect up to 1 + spell level visible creatures inside an Evocation spell; they automatically save and take no damage"],
  [10, "Empowered Evocation: add Intelligence modifier to one damage roll of a Wizard Evocation spell"],
  [14, "Overchannel: maximize damage for a level 1–5 Wizard spell; repeated uses before a Long Rest inflict escalating Necrotic damage"]
]);

const makeRecord = (level: number): DndCharacterRecord => {
  const slot = getDndPregenBuildSlot("srd-5.2.1-2024", "wizard", "evoker", level);
  if (!slot) throw new Error(`Missing 2024 Wizard / Evoker build slot at level ${level}.`);
  const abilityScores = scoresForLevel(level);
  const dexterityModifier = dndAbilityModifier(abilityScores.dex);
  const preparedCount = preparedCounts[level - 1];
  return {
    id: `${slot.id}-nora-brightscript`,
    buildSlotId: slot.id,
    ruleset: slot.ruleset,
    name: "Nora Brightscript",
    classId: "wizard",
    className: "Wizard",
    subclassId: "evoker",
    subclassName: "Evoker",
    subclassUnlockLevel: 3,
    level,
    species: "Human",
    background: "Sage",
    abilityScores,
    hitDie: 6,
    maximumHitPoints: dndFixedHitPoints(6, level, abilityScores.con),
    armorClass: 13 + dexterityModifier,
    speedFeet: 30,
    savingThrowProficiencies: ["int", "wis"],
    skillProficiencies: ["Arcana", "History", "Investigation", "Nature", "Medicine", "Religion", "Insight"],
    languages: ["Common", "Elvish", "Draconic"],
    toolProficiencies: ["Calligrapher's Supplies"],
    senses: ["Normal vision"],
    attacks: [
      { id: "dagger", name: "Dagger", attackAbility: "dex", proficient: true, damageFormula: `1d4+${dexterityModifier}`, damageType: "piercing", rangeOrReach: "5 ft. or 20/60 ft.", notes: "Finesse, light, thrown; Nick mastery is unavailable without Weapon Mastery." },
      { id: "quarterstaff", name: "Quarterstaff", attackAbility: "str", proficient: true, damageFormula: "1d6-1", damageType: "bludgeoning", rangeOrReach: "5 ft.", notes: "Versatile (1d8); emergency melee fallback." }
    ],
    resources: wizardResources(slot.ruleset, level),
    spellcastingExpected: true,
    spellcasting: {
      kind: "prepared",
      ability: "int",
      cantrips: wizardCantrips(slot.ruleset, level),
      spells: wizardPreparedSpells(level, preparedCount),
      slotsByLevel: getDndFullCasterSlots(level),
      notes: `Wizard table Prepared Spells: ${preparedCount}. Spellbook contains at least ${6 + (level - 1) * 2} leveled spells before found or copied additions. Magic Initiate adds a free Shield cast and keeps Shield prepared.`
    },
    classFeatures: classFeaturesForLevel(level),
    subclassFeatures: subclassFeaturesForLevel(level),
    advancementChoices: advancementForLevel(level),
    equipment: ["Spellbook", "Arcane Focus", "Component Pouch", "Quarterstaff", "Dagger", "Scholar's Pack", "Calligrapher's Supplies", "Robe", "Bottle of Ink", "Quill"],
    currencyGp: 5,
    notes: [
      "Sage supplies Magic Initiate (Wizard), Arcana, History, Calligrapher's Supplies, and the selected Constitution/Intelligence/Wisdom increases.",
      "Human grants Resourceful, Skillful (Insight), and Versatile; Skilled supplies Nature, Medicine, and Religion.",
      "Mage Armor is assumed in the listed Armor Class; without it, AC is 10 + Dexterity modifier.",
      "The selected prepared list favors simple battlefield control, defense, mobility, and Evocation damage."
    ],
    sources: [
      { label: "2024 Free Rules — Wizard and Evoker", url: "https://www.dndbeyond.com/sources/dnd/br-2024/character-classes", scope: "public-srd" },
      { label: "2024 Free Rules — Character Origins", url: "https://www.dndbeyond.com/sources/dnd/br-2024/character-origins", scope: "public-srd" },
      { label: "2024 Free Rules — Feats", url: "https://www.dndbeyond.com/sources/dnd/br-2024/feats", scope: "public-srd" },
      { label: "2024 Free Rules — Equipment", url: "https://www.dndbeyond.com/sources/dnd/br-2024/equipment", scope: "public-srd" }
    ],
    printableSummaryReady: true
  };
};

export const dndWizardPregens2024: DndCharacterRecord[] = dndWizardLevels.map(makeRecord);
