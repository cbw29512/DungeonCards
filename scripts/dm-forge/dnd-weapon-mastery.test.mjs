import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const [app, component, definitions, weaponCards, coverage, route, css] = await Promise.all([
  readFile(new URL("../../src/App.tsx", import.meta.url), "utf8"),
  readFile(new URL("../../src/components/DndWeaponMasteryLibrary.tsx", import.meta.url), "utf8"),
  readFile(new URL("../../src/data/weaponMastery2024.ts", import.meta.url), "utf8"),
  readFile(new URL("../../src/data/weaponRuleCards.ts", import.meta.url), "utf8"),
  readFile(new URL("../../src/data/rulesCoverageDnd.ts", import.meta.url), "utf8"),
  readFile(new URL("../../src/integration/dmForgeRoute.ts", import.meta.url), "utf8"),
  readFile(new URL("../../src/styles/dnd-weapon-mastery.css", import.meta.url), "utf8")
]);

describe("D&D 2024 Weapon Mastery product integration", () => {
  it("exposes a first-class direct workspace", () => {
    expect(route).toContain('| "mastery"');
    expect(app).toContain("<DndWeaponMasteryLibrary");
    expect(app).toContain("Weapon Mastery");
  });

  it("keeps mastery explicitly 2024-only", () => {
    expect(component).toContain("2024 rules only");
    expect(coverage).toContain('only: "dnd-2024"');
    expect(coverage).not.toContain('id: "dnd-2014-weapon-mastery"');
  });

  it("includes the critical limits and calculators", () => {
    expect(definitions).toContain("extra attack is available only once per turn");
    expect(definitions).toContain("do not reduce the creature's Speed by more than 10 feet");
    expect(definitions).toContain("8 + the ability modifier used for the attack roll + your Proficiency Bonus");
    expect(component).toContain("calculateToppleSaveDc");
    expect(component).toContain("Mark {selectedMastery} used");
  });

  it("uses the audited definitions on ordinary weapon cards too", () => {
    expect(weaponCards).toContain("weaponMasteryDefinitions2024");
    expect(weaponCards).toContain("Equipment: Weapons and Mastery Properties");
  });

  it("supports search, responsive use, and printing", () => {
    expect(component).toContain("filterMasteryWeapons");
    expect(component).toContain("matching weapon");
    expect(css).toContain("@media (max-width: 760px)");
    expect(css).toContain("@media print");
    expect(css).toContain("break-inside: avoid");
  });
});
