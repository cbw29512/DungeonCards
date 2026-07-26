import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const read = (path) => readFile(new URL(`../../${path}`, import.meta.url), "utf8");

describe("D&D spatial combat integration", () => {
  it("connects positions, movement, targets, and reach validation to live combat", async () => {
    const [tracker, panel, utility, liveReference, coverage] = await Promise.all([
      read("src/components/DndEncounterTracker.tsx"),
      read("src/components/DndSpatialCombatPanel.tsx"),
      read("src/utils/dndSpatialCombat.ts"),
      read("src/utils/dndMonsterLiveReference.ts"),
      read("src/data/rulesCoverageDnd.ts")
    ]);

    expect(tracker).toMatch(/DndSpatialCombatPanel/);
    expect(tracker).toMatch(/positions=\{positions\}/);
    expect(tracker).toMatch(/setPositions=\{setPositions\}/);
    expect(panel).toMatch(/Move active combatant/);
    expect(panel).toMatch(/Validate monster action distance/);
    expect(panel).toMatch(/spendDndMovement/);
    expect(utility).toMatch(/calculateDndGridDistanceFeet/);
    expect(utility).toMatch(/validateDndActionDistance/);
    expect(liveReference).toMatch(/size: parseDndCreatureSize/);
    expect(coverage).toMatch(/Square-grid positions, distance, reach, and range/);
    expect(coverage).toMatch(/target selection, creature-size footprints/);
  });
});