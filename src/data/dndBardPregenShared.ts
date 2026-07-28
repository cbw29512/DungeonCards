import type { DndCharacterResource } from "../types/dndCharacter";
import type { RulesetId } from "../types/ruleCards";

export const dndBardLevels = Array.from({ length: 20 }, (_, index) => index + 1);

export const attainedBardFeatures = (
  level: number,
  entries: Array<[number, string]>
): string[] => entries.filter(([unlock]) => level >= unlock).map(([, value]) => value);

export const bardicInspirationDie = (level: number): string =>
  level >= 15 ? "d12" : level >= 10 ? "d10" : level >= 5 ? "d8" : "d6";

const bardCantripPool = ["Vicious Mockery", "Mage Hand", "Minor Illusion", "Prestidigitation"];
const bardCantripCounts = [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4];

export const bardCantrips = (ruleset: RulesetId, level: number): string[] => {
  const classCantrips = bardCantripPool.slice(0, bardCantripCounts[level - 1]);
  return ruleset === "srd-5.2.1-2024"
    ? [...classCantrips, "Guidance", "Thaumaturgy"]
    : classCantrips;
};

const bardSpellPool: Array<[number, string]> = [
  [1, "Healing Word"], [1, "Faerie Fire"], [1, "Thunderwave"], [1, "Charm Person"],
  [3, "Invisibility"], [3, "Shatter"], [3, "Suggestion"], [3, "Lesser Restoration"],
  [5, "Dispel Magic"], [5, "Hypnotic Pattern"], [5, "Fear"], [5, "Mass Healing Word"],
  [7, "Dimension Door"], [7, "Greater Invisibility"], [7, "Polymorph"],
  [9, "Animate Objects"], [9, "Greater Restoration"], [9, "Hold Monster"],
  [11, "Mass Suggestion"], [11, "True Seeing"],
  [13, "Forcecage"], [13, "Teleport"],
  [15, "Glibness"], [15, "Mind Blank"],
  [17, "Foresight"], [17, "True Polymorph"]
];

const loreSecrets2014: Array<[number, string]> = [
  [6, "Counterspell"], [6, "Fireball"]
];

const classSecrets2014: Array<[number, string]> = [
  [10, "Revivify"], [10, "Wall of Force"],
  [14, "Heal"], [14, "Disintegrate"],
  [18, "Wish"], [18, "Mass Heal"]
];

export const bardSpellsKnown2014 = (level: number, knownCount: number): string[] => {
  const classSecrets = classSecrets2014.filter(([unlock]) => level >= unlock).map(([, spell]) => spell);
  const baseCount = knownCount - classSecrets.length;
  const base = bardSpellPool.filter(([unlock]) => level >= unlock).slice(0, baseCount).map(([, spell]) => spell);
  const loreSecrets = loreSecrets2014.filter(([unlock]) => level >= unlock).map(([, spell]) => spell);
  return [...base, ...classSecrets, ...loreSecrets];
};

const magicalSecrets2024: Array<[number, string]> = [
  [10, "Revivify"], [10, "Wall of Force"], [11, "Heal"], [13, "Plane Shift"],
  [15, "Sunburst"], [17, "Wish"], [18, "Mass Heal"]
];

export const bardPreparedSpells2024 = (level: number, preparedCount: number): string[] => {
  const secrets = magicalSecrets2024.filter(([unlock]) => level >= unlock).map(([, spell]) => spell);
  const base = bardSpellPool.filter(([unlock]) => level >= unlock)
    .slice(0, preparedCount - secrets.length)
    .map(([, spell]) => spell);
  return [...base, ...secrets];
};

export const bardResources = (
  ruleset: RulesetId,
  level: number,
  charismaModifier: number
): DndCharacterResource[] => [
  {
    id: "bardic-inspiration",
    name: `Bardic Inspiration (${bardicInspirationDie(level)})`,
    maximum: Math.max(1, charismaModifier),
    refresh: level >= 5 ? "short-rest" : "long-rest",
    notes: ruleset === "srd-5.2.1-2024" && level >= 5
      ? "Regain all uses on a Short or Long Rest; a spell slot can also restore one expended use."
      : level >= 5 ? "Regain all uses on a Short or Long Rest." : "Regain all uses on a Long Rest."
  },
  ...(ruleset === "srd-5.2.1-2024"
    ? [
        { id: "heroic-inspiration", name: "Human Resourceful — Heroic Inspiration", maximum: 1, refresh: "long-rest" as const },
        { id: "magic-initiate-bless", name: "Magic Initiate — Bless free cast", maximum: 1, refresh: "long-rest" as const }
      ]
    : [])
];
