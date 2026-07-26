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
  subclassId: string;
  subclassName: string;
  subclassUnlockLevel: number;
  sourceLabel: string;
  sourceUrl: string;
  licenseScope: "public-srd";
};

type DefinitionRow = readonly [
  DndPregenClassId,
  string,
  string,
  string,
  number
];

const createDefinitions = (
  ruleset: RulesetId,
  sourceLabel: string,
  sourceUrl: string,
  rows: DefinitionRow[]
): DndPregenClassDefinition[] => rows.map(([
  classId,
  className,
  subclassId,
  subclassName,
  subclassUnlockLevel
]) => ({
  ruleset,
  classId,
  className,
  subclassId,
  subclassName,
  subclassUnlockLevel,
  sourceLabel,
  sourceUrl,
  licenseScope: "public-srd"
}));

const definitions2014 = createDefinitions(
  "srd-5.1-2014",
  "2014 Basic Rules / SRD 5.1 class",
  "https://www.dndbeyond.com/sources/dnd/basic-rules-2014/classes",
  [
    ["barbarian", "Barbarian", "path-berserker", "Path of the Berserker", 3],
    ["bard", "Bard", "college-lore", "College of Lore", 3],
    ["cleric", "Cleric", "life-domain", "Life Domain", 1],
    ["druid", "Druid", "circle-land", "Circle of the Land", 2],
    ["fighter", "Fighter", "champion", "Champion", 3],
    ["monk", "Monk", "way-open-hand", "Way of the Open Hand", 3],
    ["paladin", "Paladin", "oath-devotion", "Oath of Devotion", 3],
    ["ranger", "Ranger", "hunter", "Hunter", 3],
    ["rogue", "Rogue", "thief", "Thief", 3],
    ["sorcerer", "Sorcerer", "draconic-bloodline", "Draconic Bloodline", 1],
    ["warlock", "Warlock", "fiend", "The Fiend", 1],
    ["wizard", "Wizard", "school-evocation", "School of Evocation", 2]
  ]
);

const definitions2024 = createDefinitions(
  "srd-5.2.1-2024",
  "2024 Free Rules / SRD 5.2.1 class",
  "https://www.dndbeyond.com/sources/dnd/br-2024/character-classes",
  [
    ["barbarian", "Barbarian", "path-berserker", "Path of the Berserker", 3],
    ["bard", "Bard", "college-lore", "College of Lore", 3],
    ["cleric", "Cleric", "life-domain", "Life Domain", 3],
    ["druid", "Druid", "circle-land", "Circle of the Land", 3],
    ["fighter", "Fighter", "champion", "Champion", 3],
    ["monk", "Monk", "warrior-open-hand", "Warrior of the Open Hand", 3],
    ["paladin", "Paladin", "oath-devotion", "Oath of Devotion", 3],
    ["ranger", "Ranger", "hunter", "Hunter", 3],
    ["rogue", "Rogue", "thief", "Thief", 3],
    ["sorcerer", "Sorcerer", "draconic-sorcery", "Draconic Sorcery", 3],
    ["warlock", "Warlock", "fiend-patron", "Fiend Patron", 3],
    ["wizard", "Wizard", "evoker", "Evoker", 3]
  ]
);

export const dndPregenClassDefinitions: DndPregenClassDefinition[] = [
  ...definitions2014,
  ...definitions2024
];
