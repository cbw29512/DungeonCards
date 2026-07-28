import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { cocCreatureCatalog } from "../../src/data/cocCreatureCatalog";
import { cocInvestigatorCatalog } from "../../src/data/cocInvestigatorCatalog";
import { cocOccupationCatalog } from "../../src/data/cocOccupationCatalog";
import { cocRitualCatalog } from "../../src/data/cocRitualCatalog";
import { cocWeaponCatalog } from "../../src/data/cocWeaponCatalog";

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
const readme = read("README.md");
const coverage = read("src/data/rulesCoverageDnd.ts");
const cocCoverage = read("src/data/rulesCoverageCoc.ts");
const dndCatalog = read("src/components/DndCardCatalog.tsx");
const unifiedCatalog = read("docs/UNIFIED_CARD_CATALOG.md");
const previewStatus = read("docs/COC_PREVIEW_STATUS.md");
const accuracyGate = read("docs/COC_RULES_ACCURACY.md");
const cocProcedureCount = 9;
const cocPublicCatalogCount = cocProcedureCount
  + cocCreatureCatalog.length
  + cocWeaponCatalog.length
  + cocRitualCatalog.length
  + cocInvestigatorCatalog.length;

const expectCurrentCocCounts = (source) => {
  expect(source).toContain(`${cocPublicCatalogCount}`);
  expect(source).toContain(`${cocProcedureCount}`);
  expect(source).toContain(`${cocWeaponCatalog.length}`);
  expect(source).toContain(`${cocRitualCatalog.length}`);
  expect(source).toContain(`${cocCreatureCatalog.length}`);
  expect(source).toContain(`${cocInvestigatorCatalog.length}`);
  expect(source).toContain(`${cocOccupationCatalog.length}`);
};

describe("DM Forge product-truth source contracts", () => {
  it("documents the current Character Vault and Card Platform baseline", () => {
    expect(readme).toContain("## Current Card Platform v2");
    expect(readme).toContain("**480 planned builds**");
    expect(readme).toContain("**320 verified printable builds**");
    expect(readme).toContain("remaining **160 builds**");
    expect(readme).toContain("- Bard / College of Lore");
    expect(readme).toContain("- Paladin / Devotion");
    expect(readme).toContain("- Ranger / Hunter");
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

  it("documents the current original percentile-horror catalogs from live registry counts", () => {
    expectCurrentCocCounts(readme);
    expectCurrentCocCounts(unifiedCatalog);
    expectCurrentCocCounts(previewStatus);
    expectCurrentCocCounts(accuracyGate);
    expect(readme).toContain(`contains **${cocPublicCatalogCount} definitions**`);
    expect(unifiedCatalog).toContain(`**${cocPublicCatalogCount} public definitions**`);
    expect(readme).not.toContain("one original demonstration weapon, ritual, and creature");
    expect(unifiedCatalog).not.toContain("the original demonstration weapon");
    expect(previewStatus).toContain("historical and no longer represents `main`");
  });

  it("keeps released encounter persistence out of the missing D&D boundary", () => {
    expect(readme).toContain("Versioned browser-local D&D 2014 and D&D 2024 encounter-session saves");
    expect(readme).toContain("browser-local encounter persistence are strong");
    expect(readme).not.toContain("persistent encounter/session state");
  });

  it("separates CoC archive import from structured authoring", () => {
    expect(cocCoverage).toContain('id: "coc-7e-private-card-library"');
    expect(cocCoverage).toContain('status: "automation-complete"');
    expect(cocCoverage).toContain('id: "coc-7e-structured-owned-content"');
    expect(cocCoverage).toContain('status: "missing"');
    expect(cocCoverage).toContain('id: "coc-7e-investigator-library"');
    expect(cocCoverage).toContain('id: "coc-7e-creature-library"');
    expect(cocCoverage).toContain('id: "coc-7e-ritual-library"');
    expect(cocCoverage).not.toContain("original demonstration weapon tracking");
    expect(cocCoverage).not.toContain("uses original demonstrations");
  });

  it("keeps Conditions visible in the single D&D catalog discovery surface", () => {
    expect(dndCatalog).toContain("Rules, conditions, spells, monsters");
  });
});