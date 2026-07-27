import type { EncounterMonsterEntry } from "../types/encounterMonsters";
import type { RulesetId } from "../types/ruleCards";

export const normalizedMonsterType = (value: string): string => (
  value.trim().replace(/\s+/g, " ").toLowerCase()
);

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

export const filterMonsterWorkspaceEntries = (
  monsters: EncounterMonsterEntry[],
  query: string,
  type: string
): EncounterMonsterEntry[] => {
  const normalized = query.trim().toLowerCase();
  return monsters.filter((monster) => {
    const matchesQuery = !normalized
      || `${monster.name} ${monster.type} ${monster.cr}`.toLowerCase().includes(normalized);
    const matchesType = type === "all" || normalizedMonsterType(monster.type) === type;
    return matchesQuery && matchesType;
  });
};
