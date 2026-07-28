import type { DndAbilityScores, DndCharacterRecord } from "../types/dndCharacter";
import { dndAbilityModifier, dndFixedHitPoints } from "../utils/dndCharacterRecord";
import { getDndPregenBuildSlot } from "../utils/dndPregenCatalog";
import { getDndHalfCasterSlots2024 } from "./dndCasterProgression";
import {
  attainedRangerFeatures,
  dndRangerLevels,
  rangerAttackCount,
  rangerResources,
  rangerSpellCount2024,
  rangerSpells2024
} from "./dndRangerPregenShared";

const scoresForLevel = (level: number): DndAbilityScores => {
  const scores = { str: 8, dex: 16, con: 14, int: 10, wis: 15, cha: 10 };
  if (level >= 4) scores.dex += 2;
  if (level >= 8) scores.dex += 2;
  if (level >= 12) scores.wis += 2;
  if (level >= 16) scores.wis += 2;
  if (level >= 19) scores.wis += 1;
  return scores;
};

const advancementForLevel = (level: number): string[] => [
  "Soldier Origin Feat: Savage Attacker",
  "Human Versatile Origin Feat: Skilled — Medicine, Nature, Thieves' Tools",
  ...attainedRangerFeatures(level, [
    [4, "Level 4 Ability Score Improvement: Dexterity +2"],
    [8, "Level 8 Ability Score Improvement: Dexterity +2"],
    [12, "Level 12 Ability Score Improvement: Wisdom +2"],
    [16, "Level 16 Ability Score Improvement: Wisdom +2"],
    [19, "Level 19 Boon of Dimensional Travel: Wisdom +1 and a 30-foot teleport after the Attack or Magic action"]
  ])
];

const classFeaturesForLevel = (level: number): string[] => attainedRangerFeatures(level, [
  [1, "Spellcasting: Wisdom is the spellcasting ability; the Ranger table determines prepared spells"],
  [1, "Favored Enemy: Hunter's Mark is always prepared and gains free casts per Long Rest"],
  [1, "Weapon Mastery: use the mastery properties of Longbows and Shortswords; choices can change after a Long Rest"],
  [2, "Deft Explorer: Survival Expertise and two additional languages"],
  [2, "Fighting Style — Defense: +1 Armor Class while wearing armor"],
  [3, "Ranger Subclass — Hunter"],
  [4, "Ability Score Improvement"],
  [5, "Extra Attack: make two attacks with the Attack action"],
  [6, "Roving: Speed increases by 10 feet without Heavy Armor; gain equal Climb and Swim Speeds"],
  [8, "Ability Score Improvement"],
  [9, "Expertise: gain Expertise in Perception and Stealth"],
  [10, "Tireless: Magic action; gain 1d8 + Wisdom modifier Temporary Hit Points a Wisdom-modifier number of times per Long Rest"],
  [12, "Ability Score Improvement"],
  [13, "Relentless Hunter: taking damage cannot break Concentration on Hunter's Mark"],
  [14, "Nature's Veil: Bonus Action; become Invisible until the end of the next turn, Wisdom-modifier uses per Long Rest"],
  [16, "Ability Score Improvement"],
  [17, "Precise Hunter: Advantage on attacks against the creature marked by Hunter's Mark"],
  [18, "Feral Senses: gain Blindsight 30 feet"],
  [19, "Epic Boon — Boon of Dimensional Travel"],
  [20, "Foe Slayer: Hunter's Mark extra-damage die becomes d10 instead of d6"]
]);

const subclassFeaturesForLevel = (level: number): string[] => attainedRangerFeatures(level, [
  [3, "Hunter's Lore: while a creature is marked, know its Immunities, Resistances, and Vulnerabilities"],
  [3, "Hunter's Prey: choose Colossus Slayer or Horde Breaker after each Short or Long Rest; default Colossus Slayer"],
  [7, "Defensive Tactics: choose Escape the Horde or Multiattack Defense after each Short or Long Rest; default Multiattack Defense"],
  [11, "Superior Hunter's Prey: once per turn, Hunter's Mark extra damage can also damage a different creature within 30 feet"],
  [15, "Superior Hunter's Defense: Reaction when damaged; gain Resistance to that damage and the same damage type until turn end"]
]);

