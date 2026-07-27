import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const [shellContent, registry, component, data, coverage, route, css] = await Promise.all([
  readFile(new URL("../../src/components/dndShell/DndPageContent.tsx", import.meta.url), "utf8"),
  readFile(new URL("../../src/components/dndShell/dndPageRegistry.ts", import.meta.url), "utf8"),
  readFile(new URL("../../src/components/DndArmorLoadout.tsx", import.meta.url), "utf8"),
  readFile(new URL("../../src/data/dndArmor.ts", import.meta.url), "utf8"),
  readFile(new URL("../../src/data/rulesCoverageDnd.ts", import.meta.url), "utf8"),
  readFile(new URL("../../src/integration/dmForgeRoute.ts", import.meta.url), "utf8"),
  readFile(new URL("../../src/styles/dnd-armor-loadout.css", import.meta.url), "utf8")
]);

describe("D&D Armor and Loadout product integration", () => {
  it("exposes a first-class direct workspace", () => {
    expect(route).toContain('| "armor"');
    expect(shellContent).toContain("<DndArmorLoadout");
    expect(registry).toContain("Armor & Loadout");
  });

  it("keeps edition selection and source links visible", () => {
    expect(component).toContain("RULESET_LABELS");
    expect(component).toContain("2014 encumbrance variant");
    expect(component).toContain("armorSourceUrl");
    expect(component).toContain("carryingSourceUrl");
    expect(data).toContain("Basic Rules 2014");
    expect(data).toContain("Free Rules 2024");
  });

  it("includes AC, training, carrying, and armor consequences", () => {
    expect(component).toContain("Armor Class {armorResult.armorClass}");
    expect(component).toContain("Shield training is missing");
    expect(component).toContain("Strength requirement not met");
    expect(component).toContain("Stealth");
    expect(component).toContain("Push/Drag/Lift");
  });

  it("splits completed armor tools from the unfinished gear catalog", () => {
    expect(coverage).toContain('id: "armor-loadout"');
    expect(coverage).toContain('status: "automation-complete"');
    expect(coverage).toContain('id: "gear-catalog"');
    expect(coverage).toContain('status: "missing"');
    expect(coverage).not.toContain('id: "armor-gear"');
  });

  it("supports responsive and printable use", () => {
    expect(css).toContain("@media (max-width: 620px)");
    expect(css).toContain("@media print");
    expect(css).toContain("break-inside: avoid");
  });
});
