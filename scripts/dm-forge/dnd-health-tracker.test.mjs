import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const [app, component, engine, sources, coverage, route, css] = await Promise.all([
  readFile(new URL("../../src/App.tsx", import.meta.url), "utf8"),
  readFile(new URL("../../src/components/DndHealthTracker.tsx", import.meta.url), "utf8"),
  readFile(new URL("../../src/utils/dndHealth.ts", import.meta.url), "utf8"),
  readFile(new URL("../../src/data/dndHealthRules.ts", import.meta.url), "utf8"),
  readFile(new URL("../../src/data/rulesCoverageDnd.ts", import.meta.url), "utf8"),
  readFile(new URL("../../src/integration/dmForgeRoute.ts", import.meta.url), "utf8"),
  readFile(new URL("../../src/styles/dnd-health-tracker.css", import.meta.url), "utf8")
]);

describe("D&D health and death tracker product integration", () => {
  it("exposes a direct, first-class health workspace", () => {
    expect(route).toContain('| "health"');
    expect(app).toContain("<DndHealthTracker");
    expect(app).toContain("HP &amp; Death Saves");
    expect(component).toContain("Hit Points, Temporary HP &amp; Death Saves");
  });

  it("protects the critical death-state transitions", () => {
    expect(engine).toContain("massiveDamageRemainder >= state.maximumHitPoints");
    expect(engine).toContain("criticalHit ? 2 : 1");
    expect(engine).toContain("result === 20");
    expect(engine).toContain("result === 1");
    expect(engine).toContain('lifeState: "stable"');
  });

  it("keeps Temporary HP nonstacking and separate from healing", () => {
    expect(engine).toContain('choice: "keep" | "replace"');
    expect(component).toContain("Temporary HP does not stack");
    expect(component).toContain("does not restore consciousness at 0 HP");
  });

  it("keeps Bloodied explicitly 2024-only", () => {
    expect(engine).toContain('state.ruleset === "srd-5.2.1-2024"');
    expect(sources).toContain("Bloodied means current HP is half the maximum or lower");
  });

  it("advances honest public coverage while preserving the standalone route", () => {
    expect(coverage).toContain('id: "damage-death"');
    expect(coverage).toContain('status: "automation-complete"');
    expect(coverage).toContain('route: "?system=dnd&page=combat"');
    expect(coverage).toContain("resurrection and rest recovery workflows");
    expect(route).toContain('"health"');
  });

  it("supports responsive, reduced-motion, and printable use", () => {
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(css).toContain("@media (max-width: 520px)");
    expect(css).toContain("@media print");
    expect(css).toContain("break-inside: avoid");
  });
});
