import type { DndAbilityScores, DndCharacterRecord, DndCharacterResource } from "../types/dndCharacter";
import type { RulesetId } from "../types/ruleCards";
import { dndAbilityModifier, dndFixedHitPoints } from "../utils/dndCharacterRecord";
import { getDndPregenBuildSlot } from "../utils/dndPregenCatalog";

const levels = Array.from({ length: 20 }, (_, index) => index + 1);

const attained = (level: number, entries: Array<[number, string]>): string[] =>
  entries.filter(([unlock]) => level >= unlock).map(([, feature]) => feature);

const fighterAttackCount = (level: number): number => level >= 20 ? 4 : level >= 11 ? 3 : level >= 5 ? 2 : 1;

const scores2014 = (level: number): DndAbilityScores => {
  const scores = { str: 16, dex: 13, con: 15, int: 11, wis: 14, cha: 9 };
  if (level >= 4) scores.str += 2;
  if (level >= 6) scores.str += 2;
  if (level >= 8) scores.con += 2;
  if (level >= 12) scores.con += 2;
  if (level >= 14) { scores.con += 1; scores.dex += 1; }
  if (level >= 16) scores.wis += 2;
  if (level >= 19) scores.dex += 2;
  return scores;
};

const choices2014 = (level: number): string[] => attained(level, [
  [4, "Level 4 Ability Score Improvement: Strength +2"],
  [6, "Level 6 Ability Score Improvement: Strength +2"],
  [8, "Level 8 Ability Score Improvement: Constitution +2"],
  [12, "Level 12 Ability Score Improvement: Constitution +2"],
  [14, "Level 14 Ability Score Improvement: Constitution +1, Dexterity +1"],
  [16, "Level 16 Ability Score Improvement: Wisdom +2"],
  [19, "Level 19 Ability Score Improvement: Dexterity +2"]
]);

const scores2024 = (level: number): DndAbilityScores => {
  const scores = { str: 17, dex: 13, con: 15, int: 10, wis: 12, cha: 8 };
  if (level >= 4) scores.str += 2;
  if (level >= 6) { scores.str += 1; scores.con += 1; }
  if (level >= 8) scores.con += 2;
  if (level >= 12) scores.con += 2;
  if (level >= 14) scores.wis += 2;
  if (level >= 16) scores.dex += 2;
  if (level >= 19) scores.dex += 1;
  return scores;
};

const choices2024 = (level: number): string[] => [
  "Soldier Origin Feat: Savage Attacker",
  "Human Versatile Origin Feat: Skilled (Medicine, Persuasion, Smith's Tools)",
  ...attained(level, [
    [4, "Level 4 Ability Score Improvement: Strength +2"],
    [6, "Level 6 Ability Score Improvement: Strength +1, Constitution +1"],
    [8, "Level 8 Ability Score Improvement: Constitution +2"],
    [12, "Level 12 Ability Score Improvement: Constitution +2"],
    [14, "Level 14 Ability Score Improvement: Wisdom +2"],
    [16, "Level 16 Ability Score Improvement: Dexterity +2"],
    [19, "Level 19 Boon of Combat Prowess: Dexterity +1; turn one missed attack into a hit once per turn"]
  ])
];

const classFeatures2014 = (level: number): string[] => attained(level, [
  [1, "Fighting Style — Defense: +1 AC while wearing armor"],
  [1, "Second Wind: Bonus Action; regain 1d10 + Fighter level HP; refresh on a Short or Long Rest"],
  [2, "Action Surge: take one additional action on your turn; refresh on a Short or Long Rest"],
  [4, "Ability Score Improvement"],
  [5, "Extra Attack: make two attacks with the Attack action"],
  [6, "Ability Score Improvement"],
  [8, "Ability Score Improvement"],
  [9, "Indomitable: reroll a failed saving throw and use the new roll; refresh on a Long Rest"],
  [11, "Extra Attack (2): make three attacks with the Attack action"],
  [12, "Ability Score Improvement"],
  [13, "Indomitable: two uses per Long Rest"],
  [14, "Ability Score Improvement"],
  [16, "Ability Score Improvement"],
  [17, "Action Surge: two uses per rest, no more than once on a turn"],
  [17, "Indomitable: three uses per Long Rest"],
  [19, "Ability Score Improvement"],
  [20, "Extra Attack (3): make four attacks with the Attack action"]
]);

