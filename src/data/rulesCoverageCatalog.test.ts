import { describe, expect, it } from "vitest";
import { dndPregenClassDefinitions } from "./dndPregenCatalog";
import { dndVaultReadyBuilds } from "./dndVaultReadyBuilds";
import { rulesCoverageCatalog } from "./rulesCoverageCatalog";
import {
  countCoverageStatuses,
  filterRulesCoverage,
  groupCoverageByCategory
} from "../utils/rulesCoverage";

const plannedBuildCount = dndPregenClassDefinitions.length * 20;
const readyBuildCount = dndVaultReadyBuilds.length;
const blueprintCount = plannedBuildCount - readyBuildCount;
const publicPathCount = new Set(dndPregenClassDefinitions.map((entry) => entry.classId)).size;
const readyPathCount = new Set(dndVaultReadyBuilds.map((entry) => entry.classId)).size;
const remainingPathCount = publicPathCount - readyPathCount;

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

  it("derives Character Vault completion claims from the live registries", () => {
    expect(plannedBuildCount).toBe(480);
    expect(readyBuildCount).toBe(240);
    expect(blueprintCount).toBe(240);
    expect(remainingPathCount).toBe(6);

    for (const system of ["dnd-2014", "dnd-2024"] as const) {
      const matrix = rulesCoverageCatalog.find((entry) => entry.id === `${system}-pregen-library`);
      expect(matrix?.summary).toContain(`${plannedBuildCount}`);
      expect(matrix?.summary).toContain(`${readyBuildCount}`);
      expect(matrix?.summary).toContain(`${blueprintCount}`);
      expect(matrix?.nextStep).toContain(`${remainingPathCount}`);
      expect(rulesCoverageCatalog.some((entry) => entry.id === `${system}-cleric-pregens`)).toBe(true);
    }
  });

  it("distinguishes generic CoC private archives from structured authoring", () => {
    expect(rulesCoverageCatalog.find((entry) => entry.id === "coc-7e-private-card-library")?.status).toBe("automation-complete");
    expect(rulesCoverageCatalog.find((entry) => entry.id === "coc-7e-structured-owned-content")?.status).toBe("missing");
  });

  it("keeps 2024-only Weapon Mastery out of the 2014 ledger", () => {
    expect(rulesCoverageCatalog.some((entry) => entry.id === "dnd-2024-weapon-mastery")).toBe(true);
    expect(rulesCoverageCatalog.some((entry) => entry.id === "dnd-2014-weapon-mastery")).toBe(false);
  });

  it("filters by system, status, and search text", () => {
    const verifiedLuck = filterRulesCoverage(rulesCoverageCatalog, {
      system: "coc-7e",
      status: "automation-complete",
      query: "Luck"
    });
    expect(verifiedLuck).toHaveLength(1);
    expect(verifiedLuck[0].id).toBe("coc-7e-luck");

    const ownedLuck = filterRulesCoverage(rulesCoverageCatalog, {
      system: "coc-7e",
      status: "requires-owned-source",
      query: "Luck"
    });
    expect(ownedLuck).toHaveLength(1);
    expect(ownedLuck[0].id).toBe("coc-7e-luck-spending");
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
