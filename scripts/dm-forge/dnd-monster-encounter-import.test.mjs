import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const [tracker, importer, utility, catalog, coverage, css] = await Promise.all([
  readFile(new URL("../../src/components/DndEncounterTracker.tsx", import.meta.url), "utf8"),
  readFile(new URL("../../src/components/DndMonsterEncounterImporter.tsx", import.meta.url), "utf8"),
  readFile(new URL("../../src/utils/dndMonsterEncounterImport.ts", import.meta.url), "utf8"),
  readFile(new URL("../../src/data/encounterMonsterCatalog.ts", import.meta.url), "utf8"),
  readFile(new URL("../../src/data/rulesCoverageDnd.ts", import.meta.url), "utf8"),
  readFile(new URL("../../src/styles/dnd-monster-encounter-importer.css", import.meta.url), "utf8")
]);

describe("D&D SRD monster encounter import integration", () => {
  it("embeds complete SRD monster import in encounter setup", () => {
    expect(tracker).toContain("<DndMonsterEncounterImporter");
    expect(importer).toContain("encounterMonsterCatalog");
    expect(importer).toContain("Complete SRD catalog");
    expect(catalog).toContain("srdMonsters");
  });

  it("uses source-safe parsed defaults that remain editable", () => {
    expect(utility).toContain("buildMonsterCombatReference");
    expect(utility).toContain("parseDndWalkingSpeed");
    expect(utility).toContain("could not be parsed; enter");
    expect(importer).toContain("Parsed values remain editable");
    expect(importer).toContain("Maximum HP");
    expect(importer).toContain("Walking Speed");
    expect(importer).toContain("DEX modifier");
  });

  it("supports quantities and shared or separate Initiative", () => {
    expect(importer).toContain("Quantity");
    expect(importer).toContain("Roll Initiative separately for each copy");
    expect(importer).toContain("Roll shared Initiative");
    expect(importer).toContain("Add {quantity} to encounter");
  });

  it("preserves edition and source identity", () => {
    expect(utility).toContain("entry.ruleset !== ruleset");
    expect(importer).toContain("defaults.sourceReference");
    expect(importer).toContain("Open SRD Compendium");
  });

  it("advances honest monster and campaign coverage", () => {
    expect(coverage).toContain('id: "monster-encounter-import"');
    expect(coverage).toContain('title: "SRD monster encounter import"');
    expect(coverage).toContain('status: "automation-complete"');
    expect(coverage).toContain("complete SRD monster imports");
  });

  it("supports responsive use and stays out of printed encounter records", () => {
    expect(css).toContain("@media (max-width: 680px)");
    expect(css).toContain("@media print");
    expect(css).toContain("display: none !important");
  });
});