const makeRecord = (level: number): DndCharacterRecord => {
  const slot = getDndPregenBuildSlot("srd-5.2.1-2024", "ranger", "hunter", level);
  if (!slot) throw new Error(`Missing 2024 Ranger / Hunter build slot at level ${level}.`);
  const abilityScores = scoresForLevel(level);
  const dexterityModifier = dndAbilityModifier(abilityScores.dex);
  const wisdomModifier = dndAbilityModifier(abilityScores.wis);
  const armorClass = 12 + dexterityModifier + (level >= 2 ? 1 : 0);
  const prepared = rangerSpells2024(level);
  return {
    id: `${slot.id}-arden-wildmark`, buildSlotId: slot.id, ruleset: slot.ruleset,
    name: "Arden Wildmark", classId: "ranger", className: "Ranger",
    subclassId: "hunter", subclassName: "Hunter", subclassUnlockLevel: 3, level,
    species: "Human", background: "Soldier", abilityScores, hitDie: 10,
    maximumHitPoints: dndFixedHitPoints(10, level, abilityScores.con), armorClass,
    speedFeet: level >= 6 ? 40 : 30,
    savingThrowProficiencies: ["str", "dex"],
    skillProficiencies: ["Athletics", "Intimidation", "Investigation", "Medicine", "Nature", "Perception", "Stealth", "Survival"],
    languages: ["Common", "Elvish", "Draconic", ...(level >= 2 ? ["Giant", "Goblin"] : [])],
    toolProficiencies: ["Dice Set", "Thieves' Tools"],
    senses: level >= 18 ? ["Blindsight 30 ft."] : ["Normal vision"],
    attacks: [
      { id: "longbow", name: "Longbow", attackAbility: "dex", proficient: true, damageFormula: `1d8+${dexterityModifier}`, damageType: "piercing", rangeOrReach: "150/600 ft.", notes: `Slow mastery; ammunition, heavy, two-handed; 20 arrows carried. Attack action: ${rangerAttackCount(level)} attack${rangerAttackCount(level) === 1 ? "" : "s"}. Hunter's Mark adds ${level >= 20 ? "1d10" : "1d6"} once per hit.${level >= 3 ? " Colossus Slayer can add 1d8 once per turn." : ""}` },
      { id: "shortsword", name: "Shortsword", attackAbility: "dex", proficient: true, damageFormula: `1d6+${dexterityModifier}`, damageType: "piercing", rangeOrReach: "5 ft.", notes: "Finesse, light; Vex mastery; carried for close combat." }
    ],
    resources: rangerResources(slot.ruleset, level, wisdomModifier), spellcastingExpected: true,
    spellcasting: {
      kind: "prepared", ability: "wis", cantrips: [],
      spells: [...prepared, "Hunter's Mark"], slotsByLevel: getDndHalfCasterSlots2024(level),
      notes: `Ranger table Prepared Spells: ${rangerSpellCount2024(level)}. Favored Enemy adds Hunter's Mark outside that count.`
    },
    classFeatures: classFeaturesForLevel(level), subclassFeatures: subclassFeaturesForLevel(level),
    advancementChoices: advancementForLevel(level),
    equipment: ["Studded Leather", "Longbow", "20 Arrows", "Shortsword", "Druidic Focus", "Explorer's Pack", "Soldier Background Equipment", "Dice Set", "Thieves' Tools"],
    currencyGp: 7,
    notes: [
      "Soldier supplies Savage Attacker, Athletics, Intimidation, a gaming set, and the selected Dexterity and Constitution increases.",
      "Human grants Resourceful, Skillful (Investigation), and Versatile; Skilled supplies Medicine, Nature, and Thieves' Tools.",
      "Defense Fighting Style is included in Armor Class from level 2 onward.",
      "Hunter's Mark free casts are tracked separately from normal spell slots."
    ],
    sources: [
      { label: "2024 Free Rules — Ranger and Hunter", url: "https://www.dndbeyond.com/sources/dnd/br-2024/character-classes", scope: "public-srd" },
      { label: "2024 Free Rules — Human and Soldier", url: "https://www.dndbeyond.com/sources/dnd/br-2024/character-origins", scope: "public-srd" },
      { label: "2024 Free Rules — Feats", url: "https://www.dndbeyond.com/sources/dnd/br-2024/feats", scope: "public-srd" },
      { label: "2024 Free Rules — Equipment", url: "https://www.dndbeyond.com/sources/dnd/br-2024/equipment", scope: "public-srd" }
    ],
    printableSummaryReady: true
  };
};

export const dndRangerPregens2024: DndCharacterRecord[] = dndRangerLevels.map(makeRecord);
