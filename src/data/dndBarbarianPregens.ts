import type { DndAbilityScores, DndCharacterRecord, DndCharacterResource } from "../types/dndCharacter";
import type { RulesetId } from "../types/ruleCards";
import {
  dndAbilityModifier,
  dndFixedHitPoints,
  dndProficiencyBonus
} from "../utils/dndCharacterRecord";
import { getDndPregenBuildSlot } from "../utils/dndPregenCatalog";

const levels = Array.from({ length: 20 }, (_, index) => index + 1);

const attained = (level: number, entries: Array<[number, string]>): string[] =>
  entries.filter(([unlock]) => level >= unlock).map(([, feature]) => feature);

const attackCount = (level: number): number => level >= 5 ? 2 : 1;
const rageDamage = (level: number): number => level >= 16 ? 4 : level >= 9 ? 3 : 2;
const rageUses2014 = (level: number): number | "unlimited" => {
  if (level >= 20) return "unlimited";
  if (level >= 17) return 6;
  if (level >= 12) return 5;
  if (level >= 6) return 4;
  if (level >= 3) return 3;
  return 2;
};
const rageUses2024 = (level: number): number => level >= 17 ? 6 : level >= 12 ? 5 : level >= 6 ? 4 : level >= 3 ? 3 : 2;
const masteryCount2024 = (level: number): number => level >= 10 ? 4 : level >= 4 ? 3 : 2;

const scores2014 = (level: number): DndAbilityScores => {
  const scores = { str: 17, dex: 13, con: 15, int: 8, wis: 12, cha: 10 };
  if (level >= 4) scores.str += 2;
  if (level >= 8) { scores.str += 1; scores.con += 1; }
  if (level >= 12) scores.con += 2;
  if (level >= 16) scores.con += 2;
  if (level >= 19) scores.dex += 2;
  if (level >= 20) { scores.str += 4; scores.con += 4; }
  return scores;
};

const choices2014 = (level: number): string[] => attained(level, [
  [4, "Level 4 Ability Score Improvement: Strength +2"],
  [8, "Level 8 Ability Score Improvement: Strength +1, Constitution +1"],
  [12, "Level 12 Ability Score Improvement: Constitution +2"],
  [16, "Level 16 Ability Score Improvement: Constitution +2"],
  [19, "Level 19 Ability Score Improvement: Dexterity +2"]
]);

const scores2024 = (level: number): DndAbilityScores => {
  const scores = { str: 17, dex: 14, con: 14, int: 10, wis: 12, cha: 8 };
  if (level >= 4) scores.str += 2;
  if (level >= 8) { scores.str += 1; scores.con += 1; }
  if (level >= 12) { scores.con += 1; scores.dex += 1; }
  if (level >= 16) scores.con += 2;
  if (level >= 19) scores.str += 1;
  if (level >= 20) { scores.str += 4; scores.con += 4; }
  return scores;
};

const choices2024 = (level: number): string[] => [
  "Soldier Origin Feat: Savage Attacker",
  ...attained(level, [
    [4, "Level 4 Ability Score Improvement: Strength +2"],
    [8, "Level 8 Ability Score Improvement: Strength +1, Constitution +1"],
    [12, "Level 12 Ability Score Improvement: Constitution +1, Dexterity +1"],
    [16, "Level 16 Ability Score Improvement: Constitution +2"],
    [19, "Level 19 Boon of Irresistible Offense: Strength +1; ignore B/P/S Resistance; a natural 20 deals extra damage equal to Strength"]
  ])
];

