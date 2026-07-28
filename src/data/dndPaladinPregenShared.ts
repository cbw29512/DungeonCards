import type { DndCharacterResource } from "../types/dndCharacter";
import type { RulesetId } from "../types/ruleCards";

export const dndPaladinLevels = Array.from({ length: 20 }, (_, index) => index + 1);

export const attainedPaladinFeatures = (
  level: number,
  entries: Array<[number, string]>
): string[] => entries.filter(([unlock]) => level >= unlock).map(([, value]) => value);

export const paladinAttackCount = (level: number): number => level >= 5 ? 2 : 1;

const preparedPool2014: Array<[number, string]> = [
  [2, "Bless"], [2, "Cure Wounds"], [2, "Shield of Faith"], [2, "Command"],
  [5, "Aid"], [5, "Find Steed"], [5, "Magic Weapon"], [5, "Protection from Poison"],
  [9, "Aura of Vitality"], [9, "Blinding Smite"], [9, "Create Food and Water"],
  [13, "Aura of Life"], [13, "Banishment"], [13, "Death Ward"],
  [17, "Banishing Smite"], [17, "Circle of Power"], [17, "Dispel Evil and Good"]
];

const preparedPool2024: Array<[number, string]> = [
  [1, "Bless"], [1, "Cure Wounds"], [1, "Divine Favor"], [1, "Command"],
  [5, "Aid"], [5, "Magic Weapon"], [5, "Protection from Poison"],
  [9, "Aura of Vitality"], [9, "Blinding Smite"], [9, "Create Food and Water"],
  [13, "Aura of Life"], [13, "Banishment"], [13, "Death Ward"],
  [17, "Banishing Smite"], [17, "Circle of Power"], [17, "Dispel Evil and Good"]
];

export const paladinPreparedSpells = (
  ruleset: RulesetId,
  level: number,
  count: number
): string[] => (ruleset === "srd-5.1-2014" ? preparedPool2014 : preparedPool2024)
  .filter(([unlock]) => level >= unlock)
  .slice(0, count)
  .map(([, spell]) => spell);

export const devotionOathSpells = (ruleset: RulesetId, level: number): string[] =>
  attainedPaladinFeatures(level, ruleset === "srd-5.1-2014" ? [
    [3, "Protection from Evil and Good"], [3, "Sanctuary"],
    [5, "Lesser Restoration"], [5, "Zone of Truth"],
    [9, "Beacon of Hope"], [9, "Dispel Magic"],
    [13, "Freedom of Movement"], [13, "Guardian of Faith"],
    [17, "Commune"], [17, "Flame Strike"]
  ] : [
    [3, "Protection from Evil and Good"], [3, "Shield of Faith"],
    [5, "Aid"], [5, "Zone of Truth"],
    [9, "Beacon of Hope"], [9, "Dispel Magic"],
    [13, "Freedom of Movement"], [13, "Guardian of Faith"],
    [17, "Commune"], [17, "Flame Strike"]
  ]);

export const paladinResources = (
  ruleset: RulesetId,
  level: number,
  charismaModifier: number
): DndCharacterResource[] => [
  {
    id: "lay-on-hands",
    name: "Lay on Hands",
    maximum: level * 5,
    refresh: "long-rest",
    notes: ruleset === "srd-5.1-2014"
      ? "Action; restore HP from the pool, or spend 5 points to cure one disease or neutralize one poison."
      : "Bonus Action; restore HP from the pool, or spend 5 points to remove the Poisoned condition."
  },
  ...(ruleset === "srd-5.1-2014"
    ? [{
        id: "divine-sense",
        name: "Divine Sense",
        maximum: Math.max(1, charismaModifier + 1),
        refresh: "long-rest" as const
      }]
    : [{
        id: "heroic-inspiration",
        name: "Human Resourceful — Heroic Inspiration",
        maximum: 1,
        refresh: "long-rest" as const
      }]),
  ...(level >= 3
    ? [{
        id: "channel-divinity",
        name: "Channel Divinity",
        maximum: ruleset === "srd-5.1-2014" ? 1 : level >= 11 ? 3 : 2,
        refresh: ruleset === "srd-5.1-2014" ? "short-rest" as const : "long-rest" as const,
        notes: ruleset === "srd-5.2.1-2024" ? "Regain one expended use on a Short Rest and all on a Long Rest." : undefined
      }]
    : []),
  ...(ruleset === "srd-5.2.1-2024" && level >= 2
    ? [{ id: "paladins-smite", name: "Paladin's Smite — Divine Smite free cast", maximum: 1, refresh: "long-rest" as const }]
    : []),
  ...(ruleset === "srd-5.2.1-2024" && level >= 5
    ? [{ id: "faithful-steed", name: "Faithful Steed — Find Steed free cast", maximum: 1, refresh: "long-rest" as const }]
    : []),
  ...(ruleset === "srd-5.1-2014" && level >= 14
    ? [{ id: "cleansing-touch", name: "Cleansing Touch", maximum: Math.max(1, charismaModifier), refresh: "long-rest" as const }]
    : []),
  ...(level >= 20
    ? [{
        id: "holy-nimbus",
        name: "Holy Nimbus",
        maximum: 1,
        refresh: "long-rest" as const,
        notes: ruleset === "srd-5.2.1-2024" ? "A level 5 spell slot can restore the use." : undefined
      }]
    : [])
];