const subclassFeatures2014 = (level: number): string[] => attained(level, [
  [3, "Improved Critical: weapon attacks score a critical hit on a d20 roll of 19–20"],
  [7, "Remarkable Athlete: add half Proficiency Bonus, rounded up, to unproficient STR/DEX/CON checks; running long jump gains STR modifier feet"],
  [10, "Additional Fighting Style — Dueling: +2 damage with a one-handed melee weapon while wielding no other weapon"],
  [15, "Superior Critical: weapon attacks score a critical hit on a d20 roll of 18–20"],
  [18, "Survivor: at the start of your turn, regain 5 + CON modifier HP while at half HP or less and above 0 HP"]
]);

const secondWindUses2024 = (level: number): number => level >= 10 ? 4 : level >= 4 ? 3 : 2;
const weaponMasteryCount2024 = (level: number): number => level >= 16 ? 6 : level >= 10 ? 5 : level >= 4 ? 4 : 3;

const classFeatures2024 = (level: number): string[] => attained(level, [
  [1, "Fighting Style — Defense: +1 AC while wearing Light, Medium, or Heavy armor"],
  [1, "Second Wind: Bonus Action; regain 1d10 + Fighter level HP; regain one use on a Short Rest and all on a Long Rest"],
  [1, "Weapon Mastery: use the mastery properties of selected weapons; choices can change after a Long Rest"],
  [2, "Action Surge: take one additional action except the Magic action; refresh on a Short or Long Rest"],
  [2, "Tactical Mind: after failing an ability check, expend Second Wind to add 1d10; the use is retained if the check still fails"],
  [4, "Ability Score Improvement"],
  [5, "Extra Attack: make two attacks with the Attack action"],
  [5, "Tactical Shift: after activating Second Wind as a Bonus Action, move up to half Speed without provoking Opportunity Attacks"],
  [6, "Ability Score Improvement"],
  [8, "Ability Score Improvement"],
  [9, "Indomitable: reroll a failed save with a bonus equal to Fighter level; refresh on a Long Rest"],
  [9, "Tactical Master: replace an available weapon mastery with Push, Sap, or Slow for that attack"],
  [11, "Two Extra Attacks: make three attacks with the Attack action"],
  [12, "Ability Score Improvement"],
  [13, "Indomitable: two uses per Long Rest"],
  [13, "Studied Attacks: after missing a creature, gain Advantage on your next attack against it before the end of your next turn"],
  [14, "Ability Score Improvement"],
  [16, "Ability Score Improvement"],
  [17, "Action Surge: two uses per rest, no more than once on a turn"],
  [17, "Indomitable: three uses per Long Rest"],
  [19, "Epic Boon — Boon of Combat Prowess"],
  [20, "Three Extra Attacks: make four attacks with the Attack action"]
]);

const subclassFeatures2024 = (level: number): string[] => attained(level, [
  [3, "Improved Critical: weapon and Unarmed Strike attack rolls score a critical hit on 19–20"],
  [3, "Remarkable Athlete: Advantage on Initiative and Athletics; after a critical hit, move up to half Speed without provoking Opportunity Attacks"],
  [7, "Additional Fighting Style — Great Weapon Fighting: treat a 1 or 2 on two-handed melee weapon damage dice as a 3"],
  [10, "Heroic Warrior: in combat, gain Heroic Inspiration at the start of your turn when you do not have it"],
  [15, "Superior Critical: weapon and Unarmed Strike attack rolls score a critical hit on 18–20"],
  [18, "Survivor — Defy Death: Advantage on Death Saves; 18–20 grants the natural-20 benefit"],
  [18, "Survivor — Heroic Rally: at the start of your turn, regain 5 + CON modifier HP while Bloodied and above 0 HP"]
]);

const fighterResources2014 = (level: number): DndCharacterResource[] => [
  { id: "second-wind", name: "Second Wind", maximum: 1, refresh: "short-rest", notes: `Bonus Action; regain 1d10 + ${level} HP.` },
  ...(level >= 2 ? [{ id: "action-surge", name: "Action Surge", maximum: level >= 17 ? 2 : 1, refresh: "short-rest" as const }] : []),
  ...(level >= 9 ? [{ id: "indomitable", name: "Indomitable", maximum: level >= 17 ? 3 : level >= 13 ? 2 : 1, refresh: "long-rest" as const }] : [])
];