const classFeatures2014 = (level: number): string[] => [
  `Rage: ${rageUses2014(level) === "unlimited" ? "unlimited uses" : `${rageUses2014(level)} use${rageUses2014(level) === 1 ? "" : "s"} per Long Rest`}; +${rageDamage(level)} Strength-melee damage; Advantage on Strength checks and saves; Resistance to bludgeoning, piercing, and slashing damage`,
  "Unarmored Defense: AC equals 10 + Dexterity modifier + Constitution modifier; a Shield is allowed",
  ...attained(level, [
    [2, "Reckless Attack: gain Advantage on Strength melee attacks this turn; attacks against you have Advantage until your next turn"],
    [2, "Danger Sense: Advantage on visible Dexterity saves while not Blinded, Deafened, or Incapacitated"],
    [4, "Ability Score Improvement"],
    [5, "Extra Attack: make two attacks with the Attack action"],
    [5, "Fast Movement: Speed increases by 10 feet while not wearing Heavy armor"],
    [7, "Feral Instinct: Advantage on Initiative; act normally on a first-turn surprise by entering Rage before doing anything else"],
    [8, "Ability Score Improvement"],
    [9, "Brutal Critical: one additional weapon damage die on a melee critical hit"],
    [11, "Relentless Rage: while Raging, a DC 10 Constitution save can change a non-instant-death drop to 0 HP into 1 HP; DC rises by 5 per use and resets on a Short or Long Rest"],
    [12, "Ability Score Improvement"],
    [13, "Brutal Critical: two additional weapon damage dice on a melee critical hit"],
    [15, "Persistent Rage: Rage ends early only if you fall Unconscious or choose to end it"],
    [16, "Ability Score Improvement"],
    [17, "Brutal Critical: three additional weapon damage dice on a melee critical hit"],
    [18, "Indomitable Might: use Strength score when a Strength check total is lower"],
    [19, "Ability Score Improvement"],
    [20, "Primal Champion: Strength and Constitution increase by 4, to a maximum of 24; Rage uses become unlimited"]
  ])
];

const subclassFeatures2014 = (level: number): string[] => attained(level, [
  [3, "Frenzy: when entering Rage, choose to Frenzy; after that turn, make one melee weapon attack as a Bonus Action each turn while Raging; gain one Exhaustion level when the Rage ends"],
  [6, "Mindless Rage: while Raging, you can’t be Charmed or Frightened; entering Rage suspends either condition"],
  [10, "Intimidating Presence: Action; one creature within 30 feet that can see or hear you makes a Wisdom save against DC 8 + Proficiency Bonus + Charisma modifier or is Frightened until the end of your next turn; use an Action each turn to extend"],
  [14, "Retaliation: when a creature within 5 feet damages you, use your Reaction to make a melee weapon attack against it"]
]);

const classFeatures2024 = (level: number): string[] => [
  `Rage: ${rageUses2024(level)} uses; regain one on a Short Rest and all on a Long Rest; +${rageDamage(level)} Strength-attack damage; B/P/S Resistance; Advantage on Strength checks and saves`,
  "Unarmored Defense: base AC equals 10 + Dexterity modifier + Constitution modifier; a Shield is allowed",
  `Weapon Mastery: ${masteryCount2024(level)} melee weapon choices after each Long Rest`,
  ...attained(level, [
    [2, "Danger Sense: Advantage on Dexterity saves unless Incapacitated"],
    [2, "Reckless Attack: after choosing it on your first attack, Strength attacks have Advantage until your next turn and attacks against you have Advantage"],
    [3, "Primal Knowledge: gain one Barbarian skill; while Raging, use Strength for Acrobatics, Intimidation, Perception, Stealth, or Survival checks"],
    [4, "Ability Score Improvement"],
    [5, "Extra Attack: make two attacks with the Attack action"],
    [5, "Fast Movement: Speed increases by 10 feet while not wearing Heavy armor"],
    [7, "Feral Instinct: Advantage on Initiative"],
    [7, "Instinctive Pounce: as part of the Bonus Action used to enter Rage, move up to half Speed"],
    [8, "Ability Score Improvement"],
    [9, "Brutal Strike: when using Reckless Attack, forgo Advantage on one eligible Strength attack; on a hit deal +1d10 and choose Forceful Blow or Hamstring Blow"],
    [11, "Relentless Rage: while Raging, a DC 10 Constitution save can change a non-instant-death drop to 0 HP into HP equal to twice Barbarian level; DC rises by 5 and resets on a Short or Long Rest"],
    [12, "Ability Score Improvement"],
    [13, "Improved Brutal Strike: add Staggering Blow and Sundering Blow options"],
    [15, "Persistent Rage: regain all Rage uses on Initiative once per Long Rest; Rage lasts 10 minutes without extension and ends early only from Unconscious or Heavy armor"],
    [16, "Ability Score Improvement"],
    [17, "Improved Brutal Strike: extra damage becomes 2d10 and two different effects can be applied"],
    [18, "Indomitable Might: use Strength score when a Strength check or save total is lower"],
    [19, "Epic Boon — Boon of Irresistible Offense"],
    [20, "Primal Champion: Strength and Constitution increase by 4, to a maximum of 25"]
  ])
];

