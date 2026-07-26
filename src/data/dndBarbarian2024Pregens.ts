import type { DndAbilityScores, DndCharacterRecord, DndCharacterResource } from "../types/dndCharacter";
import { dndAbilityModifier, dndFixedHitPoints } from "../utils/dndCharacterRecord";
import { getDndPregenBuildSlot } from "../utils/dndPregenCatalog";
import {
  attainedBarbarianFeatures,
  barbarianAttackCount,
  barbarianLevels,
  barbarianRageDamage,
  barbarianRageResource,
  barbarianUnarmoredAc
} from "./dndBarbarianPregenShared";

const abilityScores2024 = (level: number): DndAbilityScores => {
  const scores = { str: 17, dex: 13, con: 15, int: 10, wis: 12, cha: 8 };
  if (level >= 4) scores.str += 2;
  if (level >= 8) { scores.str += 1; scores.con += 1; }
  if (level >= 12) scores.con += 2;
  if (level >= 16) scores.con += 2;
  if (level >= 19) scores.dex += 1;
  if (level >= 20) { scores.str += 4; scores.con += 4; }
  return scores;
};

const choices2024 = (level: number): string[] => [
  "Soldier Origin Feat: Savage Attacker",
  "Human Versatile Origin Feat: Tough",
  ...attainedBarbarianFeatures(level, [
    [4, "Level 4 Ability Score Improvement: Strength +2"],
    [8, "Level 8 Ability Score Improvement: Strength +1, Constitution +1"],
    [12, "Level 12 Ability Score Improvement: Constitution +2"],
    [16, "Level 16 Ability Score Improvement: Constitution +2"],
    [19, "Level 19 Boon of Irresistible Offense: Dexterity +1"]
  ])
];

const masteryCount = (level: number): number => level >= 10 ? 4 : level >= 4 ? 3 : 2;

const classFeatures2024 = (level: number): string[] => [
  ...attainedBarbarianFeatures(level, [
    [1, "Rage: Bonus Action; Strength Advantage, Rage damage, and resistance to bludgeoning, piercing, and slashing damage"],
    [1, "Unarmored Defense: AC equals 10 + Dexterity modifier + Constitution modifier"],
    [1, "Weapon Mastery: use selected Simple or Martial Melee weapon mastery properties"],
    [2, "Danger Sense: Advantage on Dexterity saves unless incapacitated"],
    [2, "Reckless Attack: Strength attacks gain Advantage until next turn; attacks against you gain Advantage"],
    [3, "Primal Knowledge: gain another Barbarian skill; use Strength for selected skills while raging"],
    [5, "Extra Attack: make two attacks with the Attack action"],
    [5, "Fast Movement: Speed increases by 10 feet while not wearing Heavy armor"],
    [7, "Feral Instinct: Advantage on Initiative"],
    [7, "Instinctive Pounce: move up to half Speed when entering Rage"],
    [9, "Brutal Strike: forgo Reckless Advantage on one hit for +1d10 damage and Forceful or Hamstring Blow"],
    [11, "Relentless Rage: DC 10 Constitution save to change 0 HP to twice Barbarian level; DC rises by 5 until a rest"],
    [13, "Improved Brutal Strike: add Staggering Blow and Sundering Blow options"],
    [15, "Persistent Rage: once per Long Rest, regain all Rage uses on Initiative; Rage lasts 10 minutes without extension"],
    [17, "Improved Brutal Strike: damage becomes 2d10 and applies two different effects"],
    [18, "Indomitable Might: use Strength score when a Strength check or save total is lower"],
    [19, "Epic Boon: Boon of Irresistible Offense"],
    [20, "Primal Champion: Strength and Constitution increase by 4, to a maximum of 25"]
  ]),
  `Weapon Mastery choices available: ${masteryCount(level)}`
];

const subclassFeatures2024 = (level: number): string[] => attainedBarbarianFeatures(level, [
  [3, "Frenzy: while raging, Reckless Attack adds d6s equal to Rage Damage bonus to the first Strength-based hit each turn"],
  [6, "Mindless Rage: immunity to Charmed and Frightened while raging; entering Rage ends either condition"],
  [10, "Retaliation: Reaction; after a creature within 5 feet damages you, make one melee attack against it"],
  [14, "Intimidating Presence: Bonus Action; chosen creatures in a 30-foot Emanation make a Wisdom save against DC 8 + Strength modifier + Proficiency Bonus or become frightened for 1 minute"]
]);

