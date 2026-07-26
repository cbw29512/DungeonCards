import type { RulesetId } from "../types/ruleCards";

export type DndPregenClassId =
  | "barbarian"
  | "bard"
  | "cleric"
  | "druid"
  | "fighter"
  | "monk"
  | "paladin"
  | "ranger"
  | "rogue"
  | "sorcerer"
  | "warlock"
  | "wizard";

export type DndPregenClassDefinition = {
  ruleset: RulesetId;
  classId: DndPregenClassId;
  className: string;
  subclassName: string;
  subclassUnlockLevel: number;
  sourceLabel: string;
  sourceUrl: string;
  licenseScope: "public-srd";
};

const source2014 = "https://www.dndbeyond.com/sources/dnd/basic-rules-2014/classes";
const source2024 = "https://www.dndbeyond.com/sources/dnd/br-2024/character-classes";

const definitions2014: DndPregenClassDefinition[] = [
  ["barbarian", "Barbarian", "Path of the Berserker", 3],
  ["bard", "Bard", "College of Lore", 3],
  ["cleric", "Cleric", "Life Domain", 1],
  ["druid", "Druid", "Circle of the Land", 2],
  ["fighter", "Fighter", "Champion", 3],
  ["monk", "Monk", "Way of the Open Hand", 3],
  ["paladin", "Paladin", "Oath of Devotion", 3],
  ["ranger", "Ranger", "Hunter", 3],
  ["rogue", "Rogue", "Thief", 3],
  ["sorcerer", "Sorcerer", "Draconic Bloodline", 1],
  ["warlock", "Warlock", "The Fiend", 1],
  ["wizard", "Wizard", "School of Evocation", 2]
].map(([classId, className, subclassName, subclassUnlockLevel]) => ({
  ruleset: "srd-5.1-2014",
  classId: classId as DndPregenClassId,
  className: className as string,
  subclassName: subclassName as string,
  subclassUnlockLevel: subclassUnlockLevel as number,
  sourceLabel: "2014 Basic Rules / SRD 5.1 class",
  sourceUrl: source2014,
  licenseScope: "public-srd"
}));

const definitions2024: DndPregenClassDefinition[] = [
  ["barbarian", "Barbarian", "Path of the Berserker"],
  ["bard", "Bard", "College of Lore"],
  ["cleric", "Cleric", "Life Domain"],
  ["druid", "Druid", "Circle of the Land"],
  ["fighter", "Fighter", "Champion"],
  ["monk", "Monk", "Warrior of the Open Hand"],
  ["paladin", "Paladin", "Oath of Devotion"],
  ["ranger", "Ranger", "Hunter"],
  ["rogue", "Rogue", "Thief"],
  ["sorcerer", "Sorcerer", "Draconic Sorcery"],
  ["warlock", "Warlock", "Fiend Patron"],
  ["wizard", "Wizard", "Evoker"]
].map(([classId, className, subclassName]) => ({
  ruleset: "srd-5.2.1-2024",
  classId: classId as DndPregenClassId,
  className: className as string,
  subclassName: subclassName as string,
  subclassUnlockLevel: 3,
  sourceLabel: "2024 Free Rules / SRD 5.2.1 class",
  sourceUrl: source2024,
  licenseScope: "public-srd"
}));

export const dndPregenClassDefinitions: DndPregenClassDefinition[] = [
  ...definitions2014,
  ...definitions2024
];