const subclassFeatures2024 = (level: number): string[] => attained(level, [
  [3, `Frenzy: while Raging after using Reckless Attack, the first Strength-based hit each turn deals +${rageDamage(level)}d6 damage`],
  [6, "Mindless Rage: Immunity to Charmed and Frightened while Raging; entering Rage ends either condition"],
  [10, "Retaliation: when a creature within 5 feet damages you, use your Reaction to make one melee attack against it"],
  [14, "Intimidating Presence: Bonus Action; chosen creatures in a 30-foot Emanation make a Wisdom save against DC 8 + Strength modifier + Proficiency Bonus or become Frightened for 1 minute, repeating at each turn end; one use per Long Rest or restore by spending Rage"]
]);

const resources2014 = (level: number): DndCharacterResource[] => [
  {
    id: "rage",
    name: "Rage",
    maximum: rageUses2014(level),
    refresh: level >= 20 ? "none" : "long-rest",
    notes: level >= 20 ? "Unlimited uses." : `Bonus Action; +${rageDamage(level)} damage on qualifying Strength melee attacks.`
  },
  { id: "relentless-endurance", name: "Half-Orc Relentless Endurance", maximum: 1, refresh: "long-rest", notes: "When reduced to 0 HP but not killed outright, drop to 1 HP instead." }
];

const resources2024 = (level: number): DndCharacterResource[] => [
  { id: "rage", name: "Rage", maximum: rageUses2024(level), refresh: "long-rest", notes: `Regain one use on a Short Rest; +${rageDamage(level)} damage on qualifying Strength attacks.` },
  { id: "adrenaline-rush", name: "Orc Adrenaline Rush", maximum: dndProficiencyBonus(level), refresh: "short-rest", notes: "Bonus Action Dash and gain Temporary HP equal to Proficiency Bonus." },
  { id: "relentless-endurance", name: "Orc Relentless Endurance", maximum: 1, refresh: "long-rest", notes: "When reduced to 0 HP but not killed outright, drop to 1 HP instead." },
  ...(level >= 14 ? [{ id: "intimidating-presence", name: "Intimidating Presence", maximum: 1, refresh: "long-rest" as const, notes: "Restore its use by expending one Rage use." }] : [])
];

