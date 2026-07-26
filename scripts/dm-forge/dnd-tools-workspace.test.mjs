import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const [armorPage, component, data, utility, coverage, css] = await Promise.all([
  readFile(new URL("../../src/components/DndArmorLoadout.tsx", import.meta.url), "utf8"),
  readFile(new URL("../../src/components/DndToolsWorkspace.tsx", import.meta.url), "utf8"),
  readFile(new URL("../../src/data/dndTools.ts", import.meta.url), "utf8"),
  readFile(new URL("../../src/utils/dndTools.ts", import.meta.url), "utf8"),
  readFile(new URL("../../src/data/rulesCoverageDnd.ts", import.meta.url), "utf8"),
  readFile(new URL("../../src/styles/dnd-tools-workspace.css", import.meta.url), "utf8")
]);

describe("D&D tools product integration", () => {
  it("inherits the Equipment and Loadout edition selector", () => {
    expect(armorPage).toContain("<DndToolsWorkspace ruleset={ruleset}");
    expect(component).toContain('ruleset === "srd-5.2.1-2024"');
    expect(component).toContain("dndToolSourceByRuleset[ruleset]");
  });

  it("keeps the 2014 and 2024 check models separate", () => {
    expect(component).toContain("Ability selected by DM");
    expect(component).toContain("Published ability");
    expect(component).toContain("A relevant skill proficiency is used with this check");
    expect(utility).toContain('ruleset === "srd-5.2.1-2024" && relevantSkillProficient');
  });

  it("includes complete families and variants", () => {
    expect(data).toContain('id: "alchemist"');
    expect(data).toContain('id: "woodcarver"');
    expect(data).toContain('id: "disguise"');
    expect(data).toContain('id: "thieves"');
    expect(data).toContain('name: "Three-Dragon Ante Set"');
    expect(data).toContain('name: "Viol"');
  });

  it("makes published Utilize and Craft procedures operational", () => {
    expect(component).toContain("selectPublishedProcedure");
    expect(component).toContain("extractDndToolDc");
    expect(component).toContain("Craft options");
    expect(data).toContain("Melee weapons except Club, Greatclub, Quarterstaff, and Whip");
    expect(data).toContain("Ranged weapons except Pistol, Musket, and Sling");
  });

  it("advances only the completed tools slice", () => {
    expect(coverage).toContain('id: "tools"');
    expect(coverage).toContain('status: "automation-complete"');
    expect(coverage).toContain('id: "gear-catalog"');
    expect(coverage).toContain('status: "missing"');
    expect(coverage).not.toContain("Tools, remaining adventuring gear");
  });

  it("supports responsive and printable use", () => {
    expect(css).toContain("@media (max-width: 620px)");
    expect(css).toContain("@media print");
    expect(css).toContain("break-inside: avoid");
  });
});
