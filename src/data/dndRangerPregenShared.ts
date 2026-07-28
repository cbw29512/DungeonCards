import type { DndCharacterResource } from "../types/dndCharacter";
import type { RulesetId } from "../types/ruleCards";

export const dndRangerLevels = Array.from({ length: 20 }, (_, index) => index + 1);

export const attainedRangerFeatures = (
  level: number,
  entries: Array<[number, string]>
): string[] => entries.filter(([unlock]) => level >= unlock).map(([, value]) => value);

export const rangerAttackCount = (level: number): number => level >= 5 ? 2 : 1;

const rangerSpellPool2014: Array<[number, string]> = [
  [2, "Hunter's Mark"], [2, "Cure Wounds"], [3, "Goodberry"], [5, "Pass without Trace"],
  [7, "Spike Growth"], [9, "Conjure Animals"], [11, "Plant Growth"], [13, "Freedom of Movement"],
  [15, "Stoneskin"], [17, "Commune with Nature"], [19, "Tree Stride"]
];

const rangerSpellPool2024: Array<[number, string]> = [
  [1, "Cure Wounds"], [1, "Goodberry"], [1, "Ensnaring Strike"], [1, "Fog Cloud"], [1, "Entangle"],
  [5, "Pass without Trace"], [5, "Spike Growth"], [5, "Lesser Restoration"], [5, "Silence"],
  [9, "Conjure Animals"], [9, "Plant Growth"], [9, "Revivify"], [9, "Dispel Magic"],
  [13, "Freedom of Movement"], [13, "Conjure Woodland Beings"], [13, "Locate Creature"],
  [17, "Greater Restoration"], [17, "Commune with Nature"], [17, "Tree Stride"]
];

const rangerKnownCounts2014 = [0, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11];
const rangerPreparedCounts2024 = [2, 3, 4, 5, 6, 6, 7, 7, 9, 9, 10, 10, 11, 11, 12, 12, 14, 14, 15, 15];

export const rangerSpells2014 = (level: number): string[] => rangerSpellPool2014
  .filter(([unlock]) => level >= unlock)
  .slice(0, rangerKnownCounts2014[level - 1])
  .map(([, spell]) => spell);

export const rangerSpells2024 = (level: number): string[] => rangerSpellPool2024
  .filter(([unlock]) => level >= unlock)
  .slice(0, rangerPreparedCounts2024[level - 1])
  .map(([, spell]) => spell);

export const rangerSpellCount2014 = (level: number): number => rangerKnownCounts2014[level - 1];
export const rangerSpellCount2024 = (level: number): number => rangerPreparedCounts2024[level - 1];

export const favoredEnemyUses2024 = (level: number): number =>
  level >= 17 ? 6 : level >= 13 ? 5 : level >= 9 ? 4 : level >= 5 ? 3 : 2;

export const rangerResources = (
  ruleset: RulesetId,
  level: number,
  wisdomModifier: number
): DndCharacterResource[] => ruleset === "srd-5.1-2014" ? [] : [
  {
    id: "favored-enemy-hunters-mark",
    name: "Favored Enemy — Hunter's Mark free casts",
    maximum: favoredEnemyUses2024(level),
    refresh: "long-rest",
    notes: "Hunter's Mark is always prepared and can also be cast with spell slots."
  },
  {
    id: "heroic-inspiration",
    name: "Human Resourceful — Heroic Inspiration",
    maximum: 1,
    refresh: "long-rest"
  },
  ...(level >= 10 ? [{
    id: "tireless",
    name: "Tireless",
    maximum: Math.max(1, wisdomModifier),
    refresh: "long-rest" as const,
    notes: "Magic action; gain 1d8 + Wisdom modifier Temporary Hit Points."
  }] : []),
  ...(level >= 14 ? [{
    id: "natures-veil",
    name: "Nature's Veil",
    maximum: Math.max(1, wisdomModifier),
    refresh: "long-rest" as const,
    notes: "Bonus Action; become Invisible until the end of your next turn."
  }] : [])
];
