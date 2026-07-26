import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const read = (path) => readFile(new URL(`../../${path}`, import.meta.url), "utf8");

describe("D&D monster live-reference integration", () => {
  it("connects imported references, action sections, and recharge state", async () => {
    const [tracker, importer, panel, adapter, coverage] = await Promise.all([
      read("src/components/DndEncounterTracker.tsx"),
      read("src/components/DndMonsterEncounterImporter.tsx"),
      read("src/components/DndMonsterLiveReferencePanel.tsx"),
      read("src/utils/dndMonsterLiveReference.ts"),
      read("src/data/rulesCoverageDnd.ts")
    ]);

    expect(tracker).toMatch(/DndMonsterLiveReferencePanel/);
    expect(tracker).toMatch(/setReferences=\{setMonsterReferences\}/);
    expect(importer).toMatch(/buildDndMonsterLiveReference/);
    expect(importer).toMatch(/actions: liveReference\.actions\.map/);
    expect(panel).toMatch(/Roll recharge d6/);
    expect(panel).toMatch(/spendDndTurnResource/);
    expect(adapter).toMatch(/reference\.allActions/);
    expect(adapter).toMatch(/reference\.bonusActions/);
    expect(adapter).toMatch(/reference\.reactions/);
    expect(adapter).toMatch(/reference\.legendaryActions/);
    expect(coverage).toMatch(/complete action sections/);
    expect(coverage).toMatch(/independent per-copy recharge state/);
  });
});