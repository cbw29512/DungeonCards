import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const [armorPage, component, data, utility, coverage, css] = await Promise.all([
  readFile(new URL("../../src/components/DndArmorLoadout.tsx", import.meta.url), "utf8"),
  readFile(new URL("../../src/components/DndContainersPacks.tsx", import.meta.url), "utf8"),
  readFile(new URL("../../src/data/dndContainersPacks.ts", import.meta.url), "utf8"),
  readFile(new URL("../../src/utils/dndContainersPacks.ts", import.meta.url), "utf8"),
  readFile(new URL("../../src/data/rulesCoverageDnd.ts", import.meta.url), "utf8"),
  readFile(new URL("../../src/styles/dnd-containers-packs.css", import.meta.url), "utf8")
]);

describe("D&D containers and equipment packs product integration", () => {
  it("inherits the Armor and Loadout edition selector", () => {
    expect(armorPage).toContain("<DndContainersPacks ruleset={ruleset}");
    expect(component).toContain("item.names[ruleset]");
    expect(component).toContain("selectedPack.contents[ruleset]");
  });

  it("keeps weight limits optional rather than invented", () => {
    expect(utility).toContain("totalWeightCapacityPounds === undefined");
    expect(component).toContain("Volume only");
    expect(component).toContain("Track volume");
    expect(component).toContain("has not invented a weight maximum");
  });

  it("preserves key edition differences", () => {
    expect(data).toContain("3 gallons of liquid");
    expect(data).toContain("12 cubic feet and up to 300 pounds");
    expect(data).toContain('"srd-5.1-2014": 1900');
    expect(data).toContain('"srd-5.2.1-2024": 3300');
    expect(data).toContain("5-pound equipment weight is for a full waterskin");
  });

  it("advances only the completed storage slice", () => {
    expect(coverage).toContain('id: "containers-packs"');
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