const make2014 = (level: number): DndCharacterRecord => {
  const slot = getDndPregenBuildSlot("srd-5.1-2014", "barbarian", level);
  if (!slot) throw new Error(`Missing 2014 Barbarian build slot at level ${level}.`);
  const abilityScores = scores2014(level);
  const strengthModifier = dndAbilityModifier(abilityScores.str);
  const rageBonus = rageDamage(level);
  const brutalDice = level >= 17 ? 3 : level >= 13 ? 2 : level >= 9 ? 1 : 0;
  return {
    id: `${slot.id}-mara-ironjaw`,
    buildSlotId: slot.id,
    ruleset: slot.ruleset,
    name: "Mara Ironjaw",
    classId: "barbarian",
    className: "Barbarian",
    subclassName: "Path of the Berserker",
    subclassUnlockLevel: 3,
    level,
    species: "Half-Orc",
    background: "Soldier",
    abilityScores,
    hitDie: 12,
    maximumHitPoints: dndFixedHitPoints(12, level, abilityScores.con),
    armorClass: 10 + dndAbilityModifier(abilityScores.dex) + dndAbilityModifier(abilityScores.con),
    speedFeet: level >= 5 ? 40 : 30,
    savingThrowProficiencies: ["str", "con"],
    skillProficiencies: ["Athletics", "Intimidation", "Survival", "Perception", "Nature"],
    languages: ["Common", "Orc"],
    toolProficiencies: ["Dice Set", "Vehicles (Land)"],
    senses: ["Darkvision 60 ft."],
    attacks: [
      { id: "greataxe", name: "Greataxe", attackAbility: "str", proficient: true, damageFormula: `1d12+${strengthModifier}`, damageType: "slashing", rangeOrReach: "5 ft.", notes: `Attack action: ${attackCount(level)} attack${attackCount(level) === 1 ? "" : "s"}. On a critical hit, Half-Orc Savage Attacks adds one weapon die${brutalDice ? ` and Brutal Critical adds ${brutalDice}` : ""}.` },
      { id: "greataxe-rage", name: "Greataxe while Raging", attackAbility: "str", proficient: true, damageFormula: `1d12+${strengthModifier + rageBonus}`, damageType: "slashing", rangeOrReach: "5 ft.", notes: level >= 3 ? "Frenzy can add one Bonus Action melee attack each turn after the Rage-entry turn, but causes one Exhaustion level when Rage ends." : "Includes Rage damage." },
      { id: "handaxe", name: "Handaxe", attackAbility: "str", proficient: true, damageFormula: `1d6+${strengthModifier}`, damageType: "slashing", rangeOrReach: "20/60 ft.", notes: "Two carried." }
    ],
    resources: resources2014(level),
    spellcastingExpected: false,
    spellcasting: { kind: "none" },
    classFeatures: classFeatures2014(level),
    subclassFeatures: subclassFeatures2014(level),
    advancementChoices: choices2014(level),
    equipment: ["Greataxe", "2 Handaxes", "Explorer's Pack", "4 Javelins", "Insignia of Rank", "Trophy from a Fallen Enemy", "Dice Set", "Common Clothes"],
    currencyGp: 10,
    notes: [
      "Half-Orc Menacing supplies Intimidation; the duplicate Soldier Intimidation proficiency is replaced with Survival.",
      "Half-Orc Savage Attacks adds one weapon damage die to a melee critical hit.",
      "Reckless Attack is powerful but grants enemies Advantage against you until your next turn.",
      `Attack action makes ${attackCount(level)} attack${attackCount(level) === 1 ? "" : "s"}.`
    ],
    sources: [
      { label: "2014 Basic Rules — Barbarian and Berserker", url: "https://www.dndbeyond.com/sources/dnd/basic-rules-2014/classes", scope: "public-srd" },
      { label: "2014 Basic Rules — Half-Orc", url: "https://www.dndbeyond.com/sources/dnd/basic-rules-2014/races", scope: "public-srd" },
      { label: "2014 Basic Rules — Soldier", url: "https://www.dndbeyond.com/sources/dnd/basic-rules-2014/personality-and-background", scope: "public-srd" }
    ],
    printableSummaryReady: true
  };
};

