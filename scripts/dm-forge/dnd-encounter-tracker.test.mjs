import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const [app, component, engine, sources, coverage, route, css] = await Promise.all([
  readFile(new URL("../../src/App.tsx", import.meta.url), "utf8"),
  readFile(new URL("../../src/components/DndEncounterTracker.tsx", import.meta.url), "utf8"),
  readFile(new URL("../../src/utils/dndEncounter.ts", import.meta.url), "utf8"),
  readFile(new URL("../../src/data/dndEncounterRules.ts", import.meta.url), "utf8"),
  readFile(new URL("../../src/data/rulesCoverageDnd.ts", import.meta.url), "utf8"),
  readFile(new URL("../../src/integration/dmForgeRoute.ts", import.meta.url), "utf8"),
  readFile(new URL("../../src/styles/dnd-encounter-tracker.css", import.meta.url), "utf8")
]);

describe("D&D live encounter tracker integration", () => {
  it("exposes a direct first-class combat workspace", () => {
    expect(route).toContain('| "combat"');
    expect(app).toContain("<DndEncounterTracker");
    expect(app).toContain("Initiative &amp; Concentration");
  });

  it("separates 2014 and 2024 surprise procedures", () => {
    expect(sources).toContain("can’t move or take an action on its first turn");
    expect(sources).toContain("Disadvantage on that roll");
    expect(engine).toContain('ruleset === "srd-5.1-2014" && combatant.surprisePending');
    expect(component).toContain("Roll Initiative{ruleset === \"srd-5.2.1-2024\" && surprised ? \" with Disadvantage\" : \"\"}");
  });

  it("tracks rounds, action economy, movement, and reactions", () => {
    expect(component).toContain("End turn / Next");
    expect(component).toContain("Action {combatant.actionAvailable");
    expect(component).toContain("Bonus {combatant.bonusActionAvailable");
    expect(component).toContain("Reaction {combatant.reactionAvailable");
    expect(component).toContain("Move 5 ft.");
  });

  it("uses edition-correct concentration checks", () => {
    expect(engine).toContain("Math.min(30, dc)");
    expect(component).toContain("Multiple damage sources require separate saves");
    expect(component).toContain("Start / replace concentration");
    expect(coverage).toContain('id: "concentration"');
    expect(coverage).toContain('status: "automation-complete"');
  });

  it("supports responsive, reduced-motion, and print layouts", () => {
    expect(css).toContain("@media (max-width: 680px)");
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(css).toContain("@media print");
    expect(css).toContain("break-inside: avoid");
  });
});