const resources2024 = (level: number): DndCharacterResource[] => [
  barbarianRageResource(level, "2024"),
  ...(level >= 14 ? [{ id: "intimidating-presence", name: "Intimidating Presence", maximum: 1, refresh: "long-rest" as const, notes: "Restore the use early by expending one Rage use." }] : []),
  ...(level >= 15 ? [{ id: "persistent-rage-refresh", name: "Persistent Rage refresh", maximum: 1, refresh: "long-rest" as const, notes: "When rolling Initiative, regain all expended Rage uses." }] : [])
];

const makeBarbarian2024 = (level: number): DndCharacterRecord => {
  const slot = getDndPregenBuildSlot("srd-5.2.1-2024", "barbarian", "path-berserker", level);
  if (!slot) throw new Error(`Missing 2024 Barbarian build slot at level ${level}.`);
  const abilityScores = abilityScores2024(level);
  const strengthModifier = dndAbilityModifier(abilityScores.str);
  const rageDamage = barbarianRageDamage(level);
  return {
    id: `${slot.id}-dain-redstorm`, buildSlotId: slot.id, ruleset: slot.ruleset,
    name: "Dain Redstorm", classId: "barbarian", className: "Barbarian",
    subclassId: "path-berserker", subclassName: "Path of the Berserker", subclassUnlockLevel: 3,
    level, species: "Human", background: "Soldier", abilityScores, hitDie: 12,
    maximumHitPoints: dndFixedHitPoints(12, level, abilityScores.con) + (2 * level),
    armorClass: barbarianUnarmoredAc(abilityScores), speedFeet: level >= 5 ? 40 : 30,
    savingThrowProficiencies: ["str", "con"],
    skillProficiencies: ["Athletics", "Intimidation", "Perception", "Survival", "Insight"],
    languages: ["Common", "Dwarvish", "Giant"], toolProficiencies: ["Dice Set"], senses: ["Normal vision"],
    attacks: [
      { id: "greataxe", name: "Greataxe", attackAbility: "str", proficient: true, damageFormula: `1d12+${strengthModifier}`, damageType: "slashing", rangeOrReach: "5 ft.", notes: `Cleave mastery. Add +${rageDamage} while raging.${level >= 3 ? ` Frenzy adds ${rageDamage}d6 to the first Reckless Strength hit each turn.` : ""} Attack action: ${barbarianAttackCount(level)} attack${barbarianAttackCount(level) === 1 ? "" : "s"}.` },
      { id: "handaxe", name: "Handaxe", attackAbility: "str", proficient: true, damageFormula: `1d6+${strengthModifier}`, damageType: "slashing", rangeOrReach: "20/60 ft.", notes: "Vex mastery; four carried." }
    ],
    resources: resources2024(level), spellcastingExpected: false, spellcasting: { kind: "none" },
    classFeatures: classFeatures2024(level), subclassFeatures: subclassFeatures2024(level), advancementChoices: choices2024(level),
    equipment: ["Greataxe", "4 Handaxes", "Explorer's Pack", "Soldier Background Equipment", "Dice Set"], currencyGp: 15,
    notes: ["Soldier ability increases are included.", "Human grants Resourceful, Skillful (Insight), and Versatile (Tough).", "Tough adds 2 HP per level.", `Rage damage bonus is +${rageDamage}.`, `Attack action makes ${barbarianAttackCount(level)} attack${barbarianAttackCount(level) === 1 ? "" : "s"}.`],
    sources: [
      { label: "2024 Free Rules — Barbarian and Path of the Berserker", url: "https://www.dndbeyond.com/sources/dnd/br-2024/character-classes", scope: "public-srd" },
      { label: "2024 Free Rules — Character Origins", url: "https://www.dndbeyond.com/sources/dnd/br-2024/character-origins", scope: "public-srd" },
      { label: "2024 Free Rules — Feats", url: "https://www.dndbeyond.com/sources/dnd/br-2024/feats", scope: "public-srd" }
    ],
    printableSummaryReady: true
  };
};

export const dndBarbarian2024Pregens = barbarianLevels.map(makeBarbarian2024);
