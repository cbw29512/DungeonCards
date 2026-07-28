import type { DndCharacterResource } from "../types/dndCharacter";
import type { RulesetId } from "../types/ruleCards";

export const dndWizardLevels = Array.from({ length: 20 }, (_, index) => index + 1);

export const attainedWizardFeatures = (
  level: number,
  entries: Array<[number, string]>
): string[] => entries.filter(([unlock]) => level >= unlock).map(([, feature]) => feature);

export const wizardCantrips = (ruleset: RulesetId, level: number): string[] => {
  const classCantrips = ruleset === "srd-5.1-2014"
    ? ["Fire Bolt", "Mage Hand", "Ray of Frost", ...(level >= 4 ? ["Light"] : []), ...(level >= 10 ? ["Prestidigitation"] : [])]
    : ["Light", "Mage Hand", "Ray of Frost", ...(level >= 4 ? ["Fire Bolt"] : []), ...(level >= 10 ? ["Prestidigitation"] : [])];
  return ruleset === "srd-5.1-2014" ? [...classCantrips, "Minor Illusion (High Elf)"] : [...classCantrips, "Message (Magic Initiate: Wizard)", "Minor Illusion (Magic Initiate: Wizard)"];
};

const preparedPool: Array<[number, string]> = [
  [1, "Mage Armor"], [1, "Shield"], [1, "Magic Missile"], [1, "Detect Magic"],
  [3, "Misty Step"], [3, "Web"], [5, "Fireball"], [5, "Counterspell"], [5, "Dispel Magic"],
  [7, "Dimension Door"], [7, "Polymorph"], [9, "Wall of Force"], [9, "Cone of Cold"],
  [11, "Chain Lightning"], [11, "Disintegrate"], [13, "Forcecage"], [13, "Teleport"],
  [15, "Maze"], [15, "Sunburst"], [17, "Meteor Swarm"], [17, "Wish"],
  [1, "Feather Fall"], [1, "Sleep"], [1, "Thunderwave"], [1, "Burning Hands"],
  [3, "Mirror Image"], [3, "Scorching Ray"], [3, "Invisibility"], [3, "Hold Person"],
  [5, "Fly"], [5, "Haste"], [5, "Lightning Bolt"], [5, "Hypnotic Pattern"],
  [7, "Greater Invisibility"], [7, "Wall of Fire"], [7, "Banishment"], [7, "Fire Shield"],
  [9, "Telekinesis"], [9, "Hold Monster"], [9, "Animate Objects"],
  [11, "Globe of Invulnerability"], [11, "Contingency"], [13, "Plane Shift"], [13, "Simulacrum"],
  [15, "Mind Blank"], [15, "Demiplane"], [17, "Time Stop"], [17, "Foresight"]
];

export const wizardPreparedSpells = (level: number, count: number): string[] =>
  preparedPool.filter(([unlock]) => level >= unlock).slice(0, count).map(([, spell]) => spell);

export const wizardResources = (ruleset: RulesetId, level: number): DndCharacterResource[] => [
  {
    id: "arcane-recovery",
    name: "Arcane Recovery",
    maximum: 1,
    refresh: "long-rest",
    notes: `After a Short Rest, recover spell slots with combined levels up to ${Math.ceil(level / 2)}; no recovered slot can be level 6+.`
  },
  ...(ruleset === "srd-5.2.1-2024"
    ? [{ id: "magic-initiate-shield", name: "Magic Initiate — Shield free cast", maximum: 1, refresh: "long-rest" as const }]
    : []),
  ...(level >= 14
    ? [{ id: "overchannel-safe-use", name: "Overchannel — safe use", maximum: 1, refresh: "long-rest" as const, notes: "Further uses before a Long Rest remain possible but inflict escalating Necrotic damage." }]
    : []),
  ...(level >= 18
    ? [
        { id: "spell-mastery-magic-missile", name: "Spell Mastery — Magic Missile", maximum: "unlimited" as const, refresh: "none" as const },
        { id: "spell-mastery-scorching-ray", name: "Spell Mastery — Scorching Ray", maximum: "unlimited" as const, refresh: "none" as const }
      ]
    : []),
  ...(level >= 20
    ? [
        { id: "signature-fireball", name: "Signature Spell — Fireball", maximum: 1, refresh: "short-rest" as const },
        { id: "signature-counterspell", name: "Signature Spell — Counterspell", maximum: 1, refresh: "short-rest" as const }
      ]
    : [])
];
