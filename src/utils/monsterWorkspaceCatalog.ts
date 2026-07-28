import type { EncounterMonsterEntry } from "../types/encounterMonsters";
import type { RulesetId } from "../types/ruleCards";
import {
  monsterHasRecharge,
  monsterHasSpecialReaction
} from "./monsterEncounterWorkspaceModel";

export type MonsterFeatureFilter = "all" | "legendary" | "recharge" | "special-reaction" | "spellcaster";
export type MonsterWorkspaceSort = "name-asc" | "cr-asc" | "cr-desc" | "hp-desc" | "ac-desc";

export type MonsterWorkspaceFilterOptions = {
  size?: string;
  minimumChallenge?: number | null;
  maximumChallenge?: number | null;
  feature?: MonsterFeatureFilter;
  sort?: MonsterWorkspaceSort;
};

export const normalizedMonsterType = (value: string): string => (
  value.trim().replace(/\s+/g, " ").toLowerCase()
);

const normalizedMonsterSize = (value: string): string => normalizedMonsterType(value);

export const monsterChallengeNumber = (value: string): number | null => {
  const token = value.match(/\b(\d+\s*\/\s*\d+|\d+(?:\.\d+)?)\b/)?.[1]?.replace(/\s+/g, "");
  if (!token) return null;
  if (token.includes("/")) {
    const [numerator, denominator] = token.split("/").map(Number);
    return denominator ? numerator / denominator : null;
  }
  const numeric = Number(token);
  return Number.isFinite(numeric) ? numeric : null;
};

const firstNumber = (value: string): number | null => {
  const token = value.match(/\b\d+\b/)?.[0];
  return token ? Number(token) : null;
};

export const monsterArmorClassNumber = (entry: EncounterMonsterEntry): number | null => (
  firstNumber(entry.kind === "formatted" ? entry.monster.ac : entry.monster.armorClass)
);

export const monsterHitPointNumber = (entry: EncounterMonsterEntry): number | null => (
  firstNumber(entry.kind === "formatted" ? entry.monster.hp : entry.monster.hitPoints)
);

export const monsterIsLegendary = (entry: EncounterMonsterEntry): boolean => (
  entry.kind === "formatted"
    ? entry.monster.legendaryActions.length > 0
    : entry.monster.legendaryActions.trim().length > 0
);

export const monsterIsSpellcaster = (entry: EncounterMonsterEntry): boolean => {
  const text = entry.kind === "formatted"
    ? [
        ...entry.monster.traits,
        ...entry.monster.actions,
        ...entry.monster.bonusActions,
        ...entry.monster.reactions,
        ...entry.monster.legendaryActions
      ].map((section) => `${section.name} ${section.text ?? ""}`).join(" ")
    : `${entry.monster.traits} ${entry.monster.actions} ${entry.monster.bonusActions} ${entry.monster.reactions} ${entry.monster.legendaryActions}`;
  return /\bspellcasting\b|\bcasts?\s+(?:the\s+)?[a-z]/i.test(text);
};

const monsterSearchText = (entry: EncounterMonsterEntry): string => {
  const sourceText = entry.kind === "formatted"
    ? [
        ...entry.monster.traits,
        ...entry.monster.actions,
        ...entry.monster.bonusActions,
        ...entry.monster.reactions,
        ...entry.monster.legendaryActions
      ].map((section) => `${section.name} ${section.text ?? ""}`).join(" ")
    : `${entry.monster.traits} ${entry.monster.actions} ${entry.monster.bonusActions} ${entry.monster.reactions} ${entry.monster.legendaryActions}`;
  return `${entry.name} ${entry.size} ${entry.type} ${entry.cr} ${entry.source} ${sourceText}`.toLocaleLowerCase("en-US");
};

const matchesFeature = (entry: EncounterMonsterEntry, feature: MonsterFeatureFilter): boolean => {
  if (feature === "all") return true;
  if (feature === "legendary") return monsterIsLegendary(entry);
  if (feature === "recharge") return monsterHasRecharge(entry);
  if (feature === "special-reaction") return monsterHasSpecialReaction(entry);
  return monsterIsSpellcaster(entry);
};

const compareNullable = (left: number | null, right: number | null, direction: "asc" | "desc"): number => {
  if (left === null && right === null) return 0;
  if (left === null) return 1;
  if (right === null) return -1;
  return direction === "asc" ? left - right : right - left;
};

export const sortMonsterWorkspaceEntries = (
  monsters: EncounterMonsterEntry[],
  sort: MonsterWorkspaceSort
): EncounterMonsterEntry[] => [...monsters].sort((left, right) => {
  if (sort === "name-asc") return left.name.localeCompare(right.name);
  if (sort === "cr-asc") return compareNullable(monsterChallengeNumber(left.cr), monsterChallengeNumber(right.cr), "asc") || left.name.localeCompare(right.name);
  if (sort === "cr-desc") return compareNullable(monsterChallengeNumber(left.cr), monsterChallengeNumber(right.cr), "desc") || left.name.localeCompare(right.name);
  if (sort === "hp-desc") return compareNullable(monsterHitPointNumber(left), monsterHitPointNumber(right), "desc") || left.name.localeCompare(right.name);
  return compareNullable(monsterArmorClassNumber(left), monsterArmorClassNumber(right), "desc") || left.name.localeCompare(right.name);
});

export const monstersForEncounterRuleset = (
  monsters: EncounterMonsterEntry[],
  ruleset: RulesetId
): EncounterMonsterEntry[] => monsters.filter((monster) => (
  monster.ruleset === ruleset || monster.ruleset === "homebrew"
));

export const monsterTypesForWorkspace = (
  monsters: EncounterMonsterEntry[]
): string[] => [
  "all",
  ...new Set(monsters.map((monster) => normalizedMonsterType(monster.type)).filter(Boolean))
];

export const monsterSizesForWorkspace = (
  monsters: EncounterMonsterEntry[]
): string[] => [
  "all",
  ...new Set(monsters.map((monster) => normalizedMonsterSize(monster.size)).filter(Boolean))
];

export const filterMonsterWorkspaceEntries = (
  monsters: EncounterMonsterEntry[],
  query: string,
  type: string,
  options: MonsterWorkspaceFilterOptions = {}
): EncounterMonsterEntry[] => {
  const normalized = query.trim().toLocaleLowerCase("en-US");
  const size = options.size ?? "all";
  const feature = options.feature ?? "all";
  const minimumChallenge = options.minimumChallenge ?? null;
  const maximumChallenge = options.maximumChallenge ?? null;
  const filtered = monsters.filter((monster) => {
    const challenge = monsterChallengeNumber(monster.cr);
    const matchesQuery = !normalized || monsterSearchText(monster).includes(normalized);
    const matchesType = type === "all" || normalizedMonsterType(monster.type) === type;
    const matchesSize = size === "all" || normalizedMonsterSize(monster.size) === size;
    const matchesMinimum = minimumChallenge === null || (challenge !== null && challenge >= minimumChallenge);
    const matchesMaximum = maximumChallenge === null || (challenge !== null && challenge <= maximumChallenge);
    return matchesQuery
      && matchesType
      && matchesSize
      && matchesMinimum
      && matchesMaximum
      && matchesFeature(monster, feature);
  });
  return sortMonsterWorkspaceEntries(filtered, options.sort ?? "name-asc");
};