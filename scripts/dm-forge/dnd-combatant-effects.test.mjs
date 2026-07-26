import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const [tracker, panel, engine, coverage, conditionData, css] = await Promise.all([
  readFile(new URL("../../src/components/DndEncounterTracker.tsx", import.meta.url), "utf8"),
  readFile(new URL("../../src/components/DndCombatantEffectsPanel.tsx", import.meta.url), "utf8"),
  readFile(new URL("../../src/utils/dndEncounter.ts", import.meta.url), "utf8"),
  readFile(new URL("../../src/data/rulesCoverageDnd.ts", import.meta.url), "utf8"),
  readFile(new URL("../../src/data/dndConditions.ts", import.meta.url), "utf8"),
  readFile(new URL("../../src/styles/dnd-combatant-effects.css", import.meta.url), "utf8")
]);

describe("D&D combatant condition and timed-effect integration", () => {
  it("embeds the effects panel and displays combatant badges", () => {
    expect(tracker).toContain("<DndCombatantEffectsPanel");
    expect(tracker).toContain("combatant.effects.length > 0");
    expect(tracker).toContain('className="dnd-effect-tags"');
  });

  it("reuses the edition-separated official condition catalog", () => {
    expect(panel).toContain("getDndConditions(ruleset)");
    expect(panel).toContain("Condition names and effects come from the selected official ruleset");
    expect(panel).toContain("selectedCondition.sourceUrl");
    expect(conditionData).toContain('"srd-5.1-2014"');
    expect(conditionData).toContain('"srd-5.2.1-2024"');
  });

  it("supports timed, manual, and save-to-end effects", () => {
    expect(engine).toContain("tickDndEffects");
    expect(engine).toContain('tickTiming: DndEffectTickTiming');
    expect(panel).toContain("Track a round duration");
    expect(panel).toContain("Has a save to end");
    expect(panel).toContain("Roll save");
  });

  it("ends concentration for incapacitating conditions", () => {
    expect(panel).toContain('"Incapacitated"');
    expect(panel).toContain('"Paralyzed"');
    expect(panel).toContain('"Petrified"');
    expect(panel).toContain('"Stunned"');
    expect(panel).toContain('"Unconscious"');
    expect(engine).toContain("effect.breaksConcentration ? undefined");
  });

  it("keeps selections valid across edition and roster changes", () => {
    expect(panel).toContain("useEffect");
    expect(panel).toContain("conditions.some");
    expect(panel).toContain("encounter.combatants.some");
  });

  it("advances conditions and campaign tracking honestly", () => {
    expect(coverage).toContain('id: "conditions"');
    expect(coverage).toContain('title: "Conditions, exhaustion, and timed effects"');
    expect(coverage).toContain('id: "campaign-tracking"');
    expect(coverage).toContain('status: "automation-complete"');
  });

  it("supports responsive and printable effect records", () => {
    expect(css).toContain("@media (max-width: 680px)");
    expect(css).toContain("@media print");
    expect(css).toContain("break-inside: avoid");
  });
});
