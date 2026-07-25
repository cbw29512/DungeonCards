import { describe, expect, it } from "vitest";
import { rulesCoverageCatalog } from "./rulesCoverageCatalog";
import {
  countCoverageStatuses,
  filterRulesCoverage,
  groupCoverageByCategory
} from "../utils/rulesCoverage";

describe("DM Forge rules coverage ledger", () => {
  it("tracks every supported system with unique IDs", () => {
    const ids = rulesCoverageCatalog.map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(rulesCoverageCatalog.map((entry) => entry.system))).toEqual(
      new Set(["dnd-2014", "dnd-2024", "coc-7e"])
    );
  });

  it("contains honest missing, complete, and owned-source boundaries", () => {
    const counts = countCoverageStatuses(rulesCoverageCatalog);
    expect(counts["automation-complete"]).toBeGreaterThan(0);
    expect(counts["procedure-complete"]).toBeGreaterThan(0);
    expect(counts["reference-complete"]).toBeGreaterThan(0);
    expect(counts.missing).toBeGreaterThan(0);
    expect(counts["requires-owned-source"]).toBeGreaterThan(0);
  });

  it("keeps 2024-only Weapon Mastery out of the 2014 ledger", () => {
    expect(rulesCoverageCatalog.some((entry) => entry.id === "dnd-2024-weapon-mastery")).toBe(true);
    expect(rulesCoverageCatalog.some((entry) => entry.id === "dnd-2014-weapon-mastery")).toBe(false);
  });

  it("filters by system, status, and search text", () => {
    const results = filterRulesCoverage(rulesCoverageCatalog, {
      system: "coc-7e",
      status: "missing",
      query: "Luck"
    });
    expect(results).toHaveLength(1);
    expect(results[0].title).toContain("Luck");
  });

  it("groups visible entries by category", () => {
    const groups = groupCoverageByCategory(filterRulesCoverage(rulesCoverageCatalog, {
      system: "dnd-2024",
      query: ""
    }));
    expect(groups.some(([category]) => category === "Magic")).toBe(true);
    expect(groups.every(([, entries]) => entries.every((entry) => entry.system === "dnd-2024"))).toBe(true);
  });
});
