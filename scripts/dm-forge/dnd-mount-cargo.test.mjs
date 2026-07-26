import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const [armorPage, component, data, utility, coverage, css] = await Promise.all([
  readFile(new URL("../../src/components/DndArmorLoadout.tsx", import.meta.url), "utf8"),
  readFile(new URL("../../src/components/DndMountCargo.tsx", import.meta.url), "utf8"),
  readFile(new URL("../../src/data/dndMounts.ts", import.meta.url), "utf8"),
  readFile(new URL("../../src/utils/dndMounts.ts", import.meta.url), "utf8"),
  readFile(new URL("../../src/data/rulesCoverageDnd.ts", import.meta.url), "utf8"),
  readFile(new URL("../../src/styles/dnd-mount-cargo.css", import.meta.url), "utf8")
]);

describe("D&D mounts, cargo, and barding product integration", () => {
  it("inherits the edition selected on Armor and Loadout", () => {
    expect(armorPage).toContain("<DndMountCargo ruleset={ruleset}");
    expect(component).toContain("mount.names[ruleset]");
    expect(component).toContain("dndMountSourceByRuleset[ruleset]");
  });

  it("preserves the camel capacity change", () => {
    expect(data).toContain('"srd-5.1-2014": 480');
    expect(data).toContain('"srd-5.2.1-2024": 450');
  });

  it("reports maximum cargo and remaining capacity separately", () => {
    expect(utility).toContain("maximumCargoWeight");
    expect(utility).toContain("remainingCapacityAfterLoad");
    expect(component).toContain("Maximum cargo");
    expect(component).toContain("Capacity left");
  });

  it("includes vehicle weight, team cost, saddles, and barding", () => {
    expect(component).toContain("vehicle.weightPounds");
    expect(component).toContain("totalPurchaseCostGp");
    expect(component).toContain("visibleSaddles");
    expect(component).toContain("calculateDndBarding");
  });

  it("advances only the completed equipment slice", () => {
    expect(coverage).toContain('id: "mounts-cargo"');
    expect(coverage).toContain('status: "automation-complete"');
    expect(coverage).toContain('id: "gear-catalog"');
    expect(coverage).toContain('status: "missing"');
  });

  it("supports responsive and printable use", () => {
    expect(css).toContain("@media (max-width: 620px)");
    expect(css).toContain("@media print");
    expect(css).toContain("break-inside: avoid");
  });
});