const fighterResources2024 = (level: number): DndCharacterResource[] => [
  { id: "second-wind", name: "Second Wind", maximum: secondWindUses2024(level), refresh: "long-rest", notes: "Regain one expended use on a Short Rest and all expended uses on a Long Rest." },
  ...(level >= 2 ? [{ id: "action-surge", name: "Action Surge", maximum: level >= 17 ? 2 : 1, refresh: "short-rest" as const, notes: "No more than once on a turn; the additional action cannot be the Magic action." }] : []),
  ...(level >= 9 ? [{ id: "indomitable", name: "Indomitable", maximum: level >= 17 ? 3 : level >= 13 ? 2 : 1, refresh: "long-rest" as const }] : []),
  ...(level >= 19 ? [{ id: "combat-prowess", name: "Boon of Combat Prowess — Peerless Aim", maximum: 1, refresh: "turn" as const, notes: "When an attack misses, make it hit instead." }] : [])
];

const makeFighter2014 = (level: number): DndCharacterRecord => {
  const slot = getDndPregenBuildSlot("srd-5.1-2014", "fighter", "champion", level);
  if (!slot) throw new Error(`Missing 2014 Fighter build slot at level ${level}.`);
  const abilityScores = scores2014(level);
  const strengthModifier = dndAbilityModifier(abilityScores.str);
  const dexterityModifier = dndAbilityModifier(abilityScores.dex);
  const duelingBonus = level >= 10 ? 2 : 0;
  return {
    id: `${slot.id}-kara-stoneguard`,
    buildSlotId: slot.id,
    ruleset: slot.ruleset,
    name: "Kara Stoneguard",
    classId: "fighter",
    className: "Fighter",
    subclassId: "champion",
    subclassName: "Champion",
    subclassUnlockLevel: 3,
    level,
    species: "Human",
    background: "Soldier",
    abilityScores,
    hitDie: 10,
    maximumHitPoints: dndFixedHitPoints(10, level, abilityScores.con),
    armorClass: 19,
    speedFeet: 30,
    savingThrowProficiencies: ["str", "con"],
    skillProficiencies: ["Athletics", "Intimidation", "Perception", "Survival"],
    languages: ["Common", "Dwarvish"],
    toolProficiencies: ["Dice Set", "Vehicles (Land)"],
    senses: ["Normal vision"],
    attacks: [
      { id: "longsword", name: "Longsword", attackAbility: "str", proficient: true, damageFormula: `1d8+${strengthModifier + duelingBonus}`, damageType: "slashing", rangeOrReach: "5 ft.", notes: `One-handed with Shield. Attack action: ${fighterAttackCount(level)} attack${fighterAttackCount(level) === 1 ? "" : "s"}.` },
      { id: "light-crossbow", name: "Light Crossbow", attackAbility: "dex", proficient: true, damageFormula: `1d8+${dexterityModifier}`, damageType: "piercing", rangeOrReach: "80/320 ft.", notes: "Loading, ammunition, two-handed; 20 bolts carried." }
    ],
    resources: fighterResources2014(level),
    spellcastingExpected: false,
    spellcasting: { kind: "none" },
    classFeatures: classFeatures2014(level),
    subclassFeatures: subclassFeatures2014(level),
    advancementChoices: choices2014(level),
    equipment: ["Chain mail", "Shield", "Longsword", "Light Crossbow", "20 Bolts", "Explorer's Pack", "Insignia of Rank", "Trophy from a Fallen Enemy", "Dice Set", "Common Clothes"],
    currencyGp: 10,
    notes: [
      "Human ability increases are included in the listed scores; Human also grants one additional language.",
      "Soldier grants Athletics, Intimidation, a gaming set, land vehicles, and Military Rank.",
      `Attack action makes ${fighterAttackCount(level)} attack${fighterAttackCount(level) === 1 ? "" : "s"}.`
    ],
    sources: [
      { label: "2014 Basic Rules — Fighter and Champion", url: "https://www.dndbeyond.com/sources/dnd/basic-rules-2014/classes", scope: "public-srd" },
      { label: "2014 Basic Rules — Human", url: "https://www.dndbeyond.com/sources/dnd/basic-rules-2014/races", scope: "public-srd" },
      { label: "2014 Basic Rules — Soldier", url: "https://www.dndbeyond.com/sources/dnd/basic-rules-2014/personality-and-background", scope: "public-srd" }
    ],
    printableSummaryReady: true
  };
};

