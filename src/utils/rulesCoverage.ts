import type {
  CoverageStatus,
  CoverageSystemId,
  RulesCoverageEntry
} from "../types/rulesCoverage";

export type CoverageFilters = {
  system?: CoverageSystemId | "all";
  status?: CoverageStatus | "all";
  query?: string;
};

export const filterRulesCoverage = (
  entries: RulesCoverageEntry[],
  filters: CoverageFilters
): RulesCoverageEntry[] => {
  const query = filters.query?.trim().toLowerCase() ?? "";
  return entries.filter((entry) => {
    if (filters.system && filters.system !== "all" && entry.system !== filters.system) return false;
    if (filters.status && filters.status !== "all" && entry.status !== filters.status) return false;
    if (!query) return true;
    return [entry.title, entry.category, entry.summary, entry.nextStep ?? ""]
      .some((value) => value.toLowerCase().includes(query));
  });
};

export const countCoverageStatuses = (
  entries: RulesCoverageEntry[]
): Record<CoverageStatus, number> => entries.reduce<Record<CoverageStatus, number>>(
  (counts, entry) => ({ ...counts, [entry.status]: counts[entry.status] + 1 }),
  {
    missing: 0,
    "reference-complete": 0,
    "procedure-complete": 0,
    "automation-complete": 0,
    "requires-owned-source": 0
  }
);

export const groupCoverageByCategory = (
  entries: RulesCoverageEntry[]
): Array<[string, RulesCoverageEntry[]]> => {
  const groups = new Map<string, RulesCoverageEntry[]>();
  entries.forEach((entry) => groups.set(entry.category, [...(groups.get(entry.category) ?? []), entry]));
  return [...groups.entries()].sort(([left], [right]) => left.localeCompare(right));
};