const make2024 = (level: number): DndCharacterRecord => {
  const slot = getDndPregenBuildSlot("srd-5.2.1-2024", "barbarian", level);
  if (!slot) throw new Error(`Missing 2024 Barbarian build slot at level ${level}.`);
  const abilityScores = scores2024(level);
  const strengthModifier = dndAbilityModifier(abilityScores.str);
  const rageBonus = rageDamage(level);
  return {
    id: `${slot.id}-torra-ashfang`,
    buildSlotId: slot.id,
    ruleset: slot.ruleset,
    name: "Torra Ashfang",
    classId: "barbarian",
    className: "Barbarian",
    subclassName: "Path of the Berserker",
    subclassUnlockLevel: 3,
    level,
    species: "Orc",
    background: "Soldier",
    abilityScores,
    hitDie: 12,
    maximumHitPoints: dndFixedHitPoints(12, level, abilityScores.con),
    armorClass: 10 + dndAbilityModifier(abilityScores.dex) + dndAbilityModifier(abilityScores.con),
    speedFeet: level >= 5 ? 40 : 30,
    savingThrowProficiencies: ["str", "con"],
    skillProficiencies: level >= 3
      ? ["Athletics", "Intimidation", "Perception", "Survival", "Nature"]
      : ["Athletics", "Intimidation", "Perception", "Survival"],
    languages: ["Common", "Giant"],
    toolProficiencies: ["Dice Set"],
    senses: ["Darkvision 120 ft."],
    attacks: [
      { id: "greataxe", name: "Greataxe", attackAbility: "str", proficient: true, damageFormula: `1d12+${strengthModifier}`, damageType: "slashing", rangeOrReach: "5 ft.", notes: `Cleave mastery. Savage Attacker once per turn. Attack action: ${attackCount(level)} attack${attackCount(level) === 1 ? "" : "s"}.` },
      { id: "greataxe-rage", name: "Greataxe while Raging", attackAbility: "str", proficient: true, damageFormula: `1d12+${strengthModifier + rageBonus}`, damageType: "slashing", rangeOrReach: "5 ft.", notes: level >= 3 ? `After using Reckless Attack, Frenzy adds ${rageBonus}d6 damage to the first Strength-based hit each turn.` : "Includes Rage damage." },
      { id: "handaxe", name: "Handaxe", attackAbility: "str", proficient: true, damageFormula: `1d6+${strengthModifier}`, damageType: "slashing", rangeOrReach: "20/60 ft.", notes: "Vex mastery; four carried." }
    ],
    resources: resources2024(level),
    spellcastingExpected: false,
    spellcasting: { kind: "none" },
    classFeatures: classFeatures2024(level),
    subclassFeatures: subclassFeatures2024(level),
    advancementChoices: choices2024(level),
    equipment: ["Greataxe", "4 Handaxes", "Explorer's Pack", "Spear", "Shortbow", "20 Arrows", "Dice Set", "Healer's Kit", "Quiver", "Traveler's Clothes"],
    currencyGp: 29,
    notes: [
      "Soldier supplies Savage Attacker, Athletics, Intimidation, Dice Set, and the selected Strength/Constitution increases.",
      "Orc Adrenaline Rush is a Bonus Action Dash that also grants Temporary HP equal to Proficiency Bonus.",
      "Rage cannot maintain Concentration or cast spells, and it can be extended by attacking, forcing a save, or using a Bonus Action.",
      `Attack action makes ${attackCount(level)} attack${attackCount(level) === 1 ? "" : "s"}.`
    ],
    sources: [
      { label: "2024 Free Rules — Barbarian and Berserker", url: "https://www.dndbeyond.com/sources/dnd/br-2024/character-classes", scope: "public-srd" },
      { label: "2024 Free Rules — Orc and Soldier", url: "https://www.dndbeyond.com/sources/dnd/br-2024/character-origins", scope: "public-srd" },
      { label: "2024 Free Rules — Feats", url: "https://www.dndbeyond.com/sources/dnd/br-2024/feats", scope: "public-srd" },
      { label: "2024 Free Rules — Equipment", url: "https://www.dndbeyond.com/sources/dnd/br-2024/equipment", scope: "public-srd" }
    ],
    printableSummaryReady: true
  };
};

export const dndBarbarianPregenRecords: DndCharacterRecord[] = [
  ...levels.map(make2014),
  ...levels.map(make2024)
];

export const getDndBarbarianPregenRecord = (
  ruleset: RulesetId,
  level: number
): DndCharacterRecord | undefined => dndBarbarianPregenRecords.find((record) => (
  record.ruleset === ruleset && record.level === level
));
