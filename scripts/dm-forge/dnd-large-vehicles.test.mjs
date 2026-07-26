import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const [armorPage, component, data, utility, coverage, css] = await Promise.all([
  readFile(new URL("../../src/components/DndArmorLoadout.tsx", import.meta.url), "utf8"),
  readFile(new URL("../../src/components/DndLargeVehicles.tsx", import.meta.url), "utf8"),
  readFile(new URL("../../src/data/dndLargeVehicles.ts", import.meta.url), "utf8"),
  readFile(new URL("../../src/utils/dndLargeVehicles.ts", import.meta.url), "utf8"),
  readFile(new URL("../../src/data/rulesCoverageDnd.ts", import.meta.url), "utf8"),
  readFile(new URL("../../src/styles/dnd-large-vehicles.css", import.meta.url), "utf8")
]);

describe("D&D large vehicle product integration", () => {
  it("inherits the Equipment and Loadout edition selector", () => {
    expect(armorPage).toContain("<DndLargeVehicles ruleset={ruleset}");
    expect(component).toContain("item.rulesets.includes(ruleset)");
    expect(component).toContain("dndLargeVehicleSourceByRuleset[ruleset]");
  });

  it("keeps 2024 automation out of the 2014 view", () => {
    expect(component).toContain("Do not backfill 2024 ship statistics");
    expect(component).toContain('ruleset === "srd-5.1-2014"');
    expect(utility).toContain('ruleset === "srd-5.2.1-2024"');
    expect(utility).toContain("available: Boolean(stats)");
    expect(utility).toContain("days: available ?");
  });

  it("preserves edition catalog and unpublished boundaries", () => {
    expect(data).toContain('rulesets: ["srd-5.2.1-2024"]');
    expect(data).toContain('id: "airship"');
    expect(data).toContain('id: "galley"');
    expect(data).not.toContain("passengers: 0");
    expect(data).toContain('id: "rowboat"');
  });

  it("includes 2024 manifests, fares, and repair procedures", () => {
    expect(component).toContain("Crew, passengers, and cargo");
    expect(component).toContain("Hammocks and private cabins");
    expect(component).toContain("Repair damaged ships");
    expect(utility).toContain("privateCabins * 5");
    expect(utility).toContain("hitPoints * 20");
  });

  it("advances only the completed vehicle slice", () => {
    expect(coverage).toContain('id: "large-vehicles"');
    expect(coverage).toContain('status: "automation-complete"');
    expect(coverage).toContain('id: "gear-catalog"');
    expect(coverage).toContain('status: "missing"');
    expect(coverage).not.toContain("waterborne vehicles, and item procedures");
  });

  it("supports responsive and printable use", () => {
    expect(css).toContain("@media (max-width: 620px)");
    expect(css).toContain("@media print");
    expect(css).toContain("break-inside: avoid");
  });
});
