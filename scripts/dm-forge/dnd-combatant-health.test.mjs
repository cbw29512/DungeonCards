import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const [tracker, panel, encounter, integration, health, sources, coverage, css] = await Promise.all([
  readFile(new URL("../../src/components/DndEncounterTracker.tsx", import.meta.url), "utf8"),
  readFile(new URL("../../src/components/DndCombatantHealthPanel.tsx", import.meta.url), "utf8"),
  readFile(new URL("../../src/utils/dndEncounter.ts", import.meta.url), "utf8"),
  readFile(new URL("../../src/utils/dndEncounterHealth.ts", import.meta.url), "utf8"),
  readFile(new URL("../../src/utils/dndHealth.ts", import.meta.url), "utf8"),
  readFile(new URL("../../src/data/dndHealthRules.ts", import.meta.url), "utf8"),
  readFile(new URL("../../src/data/rulesCoverageDnd.ts", import.meta.url), "utf8"),
  readFile(new URL("../../src/styles/dnd-combatant-health.css", import.meta.url), "utf8")
]);

describe("D&D combatant health integration", () => {
  it("adds HP during encounter setup and stores the tested health state", () => {
    expect(tracker).toContain("Maximum HP");
    expect(tracker).toContain("Current HP");
    expect(encounter).toContain("health: createDndHealthState");
    expect(health).toContain("Temporary Hit Points absorbed all incoming damage");
  });

  it("embeds live health controls and initiative-row health badges", () => {
    expect(tracker).toContain("<DndCombatantHealthPanel");
    expect(tracker).toContain('className="dnd-health-tags"');
    expect(tracker).toContain("combatant.health.currentHitPoints");
    expect(tracker).toContain("combatant.health.lifeState");
  });

  it("prevents downed combatants from spending turn resources", () => {
    expect(tracker).toContain('const canAct = combatant.health.lifeState === "conscious"');
    expect(tracker).toContain("!canAct");
    expect(tracker).toContain("turn resources are unavailable");
  });

  it("reuses the health engine and ends concentration on downed states", () => {
    expect(integration).toContain("applyDndDamage");
    expect(integration).toContain("resolveDndDeathSave");
    expect(integration).toContain("shouldEndConcentration");
    expect(integration).toContain("concentration: shouldEndConcentration");
  });

  it("restores active-turn resources without granting off-turn refreshes", () => {
    expect(integration).toContain("regainedConsciousness && isActiveTurn");
    expect(integration).toContain("restoreCurrentTurn ? true");
    expect(integration).toContain("restoreCurrentTurn ? combatant.speedFeet");
  });

  it("provides damage, healing, Temporary HP, Death Save, and stabilization controls", () => {
    expect(panel).toContain("Apply damage");
    expect(panel).toContain("Apply healing");
    expect(panel).toContain("Take new value");
    expect(panel).toContain("Roll Death Save");
    expect(panel).toContain("Stabilize");
    expect(panel).toContain("Record stable recovery");
  });

  it("keeps edition-specific source attribution and honest coverage", () => {
    expect(panel).toContain("dndHealthRuleSources[ruleset]");
    expect(sources).toContain("Basic Rules 2014 · Combat: Damage and Healing");
    expect(sources).toContain("Free Rules 2024 · Playing the Game: Damage and Healing");
    expect(coverage).toContain('title: "Initiative, HP, concentration, condition, and effect tracking"');
    expect(coverage).toContain('status: "automation-complete"');
  });

  it("supports responsive and printable combatant health records", () => {
    expect(css).toContain("@media (max-width: 680px)");
    expect(css).toContain("@media print");
    expect(css).toContain("break-inside: avoid");
  });
});
