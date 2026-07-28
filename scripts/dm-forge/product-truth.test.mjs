import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
const readme = read("README.md");
const coverage = read("src/data/rulesCoverageDnd.ts");
const cocCoverage = read("src/data/rulesCoverageCoc.ts");
const home = read("src/components/dndShell/dndPageRegistry.ts");

describe("DM Forge product-truth source contracts", () => {
  it("documents the current Character Vault and Card Platform baseline", () => {
    expect(readme).toContain("## Current Card Platform v2");
    expect(readme).toContain("**480 planned builds**");
    expect(readme).toContain("**240 verified printable builds**");
    expect(readme).toContain("remaining **240 builds**");
    expect(readme).toContain("- Paladin / Devotion");
    expect(readme).toContain("- Rogue / Thief");
    expect(readme).toContain("- Wizard / Evocation");
    expect(readme).not.toContain("Saved Character Play Mode remains an active milestone");
    expect(readme).not.toContain("The shared card domain is being upgraded");
  });

  it("derives D&D matrix totals instead of hardcoding stale coverage numbers", () => {
    expect(coverage).toContain("dndPregenClassDefinitions.length * LEVEL_COUNT");
    expect(coverage).toContain("dndVaultReadyBuilds.length");
    expect(coverage).toContain("blueprintCount = plannedBuildCount - readyBuildCount");
    expect(coverage).toContain("remainingPathCount = publicPathCount - readyPathCount");
    expect(coverage).toContain('id: "cleric-pregens"');
    expect(coverage).not.toContain("publishes 80 validated");
    expect(coverage).not.toContain("remaining ten public class paths");
  });

  it("separates CoC archive import from structured authoring", () => {
    expect(cocCoverage).toContain('id: "coc-7e-private-card-library"');
    expect(cocCoverage).toContain('status: "automation-complete"');
    expect(cocCoverage).toContain('id: "coc-7e-structured-owned-content"');
    expect(cocCoverage).toContain('status: "missing"');
  });

  it("keeps Conditions visible in D&D catalog discovery copy", () => {
    expect(home).toContain("Search rules, conditions, spells, monsters");
  });
});