const makeFighter2024 = (level: number): DndCharacterRecord => {
  const slot = getDndPregenBuildSlot("srd-5.2.1-2024", "fighter", "champion", level);
  if (!slot) throw new Error(`Missing 2024 Fighter build slot at level ${level}.`);
  const abilityScores = scores2024(level);
  const strengthModifier = dndAbilityModifier(abilityScores.str);
  return {
    id: `${slot.id}-rowan-ironmark`,
    buildSlotId: slot.id,
    ruleset: slot.ruleset,
    name: "Rowan Ironmark",
    classId: "fighter",
    className: "Fighter",
    subclassId: "champion",
    subclassName: "Champion",
    subclassUnlockLevel: 3,
    level,
    species: "Human",
    background: "Soldier",
    abilityScores,
    hitDie: 10,
    maximumHitPoints: dndFixedHitPoints(10, level, abilityScores.con),
    armorClass: 17,
    speedFeet: 30,
    savingThrowProficiencies: ["str", "con"],
    skillProficiencies: ["Athletics", "Intimidation", "Perception", "Survival", "Insight", "Medicine", "Persuasion"],
    languages: ["Common", "Dwarvish"],
    toolProficiencies: ["Dice Set", "Smith's Tools"],
    senses: ["Normal vision"],
    attacks: [
      { id: "greatsword", name: "Greatsword", attackAbility: "str", proficient: true, damageFormula: `2d6+${strengthModifier}`, damageType: "slashing", rangeOrReach: "5 ft.", notes: `Graze mastery. Savage Attacker once per turn.${level >= 7 ? " Great Weapon Fighting treats damage-die results of 1 or 2 as 3." : ""} Attack action: ${fighterAttackCount(level)} attacks.` },
      { id: "flail", name: "Flail", attackAbility: "str", proficient: true, damageFormula: `1d8+${strengthModifier}`, damageType: "bludgeoning", rangeOrReach: "5 ft.", notes: "Sap mastery." },
      { id: "javelin", name: "Javelin", attackAbility: "str", proficient: true, damageFormula: `1d6+${strengthModifier}`, damageType: "piercing", rangeOrReach: "30/120 ft.", notes: "Slow mastery; 8 carried." }
    ],
    resources: fighterResources2024(level),
    spellcastingExpected: false,
    spellcasting: { kind: "none" },
    classFeatures: [...classFeatures2024(level), `Weapon Mastery choices available: ${weaponMasteryCount2024(level)}`],
    subclassFeatures: subclassFeatures2024(level),
    advancementChoices: choices2024(level),
    equipment: ["Chain Mail", "Greatsword", "Flail", "8 Javelins", "Dungeoneer's Pack", "Soldier Background Equipment", "Dice Set", "Smith's Tools"],
    currencyGp: 4,
    notes: [
      "Soldier grants Savage Attacker, Athletics, Intimidation, a gaming set, and Strength/Dexterity/Constitution ability options; the selected increases are included.",
      "Human grants Resourceful, Skillful (Insight), and Versatile; Skilled supplies Medicine, Persuasion, and Smith's Tools.",
      "Resourceful grants Heroic Inspiration whenever a Long Rest is finished.",
      `Attack action makes ${fighterAttackCount(level)} attack${fighterAttackCount(level) === 1 ? "" : "s"}.`
    ],
    sources: [
      { label: "2024 Free Rules — Fighter and Champion", url: "https://www.dndbeyond.com/sources/dnd/br-2024/character-classes", scope: "public-srd" },
      { label: "2024 Free Rules — Character Origins", url: "https://www.dndbeyond.com/sources/dnd/br-2024/character-origins", scope: "public-srd" },
      { label: "2024 Free Rules — Feats", url: "https://www.dndbeyond.com/sources/dnd/br-2024/feats", scope: "public-srd" },
      { label: "2024 Free Rules — Equipment", url: "https://www.dndbeyond.com/sources/dnd/br-2024/equipment", scope: "public-srd" }
    ],
    printableSummaryReady: true
  };
};

export const dndFighterPregenRecords: DndCharacterRecord[] = [
  ...levels.map(makeFighter2014),
  ...levels.map(makeFighter2024)
];

export const getDndReadyPregenRecord = (
  ruleset: RulesetId,
  classId: string,
  subclassId: string,
  level: number
): DndCharacterRecord | undefined => dndFighterPregenRecords.find((record) => (
  record.ruleset === ruleset
  && record.classId === classId
  && record.subclassId === subclassId
  && record.level === level
));
